const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { analyzeResume, generateOptimizedResume} = require('../controllers/analyzeController');

router.post('/', upload.single('resume'), analyzeResume);
router.post('/generate-optimized-resume', upload.single('resume'), generateOptimizedResume);

module.exports = router;