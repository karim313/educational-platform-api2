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
import enrollmentRoutes from './routes/enrollment.routes';

// Load env first
dotenv.config();

// Create app
const app: Application = express();

// 1. Healthcheck (RESPOND ASAP to Railway)
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 2. Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// 3. Swagger Configuration (Wrap in try-catch to avoid crash)
try {
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
                        ? 'https://educational-platform-api2-production-75ed.up.railway.app'
                        : `http://localhost:${process.env.PORT || 8080}`,
                },
            ],
        },
        apis: ['./src/routes/*.ts', './dist/routes/*.js'],
    };

    const swaggerDocs = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} catch (error) {
    console.error('⚠️ Swagger failed to load:', error);
}

// 4. Routes Configuration
const API_PREFIX = process.env.API_PREFIX || '/api';

// Base root info
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: '🎓 Edu Platform API is running',
        docs: '/api-docs',
        endpoints: {
            auth: ['/api/auth/register', '/api/auth/login'],
            courses: ['/api/courses'],
            v1_compatibility: '/api/v1/...'
        },
        version: '1.2.0',
    });
});

app.get(`${API_PREFIX}/test`, (_req, res) => {
    res.json({ success: true, message: 'API is working 🚀', prefix: API_PREFIX });
});

// Support both /api and /api/v1 to avoid 404 errors regardless of Railway settings
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);

// Custom fallback if a different prefix is set in Railway
if (API_PREFIX !== '/api' && API_PREFIX !== '/api/v1') {
    app.use(`${API_PREFIX}/auth`, authRoutes);
    app.use(`${API_PREFIX}/courses`, courseRoutes);
    app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes);
}

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// 5. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Server Error:', err.message || err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// 6. Server Initialization
const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

    // Background DB connection
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ CRITICAL: MONGO_URI is not defined!');
    } else {
        mongoose.connect(mongoUri)
            .then(() => console.log('✅ MongoDB Connected'))
            .catch(err => console.error('❌ MongoDB Connection Failed:', err));
    }
});

// 7. Process error handlers
process.on('uncaughtException', (err) => {
    console.error('🔥 CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('🔥 CRITICAL: Unhandled Rejection:', reason);
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
