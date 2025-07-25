const express = require('express');
const WebSocket = require('ws');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// HEALTH CHECK (CRITICAL FOR AZURE)
// =======================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    websocketClients: wss?.clients?.size || 0
  });
});

// =======================
// HTTP SERVER SETUP
// =======================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// =======================
// WEBSOCKET SERVER SETUP
// =======================
const wss = new WebSocket.Server({ server });
const clients = new Set();
const messageHistory = [];

// Heartbeat function
const heartbeat = (ws) => {
  ws.isAlive = true;
};

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.isAlive = true;

  ws.on('pong', () => heartbeat(ws));
  ws.on('error', (error) => console.error('[WS ERROR]', error));

  // Send message history to new connections
  if (messageHistory.length > 0) {
    ws.send(JSON.stringify({
      type: 'message_history',
      messages: messageHistory.slice(-10),
    }));
  }

  ws.on('message', (message) => {
    console.log('[WS] Received:', message.toString());
    
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (err) {
      console.warn('[WS] Invalid JSON:', message.toString());
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[DISCONNECTED] ${ws.deviceName || 'Unknown'}`);
    broadcastDeviceList();
  });
});

// =======================
// MESSAGE HANDLER
// =======================
function handleWebSocketMessage(ws, data) {
  if (!data || typeof data !== 'object' || !data.type) {
    console.warn('[WS] Invalid message format');
    return;
  }

  const { type, from, to, deviceName } = data;

  switch (type) {
    case 'identification':
      ws.deviceName = deviceName || 'Unknown';
      ws.xrId = data.xrId || null;
      console.log(`[CONNECTED] ${ws.deviceName}`);
      broadcastDeviceList();
      break;

    case 'message':
      const fullMessage = {
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      messageHistory.push(fullMessage);
      if (messageHistory.length > 100) messageHistory.shift();
      broadcastExcept(ws, fullMessage);
      break;

    // Add other cases as needed...
    default:
      console.warn('[WS] Unknown message type:', type);
  }
}

// =======================
// BROADCAST FUNCTIONS
// =======================
function broadcastAll(data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

function broadcastExcept(sender, data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

function broadcastDeviceList() {
  const deviceList = Array.from(clients)
    .filter(c => c.deviceName)
    .map(c => ({ name: c.deviceName, xrId: c.xrId }));

  broadcastAll({ type: 'device_list', devices: deviceList });
}

// =======================
// SERVER MAINTENANCE
// =======================
// Heartbeat ping every 30s
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('Shutting down server...');
  clearInterval(interval);
  wss.close();
  server.close();
  process.exit(0);
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
