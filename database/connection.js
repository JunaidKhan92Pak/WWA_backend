const mongoose = require('mongoose');
require("dotenv").config();

const url = process.env.MONGODB_URI;
mongoose.connect(url, {})
const db = mongoose.connection;
console.log("MongoDB URI:", process.env.MONGODB_URI);
// Connection successful
db.on('connected', () => {
    console.log('MongoDB connected with server  successfully');
});

// Connection error
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Optional: Once the connection is open
db.once('open', () => {
    console.log('MongoDB connection is open');
});

// Optional: When the connection is disconnected
db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});