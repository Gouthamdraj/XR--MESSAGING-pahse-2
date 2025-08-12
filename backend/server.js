// // const express = require('express');
// // const http = require('http');
// // const path = require('path');
// // const fs = require('fs');
// // const cors = require('cors');
// // const { Server } = require('socket.io');
// // require('dotenv').config();

// // console.log('[INIT] Starting server initialization...');

// // // Configuration
// // const PORT = process.env.PORT || 8080;
// // console.log(`[CONFIG] Using port: ${PORT}`);

// // const app = express();
// // const server = http.createServer(app);
// // console.log('[HTTP] Server created');

// // const io = new Server(server, {
// //   cors: { origin: '*', methods: ['GET', 'POST'] }
// // });
// // console.log('[SOCKET.IO] Socket.IO server initialized');

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // console.log('[MIDDLEWARE] CORS and JSON middleware applied');

// // // Static file handling
// // const staticPaths = [
// //   path.join(__dirname, 'public'),
// //   path.join(__dirname, '../frontend')
// // ];

// // console.log('[STATIC] Checking for static paths...');
// // let staticPathFound = null;
// // staticPaths.forEach((dir) => {
// //   if (fs.existsSync(dir)) {
// //     app.use(express.static(dir));
// //     staticPathFound = dir;
// //     console.log(`[STATIC] Serving from ${dir}`);
// //   }
// // });
// // if (!staticPathFound) {
// //   console.warn('⚠️ [STATIC] No static path found.');
// // }

// // // TURN injection into HTML
// // function injectTurnConfig(html) {
// //   console.log('[TURN] Injecting TURN configuration into HTML');
// //   const configScript = `
// //     <script>
// //       window.TURN_CONFIG = {
// //         urls: '${process.env.TURN_URL || ''}',
// //         username: '${process.env.TURN_USERNAME || ''}',
// //         credential: '${process.env.TURN_CREDENTIAL || ''}'
// //       };
// //     </script>
// //   `;
// //   return html.replace('</body>', `${configScript}\n</body>`);
// // }

// // // HTTP routes
// // app.get('/health', (req, res) => {
// //   console.log('[HEALTH] Health check requested');
// //   res.status(200).json({
// //     status: 'healthy',
// //     timestamp: new Date().toISOString(),
// //     connectedClients: clients.size
// //   });
// // });

// // app.get('/', (req, res) => {
// //   console.log('[ROUTE] Serving root path');
// //   if (!staticPathFound) {
// //     console.warn('[ROUTE] Static path not found for root');
// //     return res.status(404).send('Static not found');
// //   }
// //   const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
// //   res.send(injectTurnConfig(html));
// // });

// // app.get('*', (req, res) => {
// //   console.log(`[ROUTE] Catch-all route for: ${req.path}`);
// //   if (!staticPathFound) {
// //     console.warn('[ROUTE] Static path not found for catch-all');
// //     return res.status(404).send('Static not found');
// //   }
// //   const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
// //   res.send(injectTurnConfig(html));
// // });

// // // Socket.IO logic
// // const clients = new Map();         // xrId → socket
// // const desktopClients = new Map();  // xrId → socket
// // const messageHistory = [];
// // console.log('[SOCKET.IO] Data structures initialized');

// // function buildDeviceList() {
// //   return [...clients.entries()].map(([xrId, s]) => ({
// //     xrId,
// //     deviceName: s?.data?.deviceName || 'Unknown'
// //   }));
// // }


// // function broadcastDeviceList() {
// //   console.log('[DEVICE_LIST] Broadcasting device list');
// //   const deviceList = Array.from(clients.entries()).map(([xrId, socket]) => ({
// //     xrId,
// //     deviceName: socket.data.deviceName || 'Unknown'
// //   }));
// //   io.emit('device_list', deviceList); // emit array of { deviceName, xrId }
// // }

// // function logCurrentDevices() {
// //   console.log('[DEVICES] Current connected devices:');
// //   if (clients.size === 0) {
// //     console.log('   (none)');
// //     return;
// //   }
// //   for (const [xrId, socket] of clients.entries()) {
// //     console.log(`   - ${socket.data.deviceName || 'Unknown'} (${xrId})`);
// //   }
// // }

