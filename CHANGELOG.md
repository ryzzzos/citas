# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.2.0] - 2026-04-20

### Added
- Business geocoding pipeline in backend with dedicated `geocoding_service`, schema fields, and migration support for geocoding status.
- Operational scripts for backfilling/re-geocoding business locations and seeding demo businesses.
- New public business route based on slug at `frontend/app/[slug]/page.tsx`.
- New `sucursales` discovery module with map canvas, markers, filters, and detail sheet components.
- UI utility additions including `magic-card` integration and shared frontend utility helpers.

### Changed
- Extended business router and business schemas to support geocoding lifecycle and enriched business profile data.
- Updated dashboard shell and navigation to align with the new public business and branch-discovery experience.
- Refined business profile, services list, service form modal, navbar, and homepage behavior for the new flow.
- Updated frontend and backend dependencies/configuration to support the new discovery and location features.

### Removed
- Removed legacy marketplace pages under `frontend/app/marketplace/` in favor of the new route and discovery structure.
- Removed outdated business profile resolver helper and old showcase component.
- Removed stale project context document in `docs/project_context.md`.

## [0.2.1] - 2026-04-28

### Added
- Small improvements to the agenda UI and timeline rendering to improve readability and mobile spacing.
- New UI components and form controls: `Button`, `Input`, and `AppIcon` refinements.

### Changed
- Refinements to `BusinessProfileEditorPage` and profile preview behavior for a smoother edit/preview flow.
- Dashboard layout and navigation tweaks to improve focus on profile and services pages.
- Replaced `frontend/lib/utils.ts` with localized utility functions in components (removed global util file).

### Fixed
- Various UI spacing and responsive bugs in the dashboard and sucursales discovery components.

## [0.2.2] - 2026-04-29

### Changed
- Agenda rendering and timeline spacing: improved day column layout and mobile gutter spacing in `frontend/components/agenda/`.
- Minor fixes in `sucursales` filters panel for consistent filter collapsing behavior.
- Removed temporary debug script `fix_glass.js` from the tree.

### Fixed
- Corrected editor/preview synchronization in `BusinessProfileEditorPage` to avoid stale preview state after saves.
- Small bugfixes for booking card display times and responsive wrapping.

## [0.1.7] - 2026-04-04

### Added
- Business profile identity fields in backend and migration support: `slug`, `cover_image_url`, `logo_image_url`, `whatsapp_phone`, and `public_bio`.
- New business profile module in dashboard with dedicated route, editor hook, and reusable profile components.
- Slug availability and business lookup by slug endpoints for public profile addressing.
- Business cover and logo image upload endpoints with file type and size validation.
- Reusable `AppIcon` UI component for consistent icon rendering.

### Changed
- Extended business schemas and API contracts in backend/frontend for the new profile identity model.
- Updated dashboard navigation and layout to include business profile management flow.
- Refined dashboard and agenda UI components to align with the new navigation and profile experience.
- Updated services filters/header and business API clients/types to support profile preview and editor workflows.

### Fixed
- Enforced slug normalization, reserved word checks, and uniqueness handling to avoid collisions in business public URLs.

## [0.1.6] - 2026-04-03

### Added
- New services management module in dashboard with list, filters, create/edit modal, and row actions.
- Image upload support for services via backend endpoint and static storage mounting.
- Alembic migration to add `image_url` column to `services` table.
- Theme infrastructure in frontend with `next-themes`, custom provider, and animated theme toggler.
- Dashboard visual system documentation in frontend docs.

### Changed
- Expanded backend service schemas and validations for name, duration, price, and `image_url`.
- Updated services API client and types for image upload, include inactive services, and richer service payloads.
- Refined dashboard shell, homepage cards, marketplace detail screen, and agenda modules to match the new visual system.
- Updated global CSS tokens and utilities to unify surfaces, typography, focus states, and motion rules.

### Fixed
- Booking creation now validates that selected service belongs to the same business as the booking.

## [0.1.5] - 2026-03-31

### Added
- Modularized agenda architecture with dedicated components for filters, header, timeline, states, and booking cards.
- New agenda utility layer with calendar calculations, timezone helpers, and type definitions under `frontend/lib/agenda/`.
- Timezone support in backend with `tzdata` dependency for robust date/time handling across regions.
- Extended bookings API with enhanced filtering and status management in backend routers.

### Changed
- Refactored agenda page from monolithic component to orchestrator pattern with modular sub-components.
- Improved data fetching with dedicated `useAgendaData` hook for centralized agenda state management.
- Updated dashboard layout to better support modularized agenda views and filters.

### Refactor
- Split large agenda component tree into focused, testable, and reusable components for better maintainability.
- Better separation of concerns between data layer, UI components, and business logic.

## [0.1.4] - 2026-03-23

### Added
- First navigable dashboard experience with dedicated layout, sidebar navigation, and agenda module views.
- Business onboarding flow in frontend with session guard and business profile creation screen.
- Backend migration to enforce one business profile per owner using a unique constraint.

### Changed
- Updated navbar and dashboard UI structure to support new dashboard navigation behavior.
- Extended frontend business API helpers with owner-specific business retrieval.
- Updated project and backend documentation to reflect onboarding and dashboard structure.

## [0.1.3] - 2026-03-16

### Added
- Added the initial Alembic schema migration for core domain tables.
- Added Windows-oriented backend setup and PostgreSQL bootstrap instructions.

### Changed
- Renamed the project branding from `Citas` to `Agenda Web` across backend and frontend UI text.
- Updated backend settings defaults to use `agenda_web_db` and support JSON or comma-separated `ALLOWED_ORIGINS` values.
- Updated package metadata and project context documentation to reflect the new naming and structure.

### Fixed
- Added missing backend dependencies for email validation and bcrypt compatibility.

## [0.1.2] - 2026-03-16

### Changed
- Refactored frontend API access into modular files under `frontend/lib/api/`.
- Split frontend domain types into dedicated files under `frontend/types/` and kept centralized exports via `frontend/types/index.ts`.

### Chore
- Ignored local assistant tooling artifacts to keep repository status clean.

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
