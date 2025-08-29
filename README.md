# ThaiTable Restaurant Management System

This repository contains the source code for **ThaiTable**, a multi-tenant restaurant management platform built specifically for the Thai market.

## Monorepo Structure

```
backend/   # Node.js + Express + TypeScript API
frontend/  # React + Vite + TypeScript web dashboard (to be scaffolded)
.vscode/   # Workspace configuration
```

## Getting Started (Backend)

```bash
# install deps
cd backend
npm install

# start dev server with auto-reload
env PORT=3000 npm run dev
```

Once the frontend scaffold is generated, you will be able to start it with `npm run dev` inside the `frontend` folder.

## Tech Stack
- Node.js 20+, Express 4.18+, TypeScript 5
- React 18, Vite 4, Tailwind CSS 3
- PostgreSQL 15 via Prisma ORM

See `docs/` and the detailed project plan for full technology and phase breakdown.

---

Made with ❤️  for Thai restaurants.
