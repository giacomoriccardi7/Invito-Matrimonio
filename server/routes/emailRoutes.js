const express = require('express');
const router = express.Router();
const { verifySMTP, sendTestEmail } = require('../services/email');

router.get('/verify', async (req, res) => {
  const to = String(req.query?.to || '').trim();
  const debug = String(req.query?.debug || '').trim();
  const wantDebug = debug === '1' || debug.toLowerCase() === 'true';
  try {
    if (to) {
      const result = await sendTestEmail(to);
      const status = result.ok ? 200 : 500;
      return res.status(status).json(result);
    }
    const result = await verifySMTP();
    const status = result.ok ? 200 : 500;
    return res.status(status).json(result);
  } catch (err) {
    if (wantDebug) {
      return res.status(500).json({ ok: false, error: { message: err?.message || String(err), code: err?.code, command: err?.command, details: err?.details } });
    }
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;