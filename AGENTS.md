# AGENTS.md: Agenda Web Platform

## Overview

A SaaS platform that allows service businesses (spas, barbershops, beauty salons, medical practices, etc.) to manage their schedule and allow clients to book appointments online.

## User Types

1. **Customers** – search businesses, view services, book appointments.
2. **Business owners** – register their business, define services, manage schedules and reservations.

## Architecture

```
agenda-web/
├── docs/                    ← project documentation
├── backend/                 ← FastAPI (Python) REST API
└── frontend/                ← Next.js frontend
```

## Dev Environment Tips

- Backend dependencies live in `backend/requirements.txt`. Use a Python virtual environment and install with `pip install -r backend/requirements.txt`.
- Apply database migrations before validating backend changes: `alembic upgrade head` (run from `backend/`).
- Run backend API locally from `backend/` with `uvicorn main:app --reload`.
- Run frontend locally from `frontend/` with `pnpm install` and `pnpm dev`.
- Frontend validation commands are `pnpm lint` and `pnpm build` from `frontend/`.

### Frontend (frontend/)
- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Responsibilities**: Customer UI, business dashboard, marketplace
- **Must be**: responsive, mobile-friendly

### Frontend UI Architecture Decisions

- **Dashboard shell pattern**: use a left sidebar navigation layout for all dashboard routes.
- **Layout ownership**: create `frontend/app/dashboard/layout.tsx` as the shared shell for dashboard pages.
- **Sidebar component**: create and keep navigation in `frontend/components/layout/DashboardSidebar.tsx`.
- **Componentization rule**: keep route files focused on page content and data; navigation/chrome belongs to reusable components.
- **Responsive behavior**: desktop = fixed left sidebar, mobile/tablet = collapsible drawer with keyboard and screen-reader support.
- **Routing**: sidebar items must use Next.js App Router links and clearly represent dashboard sections.
- **Visual direction**: elegant and premium interface with clean layouts, careful spacing, and subtle depth; slightly inspired by Apple design language while keeping dashboard usability.
- **Accessibility baseline**: visible focus states, semantic landmarks (`aside`, `nav`, `main`), `aria-current` on active item, and minimum touch target sizes.
- **Design tokens**: centralize colors, spacing, radii, and shadows through reusable Tailwind utility patterns or CSS variables.

## Design Context

- Design should feel elegant, calm, and polished, with a slight Apple-inspired influence.
- Prioritize simplicity, strong typography hierarchy, balanced whitespace, and restrained color usage.
- Use subtle animations and transitions to reinforce clarity, not decoration.
- Keep components consistent and reusable to preserve visual coherence as features scale.

### Backend (backend/)
- **Framework**: FastAPI (Python)
- **Responsibilities**: business logic, authentication, bookings, payments, geolocation, user management
- **Consumed by**: web frontend and future mobile apps

### Database
- **Engine**: PostgreSQL
- **ORM**: SQLAlchemy 2.x (async-compatible)
- **Migrations**: Alembic

---

## Data Model Guidance

- Do not duplicate the full table-by-table schema in this file to avoid drift.
- Source of truth for DB structure is:
	- `backend/app/models/`
	- `backend/app/schemas/`
	- `backend/alembic/versions/`
- Keep only high-value domain rules and invariants in `AGENTS.md`.

---

## MVP Scope

1. User registration and login (JWT)
2. Business registration
3. Service creation by business
4. Basic schedule configuration
5. Appointment booking system
6. Agenda view for businesses

## Business Rules

- **No double-booking**: a staff member cannot have two overlapping bookings.
- **Duration**: each service has `duration_minutes` that determines the booking time block.
- **Availability check**: bookings must validate staff availability before confirmation.

## Testing Instructions

- Frontend checks: from `frontend/`, run `pnpm lint` and `pnpm build`.
- Backend has no automated test suite yet; run the manual onboarding smoke tests documented in `README.md`.
- When changing booking or schedule logic, validate no double-booking scenarios with manual API checks.
- After schema changes, create and apply migration files with `alembic revision --autogenerate -m "<message>"` and `alembic upgrade head`.

## Coding Conventions

- **Modular architecture**: separate routers, services, repositories
- **Schema validation**: Pydantic v2 for all input/output
- **Migrations**: always use Alembic, never modify schema manually
- **Error handling**: use HTTPException with clear status codes and messages
- **Clean code**: descriptive names, single-responsibility functions
- **Dashboard composition**: keep dashboard navigation reusable and isolated in `frontend/components/layout/`.

## Key Paths

| Path | Purpose |
|------|---------|
| `backend/app/models/` | SQLAlchemy ORM models |
| `backend/app/schemas/` | Pydantic request/response schemas |
| `backend/app/routers/` | FastAPI route handlers |
| `backend/app/services/` | Business logic (framework-agnostic) |
| `backend/app/core/` | Config, security, dependencies |
| `backend/alembic/` | Database migrations |
| `frontend/app/` | Next.js App Router pages |
| `frontend/components/` | Reusable React components |
| `frontend/lib/` | API client and utilities |
| `frontend/types/` | Shared TypeScript types |

## PR Instructions

- Prefer concise commits with prefixes like `feat:`, `fix:`, `docs:`, and `chore:` when applicable.
- Update `CHANGELOG.md` on release-worthy changes.
- Preserve the mandatory onboarding flow for `business_owner` users.

## Agent Usage Notes

- This file is the canonical repository-wide instruction file for coding agents.
- Keep `README.md` focused on human contributors; keep agent-specific operational guidance here.
- If nested `AGENTS.md` files are added later, the nearest one to the modified code takes precedence.
- As the project grows, continuously update this file when architecture, design direction, workflows, or business rules change.
