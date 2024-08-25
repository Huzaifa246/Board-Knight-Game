const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    player: { type: String, required: true },
    time: { type: Number, required: true },
}, { timestamps: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
