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