// // function broadcastToDesktop(type, data) {
// //   console.log(`[BROADCAST] Sending to desktop clients: ${type}`);
// //   for (const socket of desktopClients.values()) {
// //     socket.emit(type, data);
// //   }
// // }

// // function broadcastToTarget(to, type, data) {
// //   console.log(`[TARGET] Sending to ${to}: ${type}`);
// //   const target = clients.get(to);
// //   if (target) {
// //     target.emit(type, data);
// //   } else {
// //     console.warn(`[TARGET] Target not found: ${to}`);
// //   }
// // }

// // function addToMessageHistory(message) {
// //   console.log('[MESSAGE_HISTORY] Adding message to history');
// //   messageHistory.push({
// //     ...message,
// //     id: Date.now(),
// //     timestamp: new Date().toISOString()
// //   });

// //   if (messageHistory.length > 100) {
// //     console.log('[MESSAGE_HISTORY] Trimming message history');
// //     messageHistory.shift();
// //   }
// // }

// // io.on('connection', (socket) => {
// //   console.log(`🔌 [CONNECTION] New connection: ${socket.id}`);

// //   // Send recent message history to new connections
// //   if (messageHistory.length > 0) {
// //     console.log(`[MESSAGE_HISTORY] Sending ${messageHistory.length} messages to new connection`);
// //     socket.emit('message_history', {
// //       type: 'message_history',
// //       messages: messageHistory.slice(-10)
// //     });
// //   }

// //   socket.on('join', (xrId) => {
// //     console.log(`[JOIN] Request from ${socket.id} to join as ${xrId}`);
// //     socket.data.xrId = xrId;
// //     clients.set(xrId, socket);
// //     console.log(`✅ [JOIN] Successfully joined as ${xrId}`);
// //     broadcastDeviceList();
// //     logCurrentDevices();
// //   });

// //   // socket.on('identify', ({ deviceName, xrId }) => {
// //   //   console.log(`[IDENTIFY] Request from ${socket.id}: ${deviceName} (${xrId})`);
// //   //   socket.data.deviceName = deviceName || 'Unknown';
// //   //   socket.data.xrId = xrId;
// //   //   clients.set(xrId, socket);

// //   //   if (deviceName?.toLowerCase().includes('desktop') || xrId === 'XR-1238') {
// //   //     console.log(`[IDENTIFY] Detected desktop client: ${xrId}`);
// //   //     if (desktopClients.has(xrId)) {
// //   //       console.warn(`[IDENTIFY] Duplicate desktop tab detected: ${xrId}`);
// //   //       socket.emit('error', { message: 'Duplicate desktop tab' });
// //   //       socket.disconnect();
// //   //       return;
// //   //     }
// //   //     desktopClients.set(xrId, socket);
// //   //   }

// //   //   console.log(`[IDENTIFY] Successfully identified: ${deviceName} (${xrId})`);
// //   //   broadcastDeviceList();
// //   // });

// //   /////////////////////////////////////////////// Identification and Device Management ///////////////////////////////////////////////
// //    socket.on('identify', ({ deviceName, xrId }) => {
// //   console.log(`[IDENTIFY] Request from ${socket.id}: ${deviceName} (${xrId})`);
// //   socket.data.deviceName = deviceName || 'Unknown';
// //   socket.data.xrId = xrId;
// //   clients.set(xrId, socket);

// //   if (deviceName?.toLowerCase().includes('desktop') || xrId === 'XR-1238') {
// //     console.log(`[IDENTIFY] Detected desktop client: ${xrId}`);
// //     if (desktopClients.has(xrId)) {
// //       console.warn(`[IDENTIFY] Duplicate desktop tab detected: ${xrId}`);
// //       socket.emit('error', { message: 'Duplicate desktop tab' });
// //       socket.disconnect();
// //       return;
// //     }
// //     desktopClients.set(xrId, socket);
// //   }

// //   console.log(`[IDENTIFY] Successfully identified: ${deviceName} (${xrId})`);

