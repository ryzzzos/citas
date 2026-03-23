# Project Context: Agenda Web Platform

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

### Frontend (frontend/)
- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Responsabilities**: Customer UI, business dashboard, marketplace
- **Must be**: responsive, mobile-friendly

### Frontend UI Architecture Decisions

- **Dashboard shell pattern**: use a left sidebar navigation layout for all dashboard routes.
- **Layout ownership**: create `frontend/app/dashboard/layout.tsx` as the shared shell for dashboard pages.
- **Sidebar component**: create and keep navigation in `frontend/components/layout/DashboardSidebar.tsx`.
- **Componentization rule**: keep route files focused on page content and data; navigation/chrome belongs to reusable components.
- **Responsive behavior**: desktop = fixed left sidebar, mobile/tablet = collapsible drawer with keyboard and screen-reader support.
- **Routing**: sidebar items must use Next.js App Router links and clearly represent dashboard sections.
- **Visual direction**: dark, high-contrast, card-based dashboard aesthetic inspired by modern fintech/admin products.
- **Accessibility baseline**: visible focus states, semantic landmarks (`aside`, `nav`, `main`), `aria-current` on active item, and minimum touch target sizes.
- **Design tokens**: centralize colors, spacing, radii, and shadows through reusable Tailwind utility patterns or CSS variables.

### Backend (backend/)
- **Framework**: FastAPI (Python)
- **Responsibilities**: business logic, authentication, bookings, payments, geolocation, user management
- **Consumed by**: web frontend and future mobile apps

### Database
- **Engine**: PostgreSQL
- **ORM**: SQLAlchemy 2.x (async-compatible)
- **Migrations**: Alembic

---

## Data Model

### Users
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | str | |
| email | str | unique |
| password_hash | str | bcrypt |
| phone | str | nullable |
| role | enum | customer, business_owner, admin |
| created_at | datetime | |

### Businesses
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| owner_id | UUID | FK → users |
| name | str | |
| description | str | nullable |
| category | str | spa, barbershop, salon, clinic… |
| phone | str | |
| email | str | |
| address | str | |
| city | str | |
| latitude | float | nullable |
| longitude | float | nullable |
| created_at | datetime | |

### Services
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| name | str | |
| description | str | nullable |
| duration_minutes | int | determines booking block |
| price | decimal | |
| is_active | bool | default true |

### Staff
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| name | str | |
| email | str | nullable |
| phone | str | nullable |
| is_active | bool | default true |

### Schedules
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| business_id | UUID | FK → businesses |
| staff_id | UUID | FK → staff |
| day_of_week | int | 0=Monday … 6=Sunday |
| start_time | time | |
| end_time | time | |

### Bookings
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| business_id | UUID | FK → businesses |
| service_id | UUID | FK → services |
| staff_id | UUID | FK → staff |
| booking_date | date | |
| start_time | time | |
| end_time | time | calculated from service duration |
| status | enum | pending, confirmed, cancelled, completed |

### Payments
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| booking_id | UUID | FK → bookings |
| amount | decimal | |
| currency | str | default "USD" |
| status | enum | pending, paid, refunded, failed |
| payment_method | str | |
| transaction_id | str | nullable |

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

## How to Use This Context

When working on this project with an AI assistant, start your session with:

> Use the project context from docs/project_context.md

This ensures the assistant understands the architecture, data model, and conventions before writing any code.
