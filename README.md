# TinyLink (Node + Express + Prisma)

## Setup (local)
1. Copy `.env.example` to `.env` and fill `DATABASE_URL` and optionally `BASE_URL`.
2. Install:
   npm install
3. Initialize Prisma:
   npx prisma generate
   npx prisma migrate dev --name init
4. Start server:
   npm run dev
5. Open: http://localhost:3000

## Endpoints
- GET  /               -> dashboard UI
- GET  /code/:code     -> stats UI
- GET  /:code          -> redirect (302)
- GET  /healthz        -> health JSON
- POST /api/links      -> create (body: { longUrl, code? })
- GET  /api/links      -> list
- GET  /api/links/:code -> single
- DELETE /api/links/:code -> delete
