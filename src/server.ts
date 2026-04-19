import dotenv from 'dotenv';
import path from 'path';

// Load env with fallback for different environments
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });
// Also try loading from default locations
dotenv.config();

import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;

console.log('🚀 Initializing server components...');

const server = app.listen(PORT, () => {
    console.log(`✅ SERVER IS LIVE ON PORT: ${PORT}`);
    console.log(`📡 Healthcheck available at: /health`);

    // Connect to MongoDB AFTER the server starts listening
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
        mongoose.connect(mongoUri)
            .then(() => console.log('✅ MongoDB Connected'))
            .catch(err => {
                console.error('❌ MongoDB Connection Failed:', err);
            });
    } else {
        console.warn('⚠️ MONGO_URI missing');
    }
});

// Handle server errors
server.on('error', (error: any) => {
    console.error('❌ Server startup error:', error);
});
