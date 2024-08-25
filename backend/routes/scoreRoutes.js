const express = require('express');
const Score = require('../models/Score');

const router = express.Router();

// POST route to save score
router.post('/scores', async (req, res) => {
    const { player, time } = req.body;

    const newScore = new Score({
        player,
        time,
    });

    try {
        const savedScore = await newScore.save();
        res.status(201).json(savedScore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET route to retrieve leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find().sort({ time: 1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
