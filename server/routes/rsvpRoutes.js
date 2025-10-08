const express = require('express');
const router = express.Router();
const { handleRsvp } = require('../controllers/rsvp');

// Define your RSVP routes here
router.get('/', (req, res) => {
  res.send('RSVP API is working!');
});

router.post('/', handleRsvp);

module.exports = router;