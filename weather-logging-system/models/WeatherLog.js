const mongoose = require('mongoose');
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
module.exports = mongoose.model('WeatherLog', weatherLogSchema);