// //   // 🔽 NEW: send list to everyone + immediate echo to this client
// //   const list = buildDeviceList();
// //   io.emit('device_list', list);
// //   socket.emit('device_list', list);
// // });


// //   // WebRTC signaling
// //   socket.on('signal', ({ type, from, to, data }) => {
// //     console.log(`📡 [SIGNAL] ${type} signal from ${from} to ${to}`);
// //     // Keep payload shape { type, from, data } — desktop code expects 'data' for offer/ICE
// //     if (!to) {
// //       console.warn(`[SIGNAL] Missing 'to' in signal from ${from}`);
// //       return;
// //     }
// //     broadcastToTarget(to, 'signal', { type, from, data });
// //   });

// //   // Control commands
// //   socket.on('control', ({ command, from, to, message }) => {
// //     console.log(`🎮 [CONTROL] ${command} command from ${from} to ${to || 'all'}`);
// //     const payload = { command, from, message };
// //     if (to) {
// //       broadcastToTarget(to, 'control', payload);
// //     } else {
// //       io.emit('control', payload);
// //     }
// //   });

// //   // Messaging system
// //   socket.on('message', ({ from, to, text, urgent }) => {
// //     console.log(`[MESSAGE] Received message from ${from} to ${to || 'all'}: ${text}`);
// //     const msg = {
// //       type: 'message',
// //       from,
// //       to,
// //       text,
// //       urgent,
// //       sender: socket.data.deviceName || from || 'unknown',
// //       xrId: from,
// //       timestamp: new Date().toISOString()
// //     };

// //     addToMessageHistory(msg);

// //     if (to) {
// //       broadcastToTarget(to, 'message', msg);
// //     } else {
// //       socket.broadcast.emit('message', msg);
// //     }
// //   });

// //   socket.on('clear-messages', ({ by }) => {
// //     console.log(`[CLEAR] Request to clear messages by ${by}`);
// //     const payload = { type: 'message-cleared', by, messageId: Date.now() };
// //     io.emit('message-cleared', payload);
// //   });

// //   socket.on('clear_confirmation', ({ device }) => {
// //     console.log(`[CLEAR_CONFIRM] Confirmation from ${device}`);
// //     const payload = {
// //       type: 'message_cleared',
// //       by: device,
// //       timestamp: new Date().toISOString()
// //     };
// //     broadcastToDesktop('message_cleared', payload);
// //   });

// //   socket.on('status_report', ({ from, status }) => {
// //     console.log(`[STATUS_REPORT] Received from ${from}: ${status}`);
// //     const payload = {
// //       type: 'status_report',
// //       from,
// //       status,
// //       timestamp: new Date().toISOString()
// //     };
// //     broadcastToDesktop('status_report', payload);
// //   });

// //   socket.on('message_history', () => {
// //     console.log(`[MESSAGE_HISTORY] Request from ${socket.id}`);
// //     socket.emit('message_history', {
// //       type: 'message_history',
// //       messages: messageHistory.slice(-10)
// //     });
// //   });

// //   socket.on('disconnect', () => {
// //     const xrId = socket.data.xrId;
// //     if (xrId) {
// //       clients.delete(xrId);
// //       if (desktopClients.get(xrId) === socket) {
// //         desktopClients.delete(xrId);
// //         console.log(`[DISCONNECT] Removed desktop client: ${xrId}`);
// //       }
// //       console.log(`❎ [DISCONNECT] ${socket.data.deviceName || 'Unknown'} (${xrId}) disconnected`);
// //     } else {
// //       console.log(`❎ [DISCONNECT] Anonymous ${socket.id} disconnected`);
// //     }

// //     broadcastDeviceList();
// //     logCurrentDevices();
// //   });

// //   socket.on('error', (err) => {
// //     console.error(`[SOCKET_ERROR] ${socket.id}:`, err);
// //   });
// // });

// // // Start server
// // server.listen(PORT, '0.0.0.0', () => {
// //   console.log(`🚀 [SERVER] Running on http://0.0.0.0:${PORT}`);
// // });

// // // Graceful shutdown
// // process.on('uncaughtException', (err) => {
// //   console.error('[FATAL_ERROR] Uncaught exception:', err);
// // });

