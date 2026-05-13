const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        index: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number
    },
    description: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('Weather', weatherSchema);
