import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Load env as early as possible
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';

// Create app
const app: Application = express();

// ==========================================
// 1. CRITICAL: HEALTHCHECKS (MUST BE AT TOP)
// ==========================================
// Respond to Railway/Healthcheck immediately before any middleware
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/', (_req, res) => {
    res.status(200).send('🎓 Edu Platform API is running');
});

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));

// Express JSON middleware with error handling
app.use(express.json());
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.error('❌ JSON Syntax Error:', err.message);
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    next();
});

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ==========================================
// 3. SWAGGER (DEVELOPMENT ONLY)
// ==========================================
if (process.env.NODE_ENV !== 'production') {
    try {
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Educational Platform API',
                    version: '1.0.0',
                    description: 'API documentation for the Educational Platform',
                },
                servers: [{ url: `http://localhost:${process.env.PORT || 8080}` }],
            },
            apis: ['./src/routes/*.ts'],
        };
        const swaggerDocs = swaggerJsdoc(swaggerOptions);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    } catch (error) {
        console.error('⚠️ Swagger failed:', error);
    }
}

// ==========================================
// 4. ROUTES
// ==========================================
const API_PREFIX = process.env.API_PREFIX || '/api';

app.get(`${API_PREFIX}/test`, (_req, res) => {
    res.json({ success: true, message: 'API is working 🚀', prefix: API_PREFIX });
});

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

// Course Routes
app.use('/api/courses', courseRoutes);
app.use('/api/v1/courses', courseRoutes);

// Enrollment Routes
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Error [${req.method} ${req.originalUrl}]:`, errorMessage);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
    });
});

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SERVER IS LIVE ON PORT: ${PORT}`);
    console.log(`🚀 Mode: ${process.env.NODE_ENV || 'production'}`);

    // Background DB connection
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.warn('⚠️ Warning: MONGO_URI is not defined! Application may fail on DB-dependent routes.');
    } else {
        mongoose.connect(mongoUri)
            .then(() => console.log('✅ MongoDB Connected'))
            .catch(err => console.error('❌ MongoDB Connection Failed:', err));
    }
});

// Error process handlers
process.on('uncaughtException', (err) => {
    console.error('🔥 CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('🔥 CRITICAL: Unhandled Rejection:', reason);
});

export default app;
