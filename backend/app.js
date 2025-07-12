import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Debug: Check if uploadRoutes file loads
try {
  const routeCheck = fs.readFileSync('./backend/routes/uploadRoutes.js', 'utf-8');
  console.log('✅ uploadRoutes.js loaded successfully.');
} catch (err) {
  console.error('❌ Failed to read uploadRoutes.js:', err.message);
}

// ✅ Print registered routes (for debugging)
try {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const path = middleware.route.path;
      console.log(`📌 Route: [${method}] ${path}`);
    }
  });
} catch (e) {
  console.error('❌ Route parsing failed:', e);
}

export default app;
