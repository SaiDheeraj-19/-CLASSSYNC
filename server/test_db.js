const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err);
        process.exit(1);
    });
