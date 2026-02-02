const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 5173);
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safeResolveUrlToFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = decoded.replace(/\0/g, '');
  const joined = path.join(ROOT, clean);
  const resolved = path.resolve(joined);
  if (!resolved.startsWith(path.resolve(ROOT))) return null;
  return resolved;
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = safeResolveUrlToFile(urlPath);
  if (!filePath) {
    return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    if (method === 'HEAD') {
      return send(res, 200, '', { 'Content-Type': contentType, 'Content-Length': stat.size });
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        return send(res, 500, 'Server Error', { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      send(res, 200, data, { 'Content-Type': contentType });
    });
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${ROOT}`);
  // eslint-disable-next-line no-console
  console.log(`Open http://localhost:${PORT}/`);
});
