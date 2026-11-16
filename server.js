import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 8080;
const ROOT = path.resolve(__dirname);
const SAFE_ROOT = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;

// Whitelist of allowed static file extensions
const ALLOWED_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.onnx': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Add Cross-Origin isolation headers for WebGPU & WebCodecs high performance
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let rawPath = req.url.split('?')[0].split('#')[0];
  let cleanUrl;
  try {
    cleanUrl = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  if (cleanUrl === '/' || cleanUrl === '') cleanUrl = '/index.html';

  const filePath = path.normalize(path.join(ROOT, cleanUrl));

  // Security Check 1: Enforce directory traversal boundary
  if (!filePath.startsWith(SAFE_ROOT) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Path traversal detected');
    return;
  }

  // Security Check 2: File extension whitelist (prohibit downloading .bat, .env, .git, etc.)
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ALLOWED_MIME[ext];
  if (!contentType) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: File type not permitted');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // Support HTTP Range requests safely for heavy ONNX models and video chunks
    const range = req.headers.range;
    if (range) {
      const match = range.match(/bytes=(\d*)-(\d*)/);
      if (!match) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        res.end();
        return;
      }

      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : stats.size - 1;

      if (isNaN(start) || isNaN(end) || start < 0 || end >= stats.size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        res.end();
        return;
      }

      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', (streamErr) => {
        console.error('Range stream error:', streamErr.message);
        if (!res.headersSent) { res.writeHead(500); }
        res.end();
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      const stream = fs.createReadStream(filePath);
      stream.on('error', (streamErr) => {
        console.error('File stream error:', streamErr.message);
        if (!res.headersSent) { res.writeHead(500); }
        res.end();
      });
      stream.pipe(res);
    }
  });
});

process.on('uncaughtException', (err) => {
  console.error('Server Uncaught Exception:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sports HUD Node Server running at http://localhost:${PORT}/ and http://0.0.0.0:${PORT}/`);
});
