import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/dbInit.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded crop/leaf photos
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Map API Modules
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/equipment', equipmentRoutes);

// General 404 Route
app.use((req, res, next) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  try {
    fs.writeFileSync('C:/Users/EC0036AU/.gemini/antigravity-ide/brain/2e9ade2b-de3e-4c8c-9ff7-50bcef350f12/scratch/server_error.log', `[${new Date().toISOString()}] ${req.method} ${req.url}\n${err.stack}\n\n`);
  } catch (logErr) {
    console.error('Failed to write error to log file:', logErr.message);
  }
  res.status(500).json({ 
    message: 'An internal server error occurred.',
    error: err.message
  });
});

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 KrishiSakhi Express Backend running on port ${PORT}`);
});

export default app;
