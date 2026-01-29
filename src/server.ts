import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// 1. Load env as early as possible
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import instructorRoutes from './routes/instructor.routes';

const app: Application = express();

// ==========================================
// 2. CRITICAL: HEALTHCHECK (BEFORE ALL)
// ==========================================
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
    res.status(200).send('🎓 Edu Platform API is running');
});

// ==========================================
// 3. MIDDLEWARES
// ==========================================
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ==========================================
// 4. ROUTES
// ==========================================
const API_PREFIX = process.env.API_PREFIX || '/api';

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/instructor', instructorRoutes);

// Test route
app.get(`${API_PREFIX}/test`, (_req, res) => {
    res.json({ success: true, message: 'API is working 🚀' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Error [${req.method} ${req.originalUrl}]:`, errorMessage);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage
    });
});

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
const PORT = Number(process.env.PORT) || 8080;

const server = app.listen(PORT, () => {
    console.log(`✅ SERVER IS LIVE ON PORT: ${PORT}`);

    // Connect to MongoDB AFTER the server starts listening
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
        mongoose.connect(mongoUri)
            .then(() => console.log('✅ MongoDB Connected'))
            .catch(err => {
                console.error('❌ MongoDB Connection Failed:', err);
                // Don't exit process, let healthcheck reflect status if needed
            });
    } else {
        console.warn('⚠️ MONGO_URI missing');
    }
});

// Handle server errors
server.on('error', (error: any) => {
    console.error('❌ Server startup error:', error);
});

export default app;
