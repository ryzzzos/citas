# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.1.1] - 2026-03-15

### Changed
- Repository root normalized to the project directory (`citas`) so tracked paths are now directly under `backend/`, `docs/`, and `frontend/`.

### Docs
- Updated root documentation to reflect the new repository layout and release workflow.

## [0.1.0] - 2026-03-15

### Added
- Backend API with FastAPI, SQLAlchemy models, Alembic setup, auth and booking routes.
- Domain modules for users, businesses, services, staff, schedules, bookings, and payments.
- Frontend with Next.js + TypeScript including auth, dashboard, marketplace, and business detail pages.
- Shared UI components and API client structure for frontend integration.
- Project documentation in docs/project_context.md.

### Notes
- Initial public baseline for continued development.
