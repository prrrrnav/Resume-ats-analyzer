const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { analyzeResume, generateOptimizedResume } = require('../controllers/analyzeController');
const verifySource = require('../middleware/verifySource');

// Main route for resume analysis
router.post('/', verifySource, upload.single('resume'),analyzeResume);

// Route for generating optimized resume
router.post('/generate-optimized-resume', verifySource, upload.single('resume'),generateOptimizedResume)

module.exports = router;
