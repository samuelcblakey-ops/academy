// Tiny static server for the web tests: serves dist/ and swaps in a demo Firebase config
// so the app talks to the local emulators instead of the real project.
const http = require('http'), fs = require('fs'), path = require('path');
const DIST = path.join(__dirname, '..', 'dist');
const DEMO = 'export const firebaseConfig = { apiKey: "demo-key", authDomain: "demo-carreau.firebaseapp.com", projectId: "demo-carreau", appId: "1:1:web:1" };';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
module.exports = (port) => new Promise(res => {
  const srv = http.createServer((req, rsp) => {
    let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html';
    if (u === '/firebase-config.js') { rsp.writeHead(200, { 'content-type': 'text/javascript' }); return rsp.end(DEMO); }
    fs.readFile(path.join(DIST, path.normalize(u)), (err, body) => {
      if (err) { rsp.writeHead(404); return rsp.end('not found'); }
      rsp.writeHead(200, { 'content-type': types[path.extname(u)] || 'text/plain' }); rsp.end(body);
    });
  }).listen(port, '127.0.0.1', () => res(srv));
});
