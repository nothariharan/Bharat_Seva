const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testConnect = async () => {
    try {
        console.log('Testing connection with:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connection Successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
};

testConnect();
