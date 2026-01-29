import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import instructorRoutes from './routes/instructor.routes';

const app: Application = express();

const API_PREFIX = process.env.API_PREFIX || '/api';

// Healthcheck
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
    res.status(200).send('🎓 Edu Platform API is running');
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Routes
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

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Error [${req.method} ${req.originalUrl}]:`, errorMessage);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage
    });
});

export default app;
