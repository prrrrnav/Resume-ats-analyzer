const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { analyzeResume, generateOptimizedResume } = require('../controllers/analyzeController');
const verifySource = require('../middleware/verifySource');

// Main route for resume analysis
router.post('/', verifySource, upload.single('resume'), (req, res) => {
  analyzeResume(req, res).then(() => {
    res.status(200).json({ message: 'Resume analyzed successfully' });
  }).catch((err) => {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });
});

// Route for generating optimized resume
router.post('/generate-optimized-resume', verifySource, upload.single('resume'), (req, res) => {
  generateOptimizedResume(req, res).then(() => {
    res.status(200).json({ message: 'Optimized resume generated successfully' });
  }).catch((err) => {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });
});

module.exports = router;
