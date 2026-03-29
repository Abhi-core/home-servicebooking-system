console.log('🚀 SERVER STARTING...');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`\n☁️  REQUEST: ${req.method} ${req.url}`);
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Routes
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workerRoutes = require('./routes/workerRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { seedWorkers } = require('./seed');

app.use('/api/book', (req, res, next) => { console.log('API Request: /api/book'); next(); }, bookingRoutes);
app.use('/api/reviews', (req, res, next) => { console.log('API Request: /api/reviews'); next(); }, reviewRoutes);
app.use('/api/admin', (req, res, next) => { console.log('API Request: /api/admin'); next(); }, adminRoutes);
app.use('/api/workers', (req, res, next) => { console.log('API Request: /api/workers'); next(); }, workerRoutes);
app.use('/api/feedback', (req, res, next) => { console.log('API Request: /api/feedback'); next(); }, feedbackRoutes);

// Seed database on startup
// seedWorkers(); // Disabled temporary to debug Firestore hang

app.get('/', (req, res) => {
    res.send('FixIt Anywhere Backend API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
