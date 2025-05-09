const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { analyzeResume, generateOptimizedResume} = require('../controllers/analyzeController');
const verifySource = require('../middleware/verifySource');

router.post('/',verifySource, upload.single('resume'), analyzeResume);
router.post('/generate-optimized-resume',verifySource, upload.single('resume'), generateOptimizedResume);

module.exports = router;