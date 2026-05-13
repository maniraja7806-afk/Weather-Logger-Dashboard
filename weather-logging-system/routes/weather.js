const express = require('express');
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

module.exports = router;