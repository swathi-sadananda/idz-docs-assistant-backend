const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Import routes
const chatRoutes = require('./routes/chat');
const searchRoutes = require('./routes/search');
const docsRoutes = require('./routes/docs');

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/docs', docsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve widget.html for root and /widget.html
app.get(['/', '/widget.html'], (req, res) => {
  const widgetPath = path.join(__dirname, '../frontend/public/widget.html');
  if (fs.existsSync(widgetPath)) {
    res.sendFile(widgetPath);
  } else {
    res.status(404).send('Widget not found. Please check if frontend/public/widget.html exists.');
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Try /widget.html or /api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IDz Documentation Assistant API running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

module.exports = app;

// Made with Bob
