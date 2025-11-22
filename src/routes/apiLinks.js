const express = require('express');
const router = express.Router();
const prisma = require('../db');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// helper: generate random alnum code length 6
function generateCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// POST /api/links  -> create link
router.post('/', async (req, res) => {
  const { longUrl, code } = req.body;

  if (!longUrl || typeof longUrl !== 'string' || !isValidUrl(longUrl)) {
    return res.status(400).json({ error: 'Invalid or missing longUrl' });
  }

  let finalCode = code && String(code).trim();

  if (finalCode) {
    if (!CODE_REGEX.test(finalCode)) {
      return res.status(400).json({ error: 'Custom code must match /^[A-Za-z0-9]{6,8}$/' });
    }
    // check uniqueness
    const existing = await prisma.link.findUnique({ where: { code: finalCode } });
    if (existing) return res.status(409).json({ error: 'Code already exists' });
  } else {
    // generate unique code
    let tries = 0;
    do {
      finalCode = generateCode(6);
      tries++;
      const exists = await prisma.link.findUnique({ where: { code: finalCode } });
      if (!exists) break;
    } while (tries < 10);
    // if somehow still exists, extend to 7 and try again
    if (!finalCode) return res.status(500).json({ error: 'Could not generate unique code' });
  }

  const created = await prisma.link.create({
    data: {
      code: finalCode,
      targetUrl: longUrl
    }
  });

  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return res.status(201).json({
    code: created.code,
    shortUrl: `${base}/${created.code}`,
    targetUrl: created.targetUrl,
    clicks: created.clicks,
    createdAt: created.createdAt
  });
});

// GET /api/links -> list all
router.get('/', async (req, res) => {
  const list = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(list);
});

// GET /api/links/:code -> stats
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return res.status(404).json({ error: 'Not found' });
  res.json(link);
});

// DELETE /api/links/:code -> delete
router.delete('/:code', async (req, res) => {
  const code = req.params.code;
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return res.status(404).json({ error: 'Not found' });
  await prisma.link.delete({ where: { code } });
  res.json({ ok: true });
});

module.exports = router;
