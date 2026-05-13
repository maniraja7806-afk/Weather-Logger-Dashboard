const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'weather-logging-system');

if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
}

const folders = [
    'config', 'models', 'routes', 'controllers', 'middleware',
    'services', 'jobs', 'public', 'public/css', 'public/js'
];

folders.forEach(folder => {
    const dir = path.join(projectDir, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
    'package.json': `{
  "name": "weather-logging-system",
  "version": "1.0.0",
  "description": "Comprehensive weather data logging system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "express-validator": "^7.0.1",
    "json2csv": "^6.0.0-alpha.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.2",
    "node-cron": "^3.0.3",
    "socket.io": "^4.7.5",
    "winston": "^3.13.0"
  }
}`,
    '.env': `PORT=5000
MONGODB_URI=mongodb://localhost:27017/weather_advanced
JWT_SECRET=supersecretjwtkey2026
WEATHER_API_KEY=e4ffea36651016f7419ffba23e9bf418
`,
    'server.js': `require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate Limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// Make socket.io accessible
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/locations', require('./routes/locations'));

// Error Handler
app.use(errorHandler);

// Sockets
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start Background Jobs
require('./jobs/weatherCollector');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`,
    'config/database.js': `const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};
module.exports = connectDB;
`,
    'middleware/errorHandler.js': `module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
};`,
    'middleware/auth.js': `const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};`,
    'models/User.js': `const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: { type: Object, default: {} }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);`,
    'models/Location.js': `const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    city: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    country: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Location', locationSchema);`,
    'models/WeatherLog.js': `const mongoose = require('mongoose');
const weatherLogSchema = new mongoose.Schema({
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    city: String,
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    condition: String,
    uvIndex: Number,
    visibility: Number,
    precipitation: Number,
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
weatherLogSchema.index({ locationId: 1, timestamp: -1 });
module.exports = mongoose.model('WeatherLog', weatherLogSchema);`,
    'routes/auth.js': `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });
        user = new User({ username, email, password: bcrypt.hashSync(password, 10) });
        await user.save();
        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) 
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) { next(err); }
});
module.exports = router;`,
    'routes/weather.js': `const express = require('express');
const router = express.Router();
const WeatherLog = require('../models/WeatherLog');
const auth = require('../middleware/auth');
const { Parser } = require('json2csv');

router.get('/historical', async (req, res, next) => {
    try {
        const logs = await WeatherLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) { next(err); }
});

router.get('/analytics', async (req, res, next) => {
    try {
        const aggregate = await WeatherLog.aggregate([
            { $group: { _id: "$city", avgTemp: { $avg: "$temperature" }, maxTemp: { $max: "$temperature" }, minTemp: { $min: "$temperature" } } }
        ]);
        res.json(aggregate);
    } catch (err) { next(err); }
});

module.exports = router;`,
    'routes/locations.js': `const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
    try {
        const locations = await Location.find({ userId: req.user.id });
        res.json(locations);
    } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
    try {
        const newLoc = new Location({ ...req.body, userId: req.user.id });
        await newLoc.save();
        res.json(newLoc);
    } catch (err) { next(err); }
});
module.exports = router;`,
    'services/weatherAPI.js': `const axios = require('axios');
exports.fetchWeather = async (city) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const res = await axios.get(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&units=metric&appid=\${apiKey}\`);
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
};`,
    'jobs/weatherCollector.js': `const cron = require('node-cron');
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
module.exports = runJob;`,
    'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard Analytics</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: #1e1e1e; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .stat { font-size: 2em; font-weight: bold; color: #4CAF50; }
        .live-badge { background: #ff3b30; padding: 5px 10px; border-radius: 5px; font-size: 0.8em; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Weather Analytics System</h2>
            <span class="live-badge">Live Updates Active</span>
        </div>
        
        <div class="card">
            <h3>Recent Metrics</h3>
            <div class="grid" id="metrics-grid">Loading data...</div>
        </div>

        <div class="card">
            <h3>System Status</h3>
            <p>Backend: API active, Sockets listening, MongoDB Aggregation indexing active.</p>
            <p>Access endpoints via /api/weather/historical and /api/weather/analytics</p>
        </div>
    </div>
    
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <script>
        const socket = io();
        socket.on('connect', () => console.log('Live connected!'));
        
        fetch('/api/weather/analytics')
            .then(res => res.json())
            .then(data => {
                const grid = document.getElementById('metrics-grid');
                grid.innerHTML = data.map(d => \`
                    <div class="card" style="background:#2a2a2a">
                        <h4>\${d._id}</h4>
                        <div class="stat">\${d.avgTemp.toFixed(1)}°C avg</div>
                        <div>Max: \${d.maxTemp}°C | Min: \${d.minTemp}°C</div>
                    </div>
                \`).join('');
            }).catch(console.error);
    </script>
</body>
</html>`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(projectDir, filePath), content);
}

console.log('Project built in /weather-logging-system');
