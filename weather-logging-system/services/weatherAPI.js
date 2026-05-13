const axios = require('axios');
exports.fetchWeather = async (city) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        return {
            city: res.data.name,
            temperature: res.data.main.temp,
            humidity: res.data.main.humidity,
            pressure: res.data.main.pressure,
            windSpeed: res.data.wind.speed,
            condition: res.data.weather[0].main,
            visibility: res.data.visibility
        };
    } catch (error) {
        console.error('Weather API Error:', error.message);
        return null;
    }
};