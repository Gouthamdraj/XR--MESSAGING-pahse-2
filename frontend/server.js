// frontend/server.js
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.FRONTEND_PORT || 3000;
const HUB = process.env.HUB_URL || 'http://localhost:8080';

const app = express();

// 1) Proxy Socket.IO HTTP + WebSocket from 3000 → 8080
const sioProxy = createProxyMiddleware('/socket.io', {
  target: HUB,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
});
app.use(sioProxy);

// 2) Static assets and explicit view routes (clean layout)
const VIEWS_DIR = path.join(__dirname, 'views');
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use('/public', express.static(PUBLIC_DIR));

const sendView = (name) => (_req, res) => res.sendFile(path.join(VIEWS_DIR, name));
const sendPublic = (name) => (_req, res) => res.sendFile(path.join(PUBLIC_DIR, name));

// PWA top-level files (keep at root paths)
app.get('/manifest.webmanifest', sendPublic('manifest.webmanifest'));
// ✅ Fix: alias /sw.js → use existing file public/js/sw-device.js
app.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(PUBLIC_DIR, 'js', 'sw-device.js'));
});

// PWA (Device-only) files
app.get('/device.webmanifest', (req, res) => {
  res.type('webmanifest');
  res.sendFile(path.join(PUBLIC_DIR, 'device.webmanifest'));
});

app.get('/device/sw.js', (req, res) => {
  // scope service worker to /device/
  res.set('Service-Worker-Allowed', '/device/');
  res.type('application/javascript');
  res.sendFile(path.join(PUBLIC_DIR, 'js', 'sw-device.js'));
});

// (Optional) keep HTML fresh (no caching) – safe for XR flows
app.use((req, res, next) => {
  if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

// Pretty routes → map extensionless paths to the view files
app.get(['/device', '/device/'], sendView('device.html'));
app.get(['/dashboard', '/dashboard/'], sendView('dashboard.html'));
app.get(['/scribe-cockpit', '/scribe-cockpit/'], sendView('scribe-cockpit.html'));
// (optional legacy)
app.get(['/operator', '/operator/'], sendView('operator.html'));

// Block direct .html access (so /device.html etc. 404)
app.get('/*.html', (_req, res) => res.status(404).send('Not found'));


// 3) Root route → views/index.html (Dock UI)
app.get('/', sendView('index.html'));

// 4) Start server
const server = app.listen(PORT, () => {
  console.log(`🟢 Frontend running at http://localhost:${PORT}`);
  console.log(`↪  Proxy /socket.io → ${HUB}/socket.io`);
});

// 5) IMPORTANT: attach 'upgrade' so WebSocket proxy works
server.on('upgrade', sioProxy.upgrade);
