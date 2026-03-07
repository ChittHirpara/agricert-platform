const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/system/status
// @desc    System health diagnostics
router.get('/status', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        server: 'running',
        uptime: `${Math.floor(process.uptime())}s`,
        database: dbStatus[dbState] || 'unknown',
        blockchain: process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
            ? 'connected'
            : 'mock-mode',
        socket: 'active',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
