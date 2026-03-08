const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    transcript: { type: String, required: true },
    state: { type: String },
    district: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    topic: { type: String },
    language: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('QueryLog', queryLogSchema);
