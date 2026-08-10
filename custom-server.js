#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// สำหรับ standalone mode
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Handle static assets สำหรับ standalone mode
      if (pathname.startsWith('/assets/') || 
          pathname.startsWith('/favicon/') || 
          pathname.startsWith('/fonts/') || 
          pathname.startsWith('/logo/') ||
          pathname.startsWith('/src/assets/') ||
          pathname.startsWith('/_next/static/')) {
        
        // ใน standalone mode ไฟล์จะอยู่ใน public directory
        const filePath = path.join(__dirname, 'public', pathname);
        
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
              '.ico': 'image/x-icon',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.css': 'text/css',
              '.js': 'application/javascript',
              '.woff': 'font/woff',
              '.woff2': 'font/woff2',
              '.ttf': 'font/ttf',
              '.otf': 'font/otf'
            };
            
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            return;
          }
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
