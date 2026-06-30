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

- Design should feel elegant, calm, polished, and **consumer-friendly** (B2C), with a strong Apple-inspired influence.
- **CRITICAL:** Avoid "corporate" or rigid internal-dashboard aesthetics (e.g., cramped headers, excessive greys). The UI must feel human, welcoming, and vibrant for end-users.
- Prioritize simplicity, strong typography hierarchy, balanced whitespace (let components breathe), and restrained but intentional color usage (relying strictly on `globals.css` variables).
- Use subtle animations and transitions to reinforce clarity, not decoration.
- Keep components consistent and reusable to preserve visual coherence as features scale.

### Design Tokens Strict Compliance (CRITICAL)

- **DO NOT invent or hardcode Tailwind utility values** for shadows, borders, radii, or colors. 
- **ALWAYS** use the exact CSS variables defined in `frontend/app/globals.css`.
  - Backgrounds: `bg-[var(--surface-0)]`, `bg-[var(--surface-1)]`, `bg-[var(--surface-2)]`, `bg-[var(--surface-3)]`.
  - Shadows: `shadow-[var(--shadow-sm)]`, `shadow-[var(--shadow-md)]`, `shadow-[var(--shadow-lg)]` (Never use `shadow-sm`, `shadow-md`, etc.).
  - Radii: `rounded-[var(--radius-sm)]`, `rounded-[var(--radius-lg)]`, `rounded-[var(--radius-2xl)]`.
  - Borders: `border-[var(--border-strong)]`, `border-[var(--border-soft)]`.
  - Text: `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, `text-[var(--text-muted)]`.
  - Accents: `bg-[var(--app-primary)]`, `text-[var(--color-pending)]`, etc.
  - **Note on Semantic Colors**: Do not be afraid to creatively use `color-pending`, `color-info`, `color-success`, and `color-error` for general aesthetic design elements (like badges, active states, soft backgrounds, glowing shadows) even if the context isn't strictly an "error" or "info" alert. They are part of the vibrant palette.

### Modals, Drawers & Forms (Apple-Inspired Standard)

- **Reference Implementation**: Use `frontend/components/business-profile/BusinessProfileEditorPage.tsx` as the gold standard for how drawers/modals must look and behave.
- **Layout & Container**:
  - The modal/drawer container must use a base surface like `bg-[var(--surface-2)]` (or `surface-0`/`surface-1` depending on context).
  - Use large border radii for the container edges (e.g., `rounded-l-[var(--radius-2xl)]` for right-side drawers).
  - Use an overlay backdrop behind the modal (`bg-[var(--text-primary)]/10 backdrop-blur-sm`).
- **Internal Grouping (Cards)**:
  - Do NOT use `<hr>` to separate form sections.
  - Group related fields into independent "cards" using `bg-[var(--surface-3)]`, `rounded-[var(--radius-lg)]`, `border-[var(--border-strong)]`, and `shadow-[var(--shadow-sm)]`.
  - Inside these cards, inputs/fields should typically use a slightly offset background for contrast, such as `bg-[var(--surface-2)]`.
- **Animations**:
  - Always use `framer-motion` (`<AnimatePresence>` and `<motion.div>`) for mounting/unmounting modals.
  - Use custom easing curves for premium slide-in/slide-out effects (e.g., `ease: [0.32, 0.72, 0, 1]`) instead of default linear animations.

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
- **CRITICAL:** DO NOT use the browser subagent (`browser_subagent`) to test or verify UI changes. It is slow, not optimal, and prone to environmental failures. Always rely on static analysis, `pnpm build` / `tsc` checks, or developer/manual browser testing. Never invoke browser automation.

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
- **Git Tagging & Release Protocol**:
  1. Validate codebase builds (`pnpm lint` and `pnpm build`).
  2. Bump the version in `frontend/package.json`.
  3. Update `CHANGELOG.md` under the corresponding version.
  4. Stage, commit (`git commit -m "<msg>"`), and push changes to `main`.
  5. Create a local annotated Git tag: `git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH"`.
  6. Push the tag to the remote origin: `git push origin vMAJOR.MINOR.PATCH`.

## UX & Role Separation Paradigm (Customer vs. Entrepreneur)

Always maintain a strict separation of concerns between customer-facing views and business owner (entrepreneur) dashboards:

1. **Customer-Facing Views (`/[slug]`, `/sucursales`)**:
   - The user profile, branch map, and booking drawer are designed exclusively for customers.
   - Dialogues, text copy, and instructions must be simple, welcoming, and completely free of business jargon (e.g. "Workspace", "Overview", "Filtro mensual").
   - Upon successful appointment booking, **do NOT redirect the customer to `/dashboard`**. Instead, show a dedicated success view/confirmation directly in the booking interface (like a wallet receipt card in the drawer) so they stay on the business profile.

2. **Business Owner/Entrepreneur Dashboard (`/dashboard/*`)**:
   - The dashboard is exclusively for business owners to manage schedules, view statistics, and adjust parameters.
   - It must NOT contain customer-focused navigation or features (e.g. do not show the "Explorar sucursales" or "Explorar" compass button in the dashboard shell). Keep the owner focused on operational metrics.

---

## Agent Usage Notes

- This file is the canonical repository-wide instruction file for coding agents.
- Keep `README.md` focused on human contributors; keep agent-specific operational guidance here.
- If nested `AGENTS.md` files are added later, the nearest one to the modified code takes precedence.
- As the project grows, continuously update this file when architecture, design direction, workflows, or business rules change.