// // process.on('SIGINT', shutdown);
// // process.on('SIGTERM', shutdown);

// // function shutdown() {
// //   console.log('\n[SHUTDOWN] Graceful shutdown initiated...');

// //   // Disconnect all sockets
// //   const socketCount = io.sockets.sockets.size;
// //   console.log(`[SHUTDOWN] Disconnecting ${socketCount} sockets...`);
// //   io.sockets.sockets.forEach(socket => {
// //     socket.disconnect(true);
// //   });

// //   // Close Socket.IO
// //   io.close(() => {
// //     console.log('[SHUTDOWN] Socket.IO server closed');

// //     // Close HTTP server
// //     server.close(() => {
// //       console.log('[SHUTDOWN] HTTP server closed');
// //       process.exit(0);
// //     });
// //   });
// // }

// // console.log('[INIT] Server initialization complete');

// // --------------------------------------------refresh--------------------------------------------------

// // -------------------------------------- server.js --------------------------------------
// // -----------------------------------------------
// // backend/server.js (drop-in, multi-instance ready)
// // -----------------------------------------------

// const express = require('express');
// const http = require('http');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const { createClient } = require('redis');
// const { createAdapter } = require('@socket.io/redis-adapter');
// require('dotenv').config();

// // One-time instrumentation: prove which worker you hit
// console.log('[BOOT] Instance:', process.env.WEBSITE_INSTANCE_ID || process.pid);
// console.log('[INIT] Starting server initialization...');

// // Configuration
// const PORT = process.env.PORT || 8080;
// console.log(`[CONFIG] Using port: ${PORT}`);

// const app = express();
// const server = http.createServer(app);
// console.log('[HTTP] Server created');

// const io = new Server(server, {
//   cors: { origin: '*', methods: ['GET', 'POST'] },
//   // keep default Socket.IO path unless clients expect a custom one:
//   // path: '/socket.io'
// });
// console.log('[SOCKET.IO] Socket.IO server initialized');

// // In-memory message history (per instance OK)
// const messageHistory = [];
// console.log('[STATE] Message history initialized');

// // Middleware
// app.use(cors());
// app.use(express.json());
// console.log('[MIDDLEWARE] CORS and JSON middleware applied');

// // Static file handling
// const staticPaths = [
//   path.join(__dirname, 'public'),
//   path.join(__dirname, '../frontend')
// ];

// console.log('[STATIC] Checking for static paths...');
// let staticPathFound = null;
// for (const dir of staticPaths) {
//   if (fs.existsSync(dir)) {
//     app.use(express.static(dir));
//     staticPathFound = dir;
//     console.log(`[STATIC] Serving from ${dir}`);
//   }
// }
// if (!staticPathFound) {
//   console.warn('⚠️ [STATIC] No static path found.');
// }

// // TURN injection into HTML
// function injectTurnConfig(html) {
//   const cfg = `
//     <script>
//       window.TURN_CONFIG = {
//         urls: '${process.env.TURN_URL || ''}',
//         username: '${process.env.TURN_USERNAME || ''}',
//         credential: '${process.env.TURN_CREDENTIAL || ''}'
//       };
//     </script>`;
//   return html.replace('</body>', `${cfg}\n</body>`);
// }

// // -------- Presence helpers (global via adapter) --------
// function roomOf(xrId) {
//   return `xr:${xrId}`;
// }

// // Build device list across ALL instances (thanks to Redis adapter / fetchSockets)
// async function buildDeviceListGlobal() {
//   const sockets = await io.fetchSockets(); // RemoteSocket[] across nodes
//   return sockets
//     .filter(s => s.data && s.data.xrId)
//     .map(s => ({
//       xrId: s.data.xrId,
//       deviceName: s.data.deviceName || 'Unknown'
//     }));
// }

// async function broadcastDeviceList() {
//   console.log('[DEVICE_LIST] Broadcasting device list');
//   try {
//     const list = await buildDeviceListGlobal();
//     io.emit('device_list', list);
//   } catch (e) {
//     console.warn('[DEVICE_LIST] Failed to build list:', e.message);
//   }
// }

