require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const config = require('./config');

// Import routes
const memoriesRoutes = require('./routes/memoriesRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes');
const moderationRoutes = require('./routes/moderationRoutes');

const app = express();
const PORT = config.port || 3001;

// Configure multer for file uploads
const upload = multer();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Server-Sent Events (SSE) hub
const sseClients = new Set();

// Attach broadcaster to requests so controllers can emit events
app.use((req, res, next) => {
  req.sendEventsToAll = (payload) => {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch (err) {
        // Drop broken clients silently
        sseClients.delete(client);
      }
    }
  };
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Wedding Invitation API Server');
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  const status = {
    status: 'ok',
    uptime: process.uptime(),
    corsOrigin: config.corsOrigin,
    env: {
      googleSheetId: Boolean(config.google.sheetId),
      googleKeyFile: Boolean(config.google.keyFile),
      googleSheetRange: Boolean(config.sheets.range),
      emailHost: Boolean(config.email.host),
      emailUser: Boolean(config.email.user),
      emailPass: Boolean(config.email.pass),
      recipientEmail: Boolean(config.email.recipient),
      supabaseUrl: Boolean(config.supabase.url),
      supabaseAnonKey: Boolean(config.supabase.anonKey)
    }
  };
  res.json(status);
});

// Some platforms send HEAD for health checks; respond 200 quickly
app.head('/healthz', (req, res) => {
  res.status(200).end();
});

// API Routes
app.use('/api/memories', memoriesRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/moderation', moderationRoutes);

// SSE endpoint for live feed updates
app.get('/api/memories/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send a comment to keep the connection open
  res.write(': connected\n\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

const server = app.listen(PORT, () => {
  console.log(`Wedding API server running on port ${PORT}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});

// Prevent the process from exiting
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => {
    console.log('Process terminated');
  });
});