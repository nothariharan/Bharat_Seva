const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    authorName: { type: String, required: true },
    authorType: { type: String, required: true, enum: ['Operator', 'Citizen', 'System'] },
    content: { type: String, required: true },
    state: { type: String },
    topic: { type: String },
    upvotes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
