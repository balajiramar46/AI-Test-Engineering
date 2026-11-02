import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { MarkdownApiTestCase, MarkdownApiTestCaseSchema, TestSpec, TestSpecSchema } from './TestSpecSchema';

/** Parses the deterministic Markdown test-case format into the framework's TestSpec. */
export class MarkdownTestCaseParser {
    constructor(
        private readonly workflowsDirectory: string = path.resolve(__dirname, '../../test-workflows'),
        private readonly casesDirectory: string = path.resolve(__dirname, '../../test-cases')
    ) {}

    /** Expands an Examples table or referenced JSON/CSV data file into independent cases. */
    parseAll(markdown: string, sourcePath?: string): Array<TestSpec | MarkdownApiTestCase> {
        const lines = markdown.split(/\r?\n/);
        const examplesHeading = lines.findIndex(line => /^##\s+Examples\s*$/i.test(line.trim()));
        const dataFileHeading = lines.findIndex(line => /^##\s+Data File\s*$/i.test(line.trim()));
        if (examplesHeading >= 0 && dataFileHeading >= 0) {
            throw new Error('Use either an Examples table or a Data File section, not both.');
        }
        if (examplesHeading < 0 && dataFileHeading < 0) return [this.parse(markdown)];

        const sectionStart = examplesHeading >= 0 ? examplesHeading : dataFileHeading;
        let sectionEnd = sectionStart + 1;
        while (sectionEnd < lines.length && !/^##\s+/.test(lines[sectionEnd].trim())) sectionEnd++;

        let rows: Array<Record<string, string>>;
        if (examplesHeading >= 0) {
            const tableLines = lines.slice(sectionStart + 1, sectionEnd)
            .map(line => line.trim())
            .filter(Boolean);
            if (tableLines.length < 3) {
                throw new Error('Examples section requires a Markdown table with a header, separator, and at least one data row.');
            }

            const cells = (line: string): string[] => {
                const content = line.replace(/^\|/, '').replace(/\|$/, '');
                return content.split('|').map(cell => cell.trim());
            };
            rows = this.createRows(cells(tableLines[0]), tableLines.slice(2).map(cells), 'Examples');
            if (cells(tableLines[1]).some(separator => !/^:?-{3,}:?$/.test(separator))) {
                throw new Error('Examples table requires a valid Markdown separator row beneath its headers.');
            }
            if (cells(tableLines[1]).length !== Object.keys(rows[0]).length) {
                throw new Error('Examples table separator must have one column for each header.');
            }
        } else {
            const relativeDataPath = lines.slice(sectionStart + 1, sectionEnd).join('\n').trim();
            if (!relativeDataPath) throw new Error('Data File section must contain a relative .json or .csv file path.');
            if (path.isAbsolute(relativeDataPath)) throw new Error('Data File path must be relative to the Markdown file.');

            const baseDirectory = path.resolve(this.casesDirectory);
            const sourceDirectory = sourcePath ? path.dirname(path.resolve(sourcePath)) : baseDirectory;
            const dataPath = path.resolve(sourceDirectory, relativeDataPath);
            if (dataPath !== baseDirectory && !dataPath.startsWith(`${baseDirectory}${path.sep}`)) {
                throw new Error('Data File must resolve to a file inside the test-cases directory.');
            }
            if (!fs.existsSync(dataPath) || !fs.statSync(dataPath).isFile()) {
                throw new Error(`Data File was not found: ${dataPath}`);
            }
            const fileContent = fs.readFileSync(dataPath, 'utf8');
            const extension = path.extname(dataPath).toLowerCase();
            if (extension === '.json') rows = this.parseJsonRows(fileContent, dataPath);
            else if (extension === '.csv') rows = this.parseCsvRows(fileContent, dataPath);
            else throw new Error('Data File must use the .json or .csv extension.');
        }

        const baseMarkdown = [...lines.slice(0, sectionStart), ...lines.slice(sectionEnd)].join('\n');
        const title = baseMarkdown.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();

        return rows.map((row, rowIndex) => {
            const expanded = baseMarkdown.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_placeholder, name: string) => {
                if (!(name in row)) throw new Error(`Data row ${rowIndex + 1} is missing value for placeholder "${name}".`);
                return row[name];
            });

            // Keep test titles unique even when the title template does not include a data placeholder.
            const expandedTitle = title && !/\{\{\s*[\w-]+\s*\}\}/.test(title)
                ? `${title} - ${Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ')}`
                : undefined;
            const titledMarkdown = expandedTitle
                ? expanded.replace(/^#\s+.+\s*$/m, `# ${expandedTitle}`)
                : expanded;
            return this.parse(titledMarkdown);
        });
    }

    private createRows(headers: string[], valuesByRow: string[][], label: string): Array<Record<string, string>> {
        if (headers.length === 0 || headers.some(header => !/^[a-zA-Z][\w-]*$/.test(header)) || new Set(headers).size !== headers.length) {
            throw new Error(`${label} data headers must be unique names, such as product or expectedText.`);
        }
        const rows = valuesByRow.map((values, rowIndex) => {
            if (values.length !== headers.length) {
                throw new Error(`${label} row ${rowIndex + 1} has ${values.length} values; expected ${headers.length}.`);
            }
            return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
        });
        if (rows.length === 0) throw new Error(`${label} data must contain at least one row.`);
        return rows;
    }

    private parseJsonRows(content: string, filePath: string): Array<Record<string, string>> {
        let parsed: unknown;
        try { parsed = JSON.parse(content); }
        catch (error) { throw new Error(`Data File ${filePath} contains invalid JSON: ${String(error)}`); }
        if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
            throw new Error(`JSON Data File ${filePath} must contain a non-empty array of objects.`);
        }
        const headers = Object.keys(parsed[0]);
        const values = parsed.map((row, index) => {
            const record = row as Record<string, unknown>;
            if (Object.keys(record).length !== headers.length || headers.some(header => !(header in record))) {
                throw new Error(`JSON data row ${index + 1} in ${filePath} must use the same fields as the first row.`);
            }
            return headers.map(header => {
                const value = record[header];
                if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
                    throw new Error(`JSON data value "${header}" in row ${index + 1} must be a string, number, boolean, or null.`);
                }
                return value === null ? '' : String(value);
            });
        });
        return this.createRows(headers, values, 'JSON');
    }