// function addToMessageHistory(message) {
//   messageHistory.push({
//     ...message,
//     id: Date.now(),
//     timestamp: new Date().toISOString()
//   });
//   if (messageHistory.length > 100) {
//     messageHistory.shift();
//   }
// }

// // -------- Health & routes --------
// app.get('/health', async (req, res) => {
//   console.log('[HEALTH] Health check requested');
//   try {
//     const sockets = await io.fetchSockets();
//     res.status(200).json({
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       instanceId: process.env.WEBSITE_INSTANCE_ID || process.pid,
//       connectedClients: sockets.length
//     });
//   } catch {
//     res.status(200).json({
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       instanceId: process.env.WEBSITE_INSTANCE_ID || process.pid,
//       connectedClients: 'unknown'
//     });
//   }
// });

// app.get('/', (req, res) => {
//   console.log('[ROUTE] Serving root path');
//   if (!staticPathFound) return res.status(404).send('Static not found');
//   const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
//   res.send(injectTurnConfig(html));
// });

// app.get('*', (req, res) => {
//   console.log(`[ROUTE] Catch-all route for: ${req.path}`);
//   if (!staticPathFound) return res.status(404).send('Static not found');
//   const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
//   res.send(injectTurnConfig(html));
// });

// // -------- Attach Redis adapter (optional but recommended on Azure) --------
// (async () => {
//   try {
//     const REDIS_URL = process.env.REDIS_URL;
//     if (!REDIS_URL) {
//       console.warn('[SOCKET.IO] No REDIS_URL set. Running single-instance/in-memory.');
//     } else {
//       const useTls = (process.env.REDIS_TLS || 'true').toLowerCase() === 'true';
//       const pub = createClient({ url: REDIS_URL, socket: { tls: useTls } });
//       const sub = pub.duplicate();
//       await Promise.all([pub.connect(), sub.connect()]);
//       io.adapter(createAdapter(pub, sub));
//       console.log('[SOCKET.IO] Redis adapter attached');
//     }
//   } catch (e) {
//     console.error('[SOCKET.IO] Redis adapter failed, continuing in-memory:', e.message);
//   }
// })();

// // -------- Socket.IO logic --------
// io.on('connection', (socket) => {
//   console.log(`🔌 [CONNECTION] ${socket.id}`);

//   // Send recent message history to new connections
//   if (messageHistory.length > 0) {
//     socket.emit('message_history', {
//       type: 'message_history',
//       messages: messageHistory.slice(-10)
//     });
//   }

//   // Lightweight presence (no local Map reliance)
//   socket.on('join', (xrId) => {
//     socket.data.xrId = xrId;
//     socket.join(roomOf(xrId));
//     console.log(`[JOIN] ${socket.id} joined as ${xrId}`);
//     // Echo list to just-joined client
//     (async () => {
//       socket.emit('device_list', await buildDeviceListGlobal());
//       await broadcastDeviceList();
//     })().catch(() => {});
//   });

//   // Identification and Device Management
//   socket.on('identify', async ({ deviceName, xrId }) => {
//     socket.data.deviceName = deviceName || 'Unknown';
//     socket.data.xrId = xrId;
//     socket.join(roomOf(xrId));
//     console.log(`[IDENTIFY] ${socket.data.deviceName} (${xrId}) at ${socket.id}`);

//     // 1) Echo list to this client
//     socket.emit('device_list', await buildDeviceListGlobal());
//     // 2) Broadcast updated list to everyone
//     await broadcastDeviceList();
//   });

//   // On-demand device list (useful after reconnect)
//   socket.on('request_device_list', async () => {
//     socket.emit('device_list', await buildDeviceListGlobal());
//   });

//   // WebRTC signaling (cross-node targeting by xrId via room)
//   socket.on('signal', ({ type, from, to, data }) => {
//     if (!to) {
//       console.warn(`[SIGNAL] Missing 'to' in signal from ${from}`);
//       return;
//     }
//     console.log(`📡 [SIGNAL] ${type} from ${from} -> ${to}`);
//     io.to(roomOf(to)).emit('signal', { type, from, data });
//   });

