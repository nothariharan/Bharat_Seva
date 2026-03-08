const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    coverageStates: [String],
    coverageDistricts: [String],
    topics: [String],
    resources: [{
        label: String,
        url: String
    }],
    contactPhone: String,
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
