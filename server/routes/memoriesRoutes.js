const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMemoryController, getMemoriesController, getLiveMemoriesController } = require('../controllers/memoriesController');

const upload = multer(); // Configure multer for in-memory storage

// Define your memories routes here
router.get('/', getMemoriesController);
router.get('/live', getLiveMemoriesController);
router.post('/upload', upload.single('memory'), uploadMemoryController);

module.exports = router;