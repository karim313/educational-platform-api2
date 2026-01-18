import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Load env
dotenv.config();

// Create app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// MongoDB connection
const connectDB = async (): Promise<void> => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
  }

  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️ MongoDB Disconnected')
  );
  mongoose.connection.on('error', (err) =>
    console.error('❌ MongoDB Error:', err)
  );
};

// Sample Course model
import { Schema, model } from 'mongoose';

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    instructor: String,
  },
  { timestamps: true }
);

const Course = model('Course', courseSchema);

// Routes
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Base route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🎓 Edu Platform API is running',
    version: '1.0.0',
  });
});

// Courses route
app.get(`${API_PREFIX}/courses`, async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find().limit(100);
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'DB query failed' });
  }
});

// 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Start server immediately
const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Connect DB in background
connectDB();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Closing MongoDB...');
  await mongoose.connection.close();
  console.log('✅ MongoDB closed. Exiting...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Closing MongoDB...');
  await mongoose.connection.close();
  console.log('✅ MongoDB closed. Exiting...');
  process.exit(0);
});

export default app;
