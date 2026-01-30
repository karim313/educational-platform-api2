import dotenv from 'dotenv';
import path from 'path';

// Load env using absolute path to avoid issues with current working directory
dotenv.config({ path: path.join(__dirname, '../.env') });

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
