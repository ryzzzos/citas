# Citas — Backend (FastAPI)

## Setup

```bash
cd backend

# Create and activate virtualenv
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run DB migrations
alembic upgrade head

# Start dev server
uvicorn main:app --reload
```

Interactive docs available at http://localhost:8000/docs

## Project structure

```
backend/
├── main.py                  ← FastAPI app entry point
├── alembic.ini              ← Alembic config
├── alembic/
│   ├── env.py               ← Migration environment
│   └── versions/            ← Generated migration files
└── app/
    ├── core/
    │   ├── config.py        ← Settings (pydantic-settings)
    │   ├── security.py      ← JWT + password hashing
    │   └── deps.py          ← FastAPI dependencies
    ├── database.py          ← SQLAlchemy engine & session
    ├── models/              ← ORM models
    ├── schemas/             ← Pydantic request/response schemas
    ├── routers/             ← Route handlers (thin layer)
    └── services/            ← Business logic
```

## Generating a new migration

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register a new user |
| POST | /api/v1/auth/login | Login, returns JWT |
| GET | /api/v1/users/me | Current user profile |
| POST | /api/v1/businesses/ | Create business (owner) |
| GET | /api/v1/businesses/ | List businesses (filter by city/category) |
| GET | /api/v1/businesses/{id} | Business detail |
| POST | /api/v1/businesses/{id}/services | Add service |
| GET | /api/v1/businesses/{id}/services | List services |
| POST | /api/v1/businesses/{id}/staff | Add staff member |
| GET | /api/v1/businesses/{id}/staff | List staff |
| POST | /api/v1/businesses/{id}/schedules | Set schedule |
| GET | /api/v1/bookings/availability | Available time slots |
| POST | /api/v1/bookings/ | Book appointment |
| GET | /api/v1/bookings/my | Customer's bookings |
| GET | /api/v1/bookings/business/{id} | Business agenda |
| PATCH | /api/v1/bookings/{id}/status | Update booking status |
