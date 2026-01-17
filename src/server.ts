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

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Custom Request logging (requested by user)
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } as mongoose.ConnectOptions);

        console.log('✅ MongoDB Connected Successfully');

        // Connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB Disconnected');
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        console.error('⚠️ Server will continue running without database connection');
        // Don't exit - let the server stay alive so we can see the error in logs
    }
};

// Basic Routes
app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: '🎓 Edu Platform API',
        version: '1.0.0',
        documentation: '/api-docs',
        status: 'operational',
        timestamp: new Date().toISOString()
    });
});

// Health Check Endpoint (Required for Railway)
app.get('/health', (req: Request, res: Response) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'edu-platform-api',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        database: {
            status: dbStatus,
            readyState: mongoose.connection.readyState
        },
        memory: process.memoryUsage(),
        uptime: process.uptime()
    });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Sample API Route
app.get(`${apiPrefix}/test`, (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'API is working!',
        data: {
            user: 'test',
            timestamp: new Date().toISOString()
        }
    });
});

// 404 Handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('🔥 Server Error:', err.stack);

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Server Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Start Server
const startServer = async (): Promise<void> => {
    try {
        // Connect to database first
        await connectDB();

        // Start listening
        // @ts-ignore
        app.listen(PORT, HOST, () => {
            console.log(`
      🚀 Server Successfully Started!
      =================================
      📍 Port: ${PORT}
      🌐 Host: ${HOST}
      📦 Environment: ${process.env.NODE_ENV || 'development'}
      �️ Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}
      🔗 MongoDB State: ${mongoose.connection.readyState}
      ⏰ Started at: ${new Date().toISOString()}
      =================================
      📍 Local: http://localhost:${PORT}
      📍 Network: http://${HOST}:${PORT}
      📍 Health: http://${HOST}:${PORT}/health
      📍 API: http://${HOST}:${PORT}${apiPrefix}
      =================================
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Starting graceful shutdown...');

    mongoose.connection.close().then(() => {
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Starting graceful shutdown...');

    mongoose.connection.close().then(() => {
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    });
});

// Start the server
startServer();

export default app;
