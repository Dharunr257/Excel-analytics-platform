// server.js
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import app from './app.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import fs from 'fs';

dotenv.config();

// __dirname fix for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
  );
}

// Debug route loading
try {
  const routeCheck = fs.readFileSync('./routes/uploadRoutes.js', 'utf-8');
  console.log('✅ uploadRoutes.js loaded successfully.');
} catch (err) {
  console.error('❌ Failed to read uploadRoutes.js:', err.message);
}

app.on('mount', () => {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const path = middleware.route.path;
      console.log(`📌 Route: [${method}] ${path}`);
    }
  });
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
