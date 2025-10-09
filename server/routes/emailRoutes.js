const express = require('express');
const router = express.Router();
const { verifySMTP } = require('../services/email');

router.get('/verify', async (req, res) => {
  const result = await verifySMTP();
  if (result.ok) return res.status(200).json({ ok: true });
  return res.status(500).json({ ok: false, error: result.error });
});

module.exports = router;