const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const pagesDirectory = path.resolve(process.cwd(), 'test-pages');

http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    const filename = path.resolve(pagesDirectory, `.${pathname}`);

    if (!filename.startsWith(`${pagesDirectory}${path.sep}`)) {
        response.writeHead(400).end('Invalid path');
        return;
    }

    fs.readFile(filename, (error, content) => {
        if (error) {
            response.writeHead(404).end('Not found');
            return;
        }

        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(content);
    });
}).listen(8081, '127.0.0.1');
