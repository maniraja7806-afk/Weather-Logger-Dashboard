const Weather = require('../models/Weather');

// 1. Retrieve historical weather data (with filtering)
exports.getHistory = async (req, res) => {
    try {
        const { location, startDate, endDate } = req.query;
        let query = {};

        if (location) {
            query.location = { $regex: new RegExp(location, 'i') };
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const data = await Weather.find(query).sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 2. Calculate average temperature
exports.getAverageTemperature = async (req, res) => {
    try {
        const { location, startDate, endDate } = req.query;
        
        if (!location) {
            return res.status(400).json({ error: 'Location is required for calculating average temperature' });
        }

        let matchStage = { location: { $regex: new RegExp(`^${location}$`, 'i') } };
        
        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                matchStage.timestamp.$lte = end;
            }
        }

        const result = await Weather.aggregate([
            { $match: matchStage },
            { 
                $group: { 
                    _id: null, 
                    averageTemp: { $avg: '$temperature' },
                    count: { $sum: 1 }
                } 
            }
        ]);

        if (result.length > 0) {
            res.json({ location, averageTemp: result[0].averageTemp.toFixed(2), recordsCount: result[0].count });
        } else {
            res.status(404).json({ message: 'No weather records found for this location' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 3. Export data as JSON
exports.exportData = async (req, res) => {
    try {
        const data = await Weather.find().lean();
        
        res.setHeader('Content-disposition', 'attachment; filename=weather-data-export.json');
        res.setHeader('Content-type', 'application/json');
        
        // Stream back to avoid memory load for huge datasets or just json stringify
        res.write(JSON.stringify(data, null, 2));
        res.end();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
