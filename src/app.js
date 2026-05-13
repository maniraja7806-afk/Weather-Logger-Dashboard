require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const { startWeatherLoggJobs } = require('./services/weatherService');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Start background cron jobs for weather logging
startWeatherLoggJobs();

// Routes
app.use('/api/weather', weatherRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
