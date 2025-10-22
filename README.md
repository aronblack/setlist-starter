# Grateful Dead Setlist Builder — Starter (with CRUD)

Next.js + React + TypeScript + styled-components + Supabase + Vercel KV (Upstash) scaffold.

## Quick Start

```bash
pnpm i
cp .env.local.example .env.local
pnpm dev
```

Open http://localhost:3000

## Included
- App Router pages (Explore, Show, Builder, Share)
- styled-components SSR + Prettier (no semicolons)
- Archive.org proxy routes: `/api/search`, `/api/item` (KV caching)
- Supabase SQL migration + CRUD endpoints under `/api/setlists/*`
- Minimal Player & Builder prototypes
- Supabase auth-helpers in API routes to read user from cookies

## Auth
Configure Supabase (GitHub or Email magic link). Apply the SQL in `supabase/sql/001_init.sql` to enable tables + RLS.
