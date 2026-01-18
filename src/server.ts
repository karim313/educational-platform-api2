import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Load env
dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// MongoDB Connection
const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
        mongoose.connection.on('error', (err) => console.error('❌ MongoDB Error:', err));
        mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB Disconnected'));
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err);
    }
};

// Basic Route
app.get('/', (_req: Request, res: Response) => res.json({ success: true, message: 'Edu Platform API running' }));

// Healthcheck for Railway
app.get('/health', (_req: Request, res: Response) => res.status(200).send('OK'));

// API Prefix
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
app.get(`${API_PREFIX}/test`, (_req, res) => res.json({ success: true, message: 'API working 🚀' }));

// 404 Handler
app.use('*', (req: Request, res: Response) => res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl }));

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' });
});

// Start Server
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await connectDB();
});

// Graceful shutdown
process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
process.on('SIGINT', async () => { await mongoose.connection.close(); process.exit(0); });

export default app;
