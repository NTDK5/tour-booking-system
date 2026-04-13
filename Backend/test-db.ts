import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const testConnection = async () => {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGO_URI);
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('No URI');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Successfully connected to MongoDB!');
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err: any) {
        console.error('Connection failed:', err.message);
        console.error(err);
    }
};

testConnection();