//   // Control commands
//   socket.on('control', ({ command, from, to, message }) => {
//     console.log(`🎮 [CONTROL] ${command} from ${from} -> ${to || 'all'}`);
//     const payload = { command, from, message };
//     if (to) io.to(roomOf(to)).emit('control', payload);
//     else io.emit('control', payload);
//   });

//   // Messaging system
//   socket.on('message', ({ from, to, text, urgent }) => {
//     console.log(`[MESSAGE] ${from} -> ${to || 'all'}: ${text}`);
//     const msg = {
//       type: 'message',
//       from,
//       to,
//       text,
//       urgent,
//       sender: socket.data.deviceName || from || 'unknown',
//       xrId: from,
//       timestamp: new Date().toISOString()
//     };

//     addToMessageHistory(msg);

//     if (to) io.to(roomOf(to)).emit('message', msg);
//     else socket.broadcast.emit('message', msg);
//   });

//   // Clear/messages + status (broadcast to all)
//   socket.on('clear-messages', ({ by }) => {
//     const payload = { type: 'message-cleared', by, messageId: Date.now() };
//     io.emit('message-cleared', payload);
//   });

//   socket.on('clear_confirmation', ({ device }) => {
//     const payload = {
//       type: 'message_cleared',
//       by: device,
//       timestamp: new Date().toISOString()
//     };
//     io.emit('message_cleared', payload);
//   });

//   socket.on('status_report', ({ from, status }) => {
//     const payload = { type: 'status_report', from, status, timestamp: new Date().toISOString() };
//     io.emit('status_report', payload);
//   });

//   socket.on('message_history', () => {
//     socket.emit('message_history', {
//       type: 'message_history',
//       messages: messageHistory.slice(-10)
//     });
//   });

//   socket.on('disconnect', async () => {
//     console.log(`❎ [DISCONNECT] ${socket.data.deviceName || 'Unknown'} (${socket.data.xrId || 'n/a'})`);
//     try { await broadcastDeviceList(); } catch {}
//   });

//   socket.on('error', (err) => {
//     console.error(`[SOCKET_ERROR] ${socket.id}:`, err);
//   });
// });

// // Start server
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 [SERVER] Running on http://0.0.0.0:${PORT}`);
// });

// // Graceful shutdown
// process.on('uncaughtException', (err) => {
//   console.error('[FATAL_ERROR] Uncaught exception:', err);
// });

// process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);

// function shutdown() {
//   console.log('\n[SHUTDOWN] Graceful shutdown initiated...');
//   const socketCount = io.sockets.sockets.size;
//   console.log(`[SHUTDOWN] Disconnecting ${socketCount} sockets...`);
//   io.sockets.sockets.forEach(s => s.disconnect(true));

//   io.close(() => {
//     console.log('[SHUTDOWN] Socket.IO server closed');
//     server.close(() => {
//       console.log('[SHUTDOWN] HTTP server closed');
//       process.exit(0);
//     });
//   });
// }

// console.log('[INIT] Server initialization complete');

// =======================================================================================================================================


// backend/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

// -------- Load .env (backend/.env OR root/.env) --------
const dotenv = require('dotenv');
const envCandidates = [
  path.resolve(__dirname, '.env'),        // backend/.env
  path.resolve(__dirname, '..', '.env'),  // root/.env
];
let loadedFrom = null;
for (const p of envCandidates) {
  if (fs.existsSync(p)) { dotenv.config({ path: p }); loadedFrom = p; break; }
}
console.log('[ENV] .env loaded from:', loadedFrom || 'process.env only');

// One-time instrumentation: prove which worker you hit
console.log('[BOOT] Instance:', process.env.WEBSITE_INSTANCE_ID || process.pid);
console.log('[INIT] Starting server initialization...');

// Configuration
const PORT = process.env.PORT || 8080;
console.log(`[CONFIG] Using port: ${PORT}`);

const app = express();
const server = http.createServer(app);
console.log('[HTTP] Server created');

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket'],    // Azure-friendly (no long-poll)
  pingInterval: 25000,
  pingTimeout: 30000,
});
console.log('[SOCKET.IO] Socket.IO server initialized');

