const express = require('express');
const router = express.Router();
const { verifySMTP, sendTestEmail } = require('../services/email');

router.get('/verify', async (req, res) => {
  const to = String(req.query?.to || '').trim();
  if (to) {
    const result = await sendTestEmail(to);
    const status = result.ok ? 200 : 500;
    return res.status(status).json(result);
  }
  const result = await verifySMTP();
  const status = result.ok ? 200 : 500;
  return res.status(status).json(result);
});

module.exports = router;