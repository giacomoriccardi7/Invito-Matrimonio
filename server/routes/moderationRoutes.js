const express = require('express');
const router = express.Router();
const { approveMemoryController, rejectMemoryController, getPendingController, getHistoryController, getStatsController } = require('../controllers/moderationController');

// Define your moderation routes here
router.get('/', (req, res) => {
  res.send('Moderation API is working!');
});

router.post('/approve/:id', approveMemoryController);
router.post('/reject/:id', rejectMemoryController);
router.get('/pending', getPendingController);
router.get('/history', getHistoryController);
router.get('/stats', getStatsController);

module.exports = router;