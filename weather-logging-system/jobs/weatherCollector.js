const cron = require('node-cron');
const { fetchWeather } = require('../services/weatherAPI');
const WeatherLog = require('../models/WeatherLog');
let io = null; // Will be set externally if needed, or broadcast via global singleton

const runJob = async () => {
    const defaultCities = ['London', 'New York', 'Tokyo', 'Paris'];
    console.log('Running scheduled weather collector...');
    
    for (const city of defaultCities) {
        const data = await fetchWeather(city);
        if (data) {
            const log = new WeatherLog(data);
            await log.save();
            // In a full app, we would emit this via app.get('io')
        }
    }
};

// Run hourly
cron.schedule('0 * * * *', runJob);

// Run once on startup
setTimeout(runJob, 2000);
module.exports = runJob;