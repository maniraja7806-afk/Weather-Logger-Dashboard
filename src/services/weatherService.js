const axios = require('axios');
const cron = require('node-cron');
const Weather = require('../models/Weather');

// Fetch weather data for a single location
const fetchAndLogWeather = async (location) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`);
        
        const weatherData = response.data;
        const newRecord = new Weather({
            location: location,
            temperature: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            description: weatherData.weather[0].description
        });

        await newRecord.save();
        console.log(`Weather logged for ${location} at ${new Date().toISOString()}`);
    } catch (error) {
        console.error(`Failed to fetch weather for ${location}:`, error.message);
    }
};

// Setup cron job to run every hour
const startWeatherLoggJobs = () => {
    const locations = (process.env.LOCATIONS || 'London,New York,Tokyo,Mumbai,Delhi').split(',');
    
    const fetchAll = () => {
        console.log('Running weather fetch...');
        locations.forEach(location => fetchAndLogWeather(location.trim()));
    };

    // Run immediately on startup
    fetchAll();

    // Runs at the top of every hour
    cron.schedule('0 * * * *', fetchAll);

    console.log('Weather logging background jobs started.');
};

module.exports = { startWeatherLoggJobs };
