// routes/test.js
const express = require('express');
const router = express.Router();
const verifySource = require('../middleware/verifySource');


// Simple GET route for testing
router.get('/ping', (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// Another simple GET route to test different functionality
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'API is working properly.' });
});

module.exports = router;