// In-memory message history (per instance OK)
const messageHistory = [];
console.log('[STATE] Message history initialized');

// Middleware
app.use(cors());
app.use(express.json());
console.log('[MIDDLEWARE] CORS and JSON middleware applied');

// Static file handling
const staticPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../frontend'),
];

console.log('[STATIC] Checking for static paths...');
let staticPathFound = null;
for (const dir of staticPaths) {
  if (fs.existsSync(dir)) {
    app.use(express.static(dir));
    staticPathFound = dir;
    console.log(`[STATIC] Serving from ${dir}`);
  }
}
if (!staticPathFound) console.warn('⚠️ [STATIC] No static path found.');

// TURN injection into HTML
function injectTurnConfig(html) {
  const cfg = `
    <script>
      window.TURN_CONFIG = {
        urls: '${process.env.TURN_URL || ''}',
        username: '${process.env.TURN_USERNAME || ''}',
        credential: '${process.env.TURN_CREDENTIAL || ''}'
      };
    </script>`;
  return html.replace('</body>', `${cfg}\n</body>`);
}

// -------- Presence helpers (global via adapter) --------
function roomOf(xrId) { return `xr:${xrId}`; }

// Build device list across ALL instances (dedup by xrId; last wins)
async function buildDeviceListGlobal() {
  const sockets = await io.fetchSockets();
  const byId = new Map();
  for (const s of sockets) {
    const id = s?.data?.xrId;
    if (!id) continue;
    byId.set(id, { xrId: id, deviceName: s.data.deviceName || 'Unknown' });
  }
  return [...byId.values()];
}

async function broadcastDeviceList() {
  console.log('[DEVICE_LIST] Broadcasting device list');
  try {
    io.emit('device_list', await buildDeviceListGlobal());
  } catch (e) {
    console.warn('[DEVICE_LIST] Failed to build list:', e.message);
  }
}

function addToMessageHistory(message) {
  messageHistory.push({ ...message, id: Date.now(), timestamp: new Date().toISOString() });
  if (messageHistory.length > 100) messageHistory.shift();
}

// -------- Health & routes --------
app.get('/health', async (_req, res) => {
  console.log('[HEALTH] Health check requested');
  try {
    const sockets = await io.fetchSockets();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      instanceId: process.env.WEBSITE_INSTANCE_ID || process.pid,
      connectedClients: sockets.length
    });
  } catch {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      instanceId: process.env.WEBSITE_INSTANCE_ID || process.pid,
      connectedClients: 'unknown'
    });
  }
});

app.get('/', (_req, res) => {
  console.log('[ROUTE] Serving root path');
  if (!staticPathFound) return res.status(404).send('Static not found');
  const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
  res.send(injectTurnConfig(html));
});

app.get('*', (req, res) => {
  console.log(`[ROUTE] Catch-all route for: ${req.path}`);
  if (!staticPathFound) return res.status(404).send('Static not found');
  const html = fs.readFileSync(path.join(staticPathFound, 'index.html'), 'utf8');
  res.send(injectTurnConfig(html));
});

// -------- Attach Redis adapter (recommended on Azure) --------
(async () => {
  try {
    const REDIS_URL = process.env.REDIS_URL;
    if (!REDIS_URL) {
      console.warn('[SOCKET.IO] No REDIS_URL set. Running single-instance/in-memory.');
    } else {
      const useTls = (process.env.REDIS_TLS || 'true').toLowerCase() === 'true';
      const pub = createClient({ url: REDIS_URL, socket: { tls: useTls } });
      const sub = pub.duplicate();
      await Promise.all([pub.connect(), sub.connect()]);
      io.adapter(createAdapter(pub, sub));
      console.log('[SOCKET.IO] Redis adapter attached');
    }
  } catch (e) {
    console.error('[SOCKET.IO] Redis adapter failed, continuing in-memory:', e.message);
  }
})();

