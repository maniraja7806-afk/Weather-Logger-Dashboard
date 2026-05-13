const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather/history?location=London&startDate=...&endDate=...
router.get('/history', weatherController.getHistory);

// GET /api/weather/average?location=London&startDate=...&endDate=...
router.get('/average', weatherController.getAverageTemperature);

// GET /api/weather/export
router.get('/export', weatherController.exportData);

module.exports = router;
