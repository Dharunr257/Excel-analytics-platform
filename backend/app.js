import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

import fs from 'fs';

const routeCheck = fs.readFileSync('./backend/routes/uploadRoutes.js', 'utf-8');
console.log('✅ uploadRoutes.js loaded successfully.');

try {
  app._router.stack.forEach((r) => {
    if (r.route) {
      console.log(`📌 Route: ${Object.keys(r.route.methods)} ${r.route.path}`);
    }
  });
} catch (e) {
  console.error('❌ Route parsing failed:', e);
}


export default app;
