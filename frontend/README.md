# Agenda Web — Frontend (Next.js 16 + React 19)

Frontend application for Agenda Web platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack & Tooling

- **Framework**: Next.js 16 (App Router) + React 19
- **Package Manager**: pnpm (`pnpm@10.6.5`)
- **Styling**: Tailwind CSS v4 + Design System CSS Variables
- **Icons & UI**: Lucide React + Framer Motion
- **Maps**: Leaflet + MapTiler / OpenStreetMap

## Development

```bash
pnpm install
pnpm dev
```

Server runs on: [http://localhost:3000](http://localhost:3000)

## Code Quality & Build Validation

```bash
pnpm lint
pnpm build
```

## Production Deployment (Render / Vercel)

- **Root Directory**: `frontend`
- **Build Command**: `pnpm install --frozen-lockfile && pnpm build`
- **Start Command**: `pnpm start`
- **Required Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL of the deployed FastAPI backend (e.g. `https://your-backend.onrender.com/api/v1`)
  - `NEXT_PUBLIC_MAPTILER_API_KEY`: MapTiler API Key (restricted to your production domain)
