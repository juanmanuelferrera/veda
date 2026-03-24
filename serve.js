#!/usr/bin/env node
// V.E.D.A. — Simple static file server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8080;
const DIR = path.join(__dirname, 'web', 'public');

const MIME = {
    '.html': 'text/html', '.js': 'application/javascript',
    '.json': 'application/json', '.css': 'text/css',
    '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
    let file = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
    console.log(`V.E.D.A. running at http://localhost:${PORT}`);
});
