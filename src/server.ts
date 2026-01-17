import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true })); // adjust CLIENT_URL if needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected');
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
  }
};

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🎓 Edu Platform API is running',
  });
});

// Healthcheck route for Railway
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// API prefix
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Sample API route
app.get(`${API_PREFIX}/test`, (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API working fine 🚀',
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Server start
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
🚀 Server running!
=================================
📍 Port: ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
✅ MongoDB State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
=================================
Healthcheck: /health
API Base URL: ${API_PREFIX}
`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Closing MongoDB...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed. Exiting...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Closing MongoDB...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed. Exiting...');
  process.exit(0);
});

// Start server
startServer();

export default app;
