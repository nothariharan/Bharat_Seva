const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is missing in environment variables!");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        });
        console.log(`MongoDB Connected: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Don't exit process in serverless; let it fail gracefully
    }
};

module.exports = connectDB;
