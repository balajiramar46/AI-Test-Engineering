import * as fs from 'node:fs';
import * as path from 'node:path';
import { MarkdownTestCaseParser } from './MarkdownTestCaseParser';

/** Converts each authored Markdown case into an ignored Playwright spec before test discovery. */
export function generateMarkdownSpecs(casesDirectory: string, outputDirectory: string): void {
    fs.mkdirSync(outputDirectory, { recursive: true });
    const expectedFiles = new Map<string, string>();
    if (fs.existsSync(casesDirectory)) {
        const parser = new MarkdownTestCaseParser(undefined, casesDirectory);
        const files = fs.readdirSync(casesDirectory)
            .filter(file => file.toLowerCase().endsWith('.md'))
            .sort();

        for (const file of files) {
            const markdownPath = path.join(casesDirectory, file);
            const parsedCases = parser.parseAll(fs.readFileSync(markdownPath, 'utf8'), markdownPath);
            const caseLiteral = JSON.stringify(parsedCases, null, 4);
            const firstCase = parsedCases[0];
            const isRealApi = 'kind' in firstCase && firstCase.kind === 'api' && firstCase.mode === 'real';
            const generated = [
                "import { test } from '@playwright/test';",
                "import { MarkdownCase, runMarkdownCase } from '../src/runner/MarkdownCaseRunner';",
                '',
                `const testCases = ${caseLiteral} as MarkdownCase[];`,
                'for (const testCase of testCases) {',
                isRealApi
                    ? `    test(testCase.title, { tag: testCase.tags.map(tag => \`@${'${tag}'}\`) }, async ({ request }) => {`
                    : `    test(testCase.title, { tag: testCase.tags.map(tag => \`@${'${tag}'}\`) }, async ({ page, request }) => {`,
                `        await runMarkdownCase(${isRealApi ? 'undefined' : 'page'}, request, testCase);`,
                '    });',
                '}',
                ''
            ].join('\n');
            const specName = `${path.basename(file, path.extname(file))}.spec.ts`;
            expectedFiles.set(specName, generated);
        }
    }

    const lockPath = path.join(outputDirectory, '.generation.lock');
    const lockFd = acquireLock(lockPath);
    try {
        for (const entry of fs.readdirSync(outputDirectory, { withFileTypes: true })) {
            if (entry.isFile() && entry.name.endsWith('.spec.ts') && !expectedFiles.has(entry.name)) {
                fs.unlinkSync(path.join(outputDirectory, entry.name));
            }
        }
        for (const [name, content] of expectedFiles) {
            const filePath = path.join(outputDirectory, name);
            if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) continue;
            const tempPath = `${filePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
            fs.writeFileSync(tempPath, content, 'utf8');
            fs.renameSync(tempPath, filePath);
        }
    } finally {
        fs.closeSync(lockFd);
        fs.unlinkSync(lockPath);
    }
}

function acquireLock(lockPath: string): number {
    const started = Date.now();
    const waitCell = new Int32Array(new SharedArrayBuffer(4));
    while (true) {
        try {
            const fd = fs.openSync(lockPath, 'wx');
            fs.writeSync(fd, String(process.pid));
            return fd;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
            try {
                const ownerPid = Number(fs.readFileSync(lockPath, 'utf8'));
                if (Number.isInteger(ownerPid) && ownerPid > 0) {
                    try { process.kill(ownerPid, 0); }
                    catch { fs.unlinkSync(lockPath); continue; }
                }
            } catch (readError) {
                if ((readError as NodeJS.ErrnoException).code === 'ENOENT') continue;
            }
            if (Date.now() - started > 30_000) throw new Error('Timed out waiting for Markdown spec generation lock.');
            Atomics.wait(waitCell, 0, 0, 10);
        }
    }
}
