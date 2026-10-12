import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../app.js';

dotenv.config({ quiet: true });

let isConnected = false;

async function connectDB() {
    if (isConnected || mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    const dbUri = process.env.DATABASE;
    if (!dbUri) {
        throw new Error("DATABASE connection string is required in environment variables");
    }
    await mongoose.connect(dbUri);
    isConnected = true;
}

export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error("Serverless handler DB connection error:", err);
        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
    }
}
