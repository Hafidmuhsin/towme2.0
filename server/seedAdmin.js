import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@towme.com',
            password: 'adminpassword123', // In a real app, use a strong env var
            role: 'admin',
            phone: '0000000000',
            location: { type: 'Point', coordinates: [0, 0] }
        });

        console.log(`Admin created: ${admin.email}`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
