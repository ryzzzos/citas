# Agenda Web

SaaS platform for appointment management where customers can discover businesses and book services, and business owners can manage their agenda.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS

## Project Structure

```text
.
|- backend/
|- frontend/
|- docs/
|- CHANGELOG.md
`- README.md
```

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs

### 2) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend: http://localhost:3000

## Versioning

- Keep `CHANGELOG.md` updated on every release-worthy change.
- Use semantic tags (`vMAJOR.MINOR.PATCH`).
- Suggested commit style:
  - `feat: ...`
  - `fix: ...`
  - `docs: ...`
  - `chore: ...`

## First Release Snapshot

Current baseline: `v0.1.0`

## Business Onboarding Flow (Mandatory)

- Registration keeps account type selector (`customer` / `business_owner`).
- Registering as `business_owner` does not create a business implicitly.
- On authenticated navigation, onboarding status is derived from domain state:
  - Pending when role is `business_owner` and `GET /api/v1/businesses/me` returns `404 Business profile not created`.
  - Completed when `GET /api/v1/businesses/me` returns `200`.
- Pending business owners are forced to `/onboarding/business`.
- After creating business profile, user is redirected to `/dashboard/agenda`.

## Guarded Routes And Exceptions

- Guarded by centralized frontend session guard:
  - All authenticated routes for `business_owner` without business profile.
- Exceptions allowed during pending onboarding:
  - `/auth/*`
  - `/onboarding/business`
- Navigation rules:
  - `customer` never stays in `/onboarding/business`.
  - `business_owner` with business cannot stay in `/onboarding/business` (redirects to `/dashboard/agenda`).
  - `admin` is not blocked by onboarding flow.

## Manual Smoke Test

### Backend

1. Login as `customer`, call `GET /api/v1/businesses/me`.
Expected: `403 Business owner role required`.

2. Login as `business_owner` without business, call `GET /api/v1/businesses/me`.
Expected: `404 Business profile not created`.

3. Create business via `POST /api/v1/businesses/` as same owner.
Expected: `201` with business payload.

4. Retry `POST /api/v1/businesses/` with same owner.
Expected: `409 Business profile already exists`.

5. Call `GET /api/v1/businesses/me` after creation.
Expected: `200` with owner business.

### Frontend

1. Register with role `Negocio`, then login.
Expected: forced navigation to `/onboarding/business`.

2. While onboarding pending, try `/dashboard` and `/dashboard/agenda` manually.
Expected: forced back to `/onboarding/business`.

3. Complete onboarding form at `/onboarding/business`.
Expected: business is created and app redirects to `/dashboard/agenda`.

4. Logout/login again with same business owner.
Expected: user does not return to onboarding.

5. Visit `/onboarding/business` when owner already has business.
Expected: redirect to `/dashboard/agenda`.
