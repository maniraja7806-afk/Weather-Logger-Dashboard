const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    city: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    country: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Location', locationSchema);