    private parseCsvRows(content: string, filePath: string): Array<Record<string, string>> {
        const records: string[][] = [];
        let record: string[] = [];
        let field = '';
        let quoted = false;
        for (let index = 0; index < content.length; index++) {
            const char = content[index];
            if (quoted) {
                if (char === '"' && content[index + 1] === '"') { field += '"'; index++; }
                else if (char === '"') quoted = false;
                else field += char;
            } else if (char === '"' && field.length === 0) quoted = true;
            else if (char === ',') { record.push(field.trim()); field = ''; }
            else if (char === '\n' || char === '\r') {
                if (char === '\r' && content[index + 1] === '\n') index++;
                record.push(field.trim());
                if (record.some(value => value.length > 0)) records.push(record);
                record = []; field = '';
            } else field += char;
        }
        if (quoted) throw new Error(`CSV Data File ${filePath} contains an unclosed quoted field.`);
        if (field.length > 0 || record.length > 0) { record.push(field.trim()); records.push(record); }
        if (records.length < 2) throw new Error(`CSV Data File ${filePath} needs a header and at least one data row.`);
        const headers = records[0].map(header => header.replace(/^\uFEFF/, '').trim());
        return this.createRows(headers, records.slice(1), 'CSV');
    }

    parse(markdown: string): TestSpec | MarkdownApiTestCase {
        const title = markdown.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
        const sections = new Map<string, string[]>();
        let currentSection = '';
        for (const line of markdown.split(/\r?\n/)) {
            const heading = line.match(/^##\s+(.+?)\s*$/);
            if (heading) {
                currentSection = heading[1].toLowerCase();
                sections.set(currentSection, []);
            } else if (currentSection) {
                sections.get(currentSection)!.push(line);
            }
        }
        const section = (name: string): string => (sections.get(name.toLowerCase()) ?? []).join('\n').trim();

        if (sections.has('api url')) {
            return this.parseApiCase(title, section);
        }

        let url = this.resolveEnvironmentUrl(section('App URL').split(/\r?\n/)[0]?.trim() ?? '', 'App URL');
        if (url?.startsWith('local:')) {
            const fixturePath = url.slice('local:'.length).replace(/^[/\\]+/, '');
            url = pathToFileURL(path.resolve(process.cwd(), fixturePath)).href;
        }
        const instruction = section('Prompt');
        const workflowActions = this.parseWorkflowActions(section('Workflow'), section('Parameters'));
        const actionLines = section('Actions').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const assertionLines = section('Expected').split(/\r?\n/).map(line => line.trim()).filter(Boolean);

        let actions = [...workflowActions, ...this.parseActions(actionLines)];

        if (actions.length === 0) {
            const search = instruction.match(/\bsearch\s+(?:for\s+)?["“]?([^"”?.!,]+?)["”]?(?:\s+and\b|[.?!,]|$)/i);
            if (!search) {
                throw new Error('No Actions were provided, and the Prompt is not a supported deterministic intent. Add Actions, reuse a workflow, or use a prompt such as "Search for laptops".');
            }
            const query = search[1].trim().replace(/^(?:a|an|the)\s+/i, '');
            if (!query) throw new Error('The search prompt must include a search term.');
            actions = [
                { action: 'fill', target: { category: 'input', intent: 'search' }, inputValue: query },
                { action: 'press', target: { category: 'keyboard' }, inputValue: 'Enter' }
            ];
        }

        const assertions = assertionLines.map((line, index) => {
            const textMatch = line.match(/^-\s+text-visible:\s*"((?:[^"\\]|\\.)*)"\s*$/i);
            if (textMatch) return { type: 'textVisible' as const, text: textMatch[1] };
            const urlMatch = line.match(/^-\s+url:\s*"((?:[^"\\]|\\.)*)"\s*$/i);
            if (urlMatch) return { type: 'url' as const, expected: urlMatch[1] };
            const valueMatch = line.match(/^-\s+value:\s*(.+?)\s+equals\s+"((?:[^"\\]|\\.)*)"\s*$/i);
            if (valueMatch) return { type: 'value' as const, selector: valueMatch[1].trim(), expected: valueMatch[2] };
            const countMatch = line.match(/^-\s+count:\s*(.+?)\s+equals\s+(\d+)\s*$/i);
            if (countMatch) return { type: 'count' as const, selector: countMatch[1].trim(), expected: Number(countMatch[2]) };
            const stateMatch = line.match(/^-\s+(enabled|disabled):\s*(.+)$/i);
            if (stateMatch) return { type: stateMatch[1].toLowerCase() as 'enabled' | 'disabled', selector: stateMatch[2].trim() };
            throw new Error(`Markdown expected-result line ${index + 1} is invalid: ${line}`);
        });

        const tags = section('Tags').split(/\r?\n/).map(line => line.trim().replace(/^-\s*/, '').replace(/^@/, '')).filter(Boolean);
        const parsed = TestSpecSchema.safeParse({ title, instruction, url, tags, actions, assertions });
        if (!parsed.success) {
            throw new Error(`Invalid Markdown test case: ${parsed.error.message}`);
        }
        return parsed.data;
    }

    private parseActions(actionLines: string[]): TestSpec['actions'] {
        return actionLines.map((line, index) => {
            const pageObjectMatch = line.match(/^-\s+call\s+(ProductSearchPage)\.(searchFor|openProduct|addToCart)(?:\s+with\s+"((?:[^"\\]|\\.)*)")?\s*$/i);
            if (pageObjectMatch) {
                const [, pageObject, method, inputValue] = pageObjectMatch;
                return {
                    action: 'pageObject',
                    target: { category: 'pageObject', pageObject, method },
                    ...(inputValue === undefined ? {} : { inputValue: inputValue.replace(/\\"/g, '"').replace(/\\\\/g, '\\') })
                };
            }
            const keyMatch = line.match(/^-\s+(?:press|click)\s+(enter|tab|escape|space|backspace|delete|arrowup|arrowdown|arrowleft|arrowright)\s*$/i);
            if (keyMatch) {
                const keyName = keyMatch[1].toLowerCase();
                const key = keyName.startsWith('arrow')
                    ? `Arrow${keyName.slice('arrow'.length, keyName.length).replace(/^./, letter => letter.toUpperCase())}`
                    : keyName[0].toUpperCase() + keyName.slice(1);
                return { action: 'press', target: { category: 'keyboard' }, inputValue: key };
            }

            const match = line.match(/^-\s+(click|fill|check|uncheck|select)\s+([\w-]+)(.*)$/i);
            if (!match) throw new Error(`Markdown action line ${index + 1} is invalid: ${line}`);

            const [, action, category, rawArguments] = match;
            const inputMatch = rawArguments.match(/\s+with\s+"((?:[^"\\]|\\.)*)"\s*$/i);
            const targetText = inputMatch
                ? rawArguments.slice(0, inputMatch.index).trim()
                : rawArguments.trim();
            const target: Record<string, string> = { category };
            const attributePattern = /([\w]+)="((?:[^"\\]|\\.)*)"/g;
            let attribute: RegExpExecArray | null;
            while ((attribute = attributePattern.exec(targetText)) !== null) {
                const [, key, value] = attribute;
                if (!['text', 'value', 'id', 'name', 'placeholder', 'ariaLabel', 'title', 'intent'].includes(key)) {
                    throw new Error(`Unsupported target attribute "${key}" in: ${line}`);
                }
                target[key] = value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            if (Object.keys(target).length === 1) {
                throw new Error(`Action requires a target attribute such as text, id, name, or placeholder: ${line}`);
            }

            return {
                action: action.toLowerCase(),
                target,
                ...(inputMatch ? { inputValue: inputMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') } : {})
            };
        }) as TestSpec['actions'];
    }

    private parseWorkflowActions(workflowsSection: string, parametersSection: string): TestSpec['actions'] {
        if (!workflowsSection) return [];
        const parameters = new Map<string, string>();
        for (const line of parametersSection.split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
            const match = line.match(/^-\s*([\w-]+):\s*(.+)$/);
            if (!match) throw new Error(`Invalid Markdown parameter: ${line}`);
            const [, name, rawValue] = match;
            const valueText = rawValue.trim();
            let value = valueText;
            try {
                const parsed: unknown = JSON.parse(valueText);
                value = String(parsed);
            } catch { /* Unquoted parameter values are strings. */ }
            parameters.set(name, value.replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
        }

        const actions: TestSpec['actions'][number][] = [];
        const workflowNames = workflowsSection.split(/\r?\n/).map(line => {
            const match = line.trim().match(/^-\s*([\w-]+)\s*$/);
            if (!match) throw new Error(`Invalid workflow reference: ${line}`);
            return match[1];
        }).filter(Boolean);

        for (const name of workflowNames) {
            const workflowPath = path.resolve(this.workflowsDirectory, `${name}.md`);
            if (!workflowPath.startsWith(`${path.resolve(this.workflowsDirectory)}${path.sep}`)) {
                throw new Error(`Invalid workflow name: ${name}`);
            }
            if (!fs.existsSync(workflowPath)) {
                throw new Error(`Workflow "${name}" was not found at ${workflowPath}`);
            }
            const content = fs.readFileSync(workflowPath, 'utf8');
            const actionsSection: string[] = [];
            let readingActions = false;
            for (const line of content.split(/\r?\n/)) {
                const heading = line.match(/^##\s+(.+?)\s*$/);
                if (heading) {
                    if (readingActions) break;
                    readingActions = heading[1].toLowerCase() === 'actions';
                } else if (readingActions) {
                    actionsSection.push(line);
                }
            }
            if (actionsSection.length === 0) throw new Error(`Workflow "${name}" must contain an Actions section.`);
            const expandedLines = actionsSection.map(line => line.trim()).filter(Boolean).map(line =>
                line.replace(/\{\{([\w-]+)\}\}/g, (_placeholder, key: string) => {
                    const value = parameters.get(key);
                    if (value === undefined) throw new Error(`Workflow "${name}" requires parameter "${key}".`);
                    return value;
                })
            );
            actions.push(...this.parseActions(expandedLines));
        }
        return actions;
    }

    private parseApiCase(
        title: string | undefined,
        section: (name: string) => string
    ): MarkdownApiTestCase {
        const mode = (section('Mode') || 'mock').toLowerCase();
        let mockStatus: number | undefined;
        let mockBody: unknown;
        if (mode === 'mock') {
            const mockSection = section('Mock Response');
            const status = mockSection.match(/^Status:\s*(\d{3})\s*$/im)?.[1];
            const json = mockSection.match(/```json\s*([\s\S]*?)```/i)?.[1];
            if (!status || !json) throw new Error('Mock API Markdown requires Mock Response with Status: NNN and a ```json``` body.');
            mockStatus = Number(status);
            try { mockBody = JSON.parse(json); }
            catch { throw new Error('Mock Response contains invalid JSON.'); }
        } else if (mode !== 'real') {
            throw new Error('API Mode must be "mock" or "real".');
        }

        const expected = section('Expected');
        const expectedStatus = expected.match(/^\s*-\s*status:\s*(\d{3})\s*$/im)?.[1];
        if (!expectedStatus) throw new Error('API Expected section requires a - status: NNN assertion.');

        const expectedJson: Array<{ path: string; operator: 'equals' | 'contains'; value: unknown }> = [];
        for (const line of expected.split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
            if (/^-\s*status:/i.test(line)) continue;
            const match = line.match(/^-\s*json\.([\w.]+)\s+(equals|contains):\s*(.+)$/i);
            if (!match) throw new Error(`Invalid API Expected assertion: ${line}`);
            const [, path, operator, rawValue] = match;
            const valueText = rawValue.trim();
            let value: unknown = valueText;
            try { value = JSON.parse(valueText); } catch { /* Unquoted values are strings. */ }
            expectedJson.push({ path, operator: operator.toLowerCase() as 'equals' | 'contains', value });
        }

        const requestBodyText = section('Request Body');
        let requestBody: unknown;
        if (requestBodyText) {
            const requestJson = requestBodyText.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? requestBodyText;
            try { requestBody = JSON.parse(requestJson); }
            catch { throw new Error('Request Body must contain valid JSON.'); }
        }

        const headers: Record<string, string> = {};
        for (const line of section('Headers').split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
            const headerMatch = line.match(/^-?\s*([^:]+):\s*(.+)$/);
            if (!headerMatch) throw new Error(`Invalid API header line: ${line}`);
            headers[headerMatch[1].trim()] = headerMatch[2].trim().replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_match, name: string) => {
                const value = process.env[name];
                if (!value) throw new Error(`Environment variable ${name} is required by API header "${headerMatch[1]}".`);
                return value;
            });
        }
        const tags = section('Tags').split(/\r?\n/).map(line => line.trim().replace(/^-\s*/, '').replace(/^@/, '')).filter(Boolean);

        const parsed = MarkdownApiTestCaseSchema.safeParse({
            kind: 'api',
            mode,
            title,
            instruction: section('Prompt'),
            url: this.resolveEnvironmentUrl(section('API URL').split(/\r?\n/)[0]?.trim() ?? '', 'API URL'),
            tags,
            method: (section('Method') || 'GET').toUpperCase(),
            headers,
            ...(requestBodyText ? { requestBody } : {}),
            ...(mockStatus === undefined ? {} : { mockStatus }),
            ...(mockBody === undefined ? {} : { mockBody }),
            expectedStatus: Number(expectedStatus),
            expectedJson
        });
        if (!parsed.success) throw new Error(`Invalid API Markdown case: ${parsed.error.message}`);
        return parsed.data;
    }

    private resolveEnvironmentUrl(value: string, sectionName: string): string {
        const match = value.match(/^env:([A-Z_][A-Z0-9_]*)(?:\/(.*))?$/i);
        if (!match) return value;
        const [, name, relativePath = ''] = match;
        const baseUrl = process.env[name];
        if (!baseUrl) throw new Error(`${sectionName} uses env:${name}, but environment variable ${name} is not set.`);
        try {
            const base = new URL(baseUrl);
            if (!['http:', 'https:'].includes(base.protocol)) throw new Error('Use an http or https URL.');
            return new URL(relativePath, base.toString().endsWith('/') ? base : `${base}/`).toString();
        } catch (error) {
            throw new Error(`Environment variable ${name} must contain a valid base URL. ${String(error)}`);
        }
    }
}