// -------- Socket.IO logic --------
io.on('connection', (socket) => {
  console.log(`🔌 [CONNECTION] ${socket.id}`);

  // Send recent message history to new connections
  if (messageHistory.length > 0) {
    socket.emit('message_history', {
      type: 'message_history',
      messages: messageHistory.slice(-10),
    });
  }

  // Lightweight presence
  socket.on('join', (xrId) => {
    socket.data.xrId = xrId;
    socket.join(roomOf(xrId));
    console.log(`[JOIN] ${socket.id} joined as ${xrId}`);
    (async () => {
      socket.emit('device_list', await buildDeviceListGlobal());
      await broadcastDeviceList();
    })().catch(() => {});
  });

  // Identification and Device Management
  socket.on('identify', async ({ deviceName, xrId }) => {
    socket.data.deviceName = deviceName || 'Unknown';
    socket.data.xrId = xrId;
    socket.join(roomOf(xrId));
    console.log(`[IDENTIFY] ${socket.data.deviceName} (${xrId}) at ${socket.id}`);
    socket.emit('device_list', await buildDeviceListGlobal()); // echo to this client
    await broadcastDeviceList();                                // and broadcast to all
  });

  // On-demand device list (useful after reconnect)
  socket.on('request_device_list', async () => {
    try { socket.emit('device_list', await buildDeviceListGlobal()); }
    catch (e) { console.warn('[DEVICE_LIST] request failed', e.message); }
  });

  // WebRTC signaling (cross-node targeting by xrId via room)
  socket.on('signal', ({ type, from, to, data }) => {
    if (!to) return console.warn(`[SIGNAL] Missing 'to' in signal from ${from}`);
    console.log(`📡 [SIGNAL] ${type} from ${from} -> ${to}`);
    io.to(roomOf(to)).emit('signal', { type, from, data });
  });

  // Control commands
  socket.on('control', ({ command, from, to, message }) => {
    console.log(`🎮 [CONTROL] ${command} from ${from} -> ${to || 'all'}`);
    const payload = { command, from, message };
    if (to) io.to(roomOf(to)).emit('control', payload);
    else io.emit('control', payload);
  });

  // Messaging system
  socket.on('message', ({ from, to, text, urgent }) => {
    console.log(`[MESSAGE] ${from} -> ${to || 'all'}: ${text}`);
    const msg = {
      type: 'message',
      from, to, text, urgent,
      sender: socket.data.deviceName || from || 'unknown',
      xrId: from,
      timestamp: new Date().toISOString(),
    };
    addToMessageHistory(msg);
    if (to) io.to(roomOf(to)).emit('message', msg);
    else socket.broadcast.emit('message', msg);
  });

  // Clear/messages + status (broadcast to all)
  socket.on('clear-messages', ({ by }) => {
    const payload = { type: 'message-cleared', by, messageId: Date.now() };
    io.emit('message-cleared', payload);
  });

  socket.on('clear_confirmation', ({ device }) => {
    const payload = { type: 'message_cleared', by: device, timestamp: new Date().toISOString() };
    io.emit('message_cleared', payload);
  });

  socket.on('status_report', ({ from, status }) => {
    const payload = { type: 'status_report', from, status, timestamp: new Date().toISOString() };
    io.emit('status_report', payload);
  });

  socket.on('message_history', () => {
    socket.emit('message_history', {
      type: 'message_history',
      messages: messageHistory.slice(-10),
    });
  });

  socket.on('disconnect', async () => {
    console.log(`❎ [DISCONNECT] ${socket.data.deviceName || 'Unknown'} (${socket.data.xrId || 'n/a'})`);
    try { await broadcastDeviceList(); } catch {}
  });

  socket.on('error', (err) => {
    console.error(`[SOCKET_ERROR] ${socket.id}:`, err);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [SERVER] Running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('uncaughtException', (err) => {
  console.error('[FATAL_ERROR] Uncaught exception:', err);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('\n[SHUTDOWN] Graceful shutdown initiated...');
  const socketCount = io.sockets.sockets.size;
  console.log(`[SHUTDOWN] Disconnecting ${socketCount} sockets...`);
  io.sockets.sockets.forEach(s => s.disconnect(true));

  io.close(() => {
    console.log('[SHUTDOWN] Socket.IO server closed');
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed');
      process.exit(0);
    });
  });
}

console.log('[INIT] Server initialization complete');
