require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API routes
const apiLinks = require('./routes/apiLinks');
app.use('/api/links', apiLinks);

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Serve stats page route (static file public/code.html handles fetching)
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'code.html'));
});

// Redirect route (must be after other routes)
const redirect = require('./routes/redirect');
app.use('/', redirect);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyLink listening on http://localhost:${PORT}`);
});


/*

    npx prisma generate
    npx prisma migrate dev --name init
    npm run dev

    `prisma generate`,`npx prisma migrate dev --name init`,`npm run dev`
    `npm install`, `express`, `dotenv`, `@prisma/client@^5.0.0`
*/