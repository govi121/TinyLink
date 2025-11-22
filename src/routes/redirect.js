const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /:code -> redirect
router.get('/:code', async (req, res, next) => {
  const code = req.params.code;
  // avoid accidental matching paths (like /api or /healthz). 
  // We'll mount this router after API and health routes so it's safe.

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return res.status(404).send('Not found');

  // increment click count & update lastClickedAt
  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClickedAt: new Date() }
  });

  res.redirect(302, link.targetUrl);
});

module.exports = router;
