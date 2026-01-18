import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';

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
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ MONGO_URI not defined in environment');
        return;
    }

    try {
        await mongoose.connect(mongoUri);
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

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Educational Platform API',
            version: '1.0.0',
            description: 'API documentation for the Educational Platform',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://educational-platform-api2-production.up.railway.app'
                    : `http://localhost:${process.env.PORT || 8080}`,
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
        docs: '/api-docs',
        version: '1.0.0',
    });
});

// Test route
app.get(`${API_PREFIX}/test`, (_req, res) => {
    res.json({ success: true, message: 'API is working 🚀' });
});

// Mount Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);

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

// Start server immediately (Crucial for Railway health checks)
const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Connect DB in background AFTER server starts
    connectDB();
});

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
