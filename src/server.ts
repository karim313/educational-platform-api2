import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Convert require to import for TypeScript

dotenv.config(); // هذا مهم جداً

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
// TypeScript requires handling potential undefined env variables
const mongoURI = process.env.MONGO_URI || '';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Edu Platform API',
        status: 'running',
        timestamp: new Date()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// مهم: استخدم process.env.PORT
const PORT = process.env.PORT || 8080;

// @ts-ignore - '0.0.0.0' argument might conflict with some strict overloads, but is valid in runtime.
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`
  🚀 Server is running!
  📍 Port: ${PORT}
  🌐 URL: https://educational-platform-api2-production.up.railway.app
  📦 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}
  `);
});
