# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.



## [0.4.7] - 2026-06-30

### Refactored
- **Panel de Filtros de Sucursales**:
  - **Simplificación de Props**: Extracción de propiedades comunes del panel a un objeto compartido (`sharedPanelProps`), reduciendo la duplicación de código en los layouts de escritorio y móvil.
  - **Refinamiento de Diseño de Escritorio**: Ajuste del ancho del panel lateral de búsqueda a 380px, agregando espaciado uniforme y comentarios delimitadores claros.
  - **Pulido Visual de Dispositivos Móviles**: Reducción de la intensidad del fondo oscuro en el cajón de filtros (`bg-black/50` con desenfoque suave) y ajuste de dimensiones y padding en el botón flotante de exploración.
  - **Cumplimiento Estricto de Tokens**: Adaptación del panel de filtros para utilizar estrictamente las variables de diseño declaradas en `globals.css` (sombras, bordes y superficies).
  - **Limpieza de Código**: Eliminación de imports y variables sin uso (como `MapPin` en `SucursalesFiltersPanel.tsx`).

## [0.4.6] - 2026-06-24

### Added
- **Soporte Multizona (Timezone Awareness)**:
  - **Backend**: El servicio de disponibilidad (`availability_service.py`) ahora resuelve y calcula las ranuras de tiempo usando la zona horaria del negocio respectivo (`business.timezone`), previniendo desajustes horários.
  - **Frontend**: Sincronización dinámica de la zona horaria del negocio en `AgendaPage.tsx` durante el renderizado, recalculando la fecha de anclaje de manera automática.
- **Transiciones de Tema Fluidas**:
  - **Animación Coordinada**: Introducción de la clase `.theme-transition` en `globals.css` para suavizar los cambios de color y fondo en un intervalo de 300ms.
  - **Compatibilidad con Mapas**: El toggler de tema detecta elementos de mapas Leaflet (`.leaflet-container`) y evita el uso del View Transition API en estos casos para prevenir parpadeos visuals molestos.
- **Optimizaciones de Rendimiento en Mapas**:
  - **Memoización de Marcadores**: Migración a componentes React `memo` (`SucursalMarker` y `ClusterMarker`) en `SucursalesMapMarkers.tsx`.
  - **Caché de Iconos Leaflet**: Almacenamiento en caché (`Map`) de los objetos `DivIcon` para evitar la recreación y el desbordamiento de memoria al arrastrar o hacer zoom en el mapa.
- **Ficha de Cita Exitosa (Ticket Receipt)**:
  - Rediseño completo en `ServiceBookingDrawer.tsx` para mostrar un recibo/ticket de reserva al confirmar la cita en lugar de redirigir al usuario hacia la vista del dashboard.
- **Separación de Roles de Usuario**:
  - Se eliminó el enlace de exploración pública del dashboard de administrador (`layout.tsx`) respetando las directrices de `AGENTS.md`.

### Fixed
- **Validaciones en Calentadrio**: Prevención de reservas en fechas pasadas en la disponibilidad del backend.
- **Estabilidad de Renders**: Eliminación de linter warnings de renderizado en cascada y casts `any` de Typescript en componentes del mapa y agenda.

## [0.4.5] - 2026-06-20

### Added
- **Diseño Adaptable de Citas por Densidad**:
  - **Tres Niveles de Densidad**: Rediseño de las tarjetas en `AgendaTimeline.tsx` según su altura (Compacta < 45px, Mediana 45px-90px, Grande >= 90px) para acomodar la información de manera óptima según la duración de la cita.
  - **Control de Estado de Citas en Drawer**: Integración de un componente `SegmentedControl` en el panel de detalles que permite alternar dinámicamente entre los estados de la cita (*Pendiente*, *Confirmada*, *Completada*) y un botón dedicado para *Cancelar*.
  - **Efectos Premium de Tarjetas**: Inclusión de contornos difuminados dinámicos con gradientes y efecto de brillo (*glow*) en hover.

### Fixed
- **Estabilidad y Reglas de React Compiler**: Eliminación de renders en cascada innecesarios al sincronizar la inicialización del estado del drawer sin `useEffect`.
- **Casts de TypeScript**: Reemplazo de casts de tipo `any` en propiedades CSS por un tipado seguro en `AgendaTimeline.tsx`.

## [0.4.4] - 2026-06-19

### Added
- **Detalle de Cita Interactivo (Agenda Detail Drawer)**:
  - **Ficha del Cliente**: Panel lateral derecho con diseño Apple-inspired y transiciones fluidas de `framer-motion` que se despliega al hacer clic en las citas de la línea de tiempo. Muestra la información del cliente, el profesional a cargo y notas.
  - **Contactabilidad Directa**: Incorporación de botones de acción rápida para realizar llamadas (`tel:`) y abrir chats de WhatsApp pre-configurados.
  - **Confirmación y Acciones**: Controles interactivos directos desde el Drawer para Confirmar y Cancelar la cita al instante.

### Changed
- **Restricción Horaria (6 AM - 10 PM)**:
  - **Modelo de Negocio Estricto**: Validación en el backend (`booking_service.py` y `schedule.py` schema) para prohibir la creación de turnos u horarios laborales fuera del rango de 06:00 a 22:00.
  - **Timeline de Agenda Limpio**: Reducción del canvas en `AgendaTimeline.tsx` a un rango de 16 horas. Se recalculó la coordenada de altura y el posicionamiento dinámico de las tarjetas, y se condicionó el indicador de hora actual (`CurrentTimeLine`) para ocultarse fuera del horario comercial.

## [0.4.3] - 2026-06-19

### Changed
- **Calendario Horizontal Semanal (`AgendaHorizontalDays.tsx`)**: Rediseño premium de la visualización semanal en el selector horizontal de la agenda. Incorpora un número de semana de alto impacto visual y un divisor acentuado, además de optimizar la estabilidad en el desplazamiento automático y controlar la animación de cambio de vista para evitar brincos en la interfaz.

## [0.4.2] - 2026-06-19

### Added
- **Intervalos en Horarios (`TimeRangeSlider` & `StaffScheduleModal`)**:
  - **Componente Visual**: Incorporación de un deslizador interactivo de rango horario (`TimeRangeSlider.tsx`) que permite definir de forma táctil y visual el turno laboral y el horario de descanso de cada empleado.
  - **Migración a Intervalos JSONB**: Migración del esquema de base de datos de horarios para almacenar intervalos estructurados en formato JSONB en lugar de una hora fija de inicio y fin.
- **Reservas de Invitados (Guest Checkout)**:
  - **Flexibilidad de Cuenta**: Modificación de las relaciones de reservas en la base de datos para admitir reservas anónimas (`user_id` es ahora opcional y utiliza `SET NULL` en cascada inversa).
  - **Campos de Contacto de Invitados**: Incorporación de campos dedicados a capturar nombre, correo, teléfono, WhatsApp y notas de clientes no registrados directamente en el registro de reservas.
- **Perfiles de Personal con Fotos**:
  - **Atributo Visual**: Adición de la columna `photo_url` al modelo de base de datos `Staff` para desplegar fotografías del personal en la interfaz pública de reservas.
  - **Componente Booking Drawer**: Nuevo panel lateral `ServiceBookingDrawer.tsx` para una selección intuitiva y fluida de servicios del perfil público.
- **Documentación de Lanzamiento (`AGENTS.md`)**:
  - **Protocolo de Releases**: Inclusión formal de las directrices y secuencia de comandos Git para efectuar compilaciones, documentaciones, y etiquetados de versiones (Git tags).

### Changed
- **Motor de Disponibilidad Avanzado (`availability_service.py`)**:
  - **Disponibilidad Multiempleado**: El endpoint `/bookings/availability` ahora devuelve un diccionario estructurado que mapea horas a listas de ID de profesionales disponibles, permitiendo verificar disponibilidad sin requerir seleccionar previamente a un empleado específico.
  - **Cálculo de Huecos con Intervalos**: Adaptación del algoritmo de cálculo de horarios libres para procesar los intervalos dinámicos del JSONB de `Schedule`.
- **Dependencias**:
  - Instalación de la librería `date-fns` en el frontend para formateo rápido y manipulación de fechas en los nuevos componentes de agenda.

### Fixed
- **Compilación de React Compiler (`TimeRangeSlider.tsx`)**:
  - **Memoización de Intervalos**: Ajuste de la función `updateIntervals` y el handler de movimiento del cursor usando `useCallback` para cumplir con las estrictas reglas de dependencias del compilador de React 19.

## [0.4.1] - 2026-06-02

### Changed
- **Git Ignoring Specifications (`.gitignore`)**: Added specific patterns to permanently ignore local launch scripts and text editor backup files (`backup_editor.txt`) to protect repository cleanliness and security.

### Removed
- **Unnecessary Remote Script Assets**: Untracked `start.bat`, `start.ps1`, and `backup_editor.txt` from the Git repository index to ensure local helper scripts and plain-text editor backups are kept in the local workspace but not stored on the public GitHub remote repository.

## [0.4.0] - 2026-06-02

### Added
- **Soporte Multisede (Arquitectura de Sucursales)**:
  - **Base de Datos & Modelado**: Incorporación del modelo `Branch` (`backend/app/models/branch.py`) para soportar la gestión de múltiples sedes físicas por negocio. Incluye campos de geolocalización (`latitude`, `longitude`, `geocoding_status`, `geocoded_at`) e integración directa con servicios de geocodificación automática.
  - **CRUD de Sucursales**: Implementación del router `/businesses/{business_id}/branches` en el backend para crear, actualizar, listar y eliminar sedes de forma autónoma.
- **Asociación de Empleados y Servicios (Relación N a N)**:
  - **Mapeo Relacional**: Creación de la tabla intermedia de unión `staff_services` para posibilitar que un profesional sea asociado únicamente a los servicios específicos que está capacitado para impartir en su sede.
  - **Esquemas & API**: Actualización de esquemas Pydantic y llamadas del cliente API frontend para incluir y sincronizar los arreglos de `service_ids` y `branch_id` al registrar o editar personal.
- **Paneles de Control para Sedes y Personal en Dashboard**:
  - **Sección "Mis sedes" (`/dashboard/branches`)**: Nueva interfaz interactiva para dueños de negocios para configurar datos principales, teléfonos de contacto directos, enlaces de WhatsApp y ubicaciones físicas de cada sucursal.
  - **Sección "Mis empleados" (`/dashboard/staff`)**: Nueva sección de administración que permite asignar profesionales a sucursales específicas, activar/desactivar sus perfiles y asociarles servicios habilitados.
- **Mecanismos de Navegación y Contexto Frontend**:
  - **Contexto Global de Sede (`BranchContext.tsx`)**: Arquitectura de contexto reactivo que persiste la sede activa seleccionada en `localStorage`, recarga la lista de sedes de forma asíncrona y simplifica la experiencia de control de la sede en todo el Dashboard.
  - **Selector de Sede (`BranchSelector.tsx`)**: Dropdown premium con soporte de imagen de logotipo y animaciones de hover integrado en el sidebar principal para alternar ágilmente el contexto del panel de control.
- **Selector Público de Ubicación para Clientes**:
  - **Barra Adherente (`StickyBranchSelector.tsx`)**: Un botón flotante premium en la página pública del negocio con animaciones vibratorias de llamada a la acción (`framer-motion`) si el cliente intenta agendar sin elegir sede.
  - **Cajón de Selección (`LocationPickerDrawer.tsx`)**: Cajón inferior (drawer) adaptado a móviles con efecto de desenfoque de fondo (backdrop blur), soporte de gestos visuales y listado de sucursales activas con direcciones detalladas.

### Changed
- **Reestructuración de la Base de Datos (Migraciones Alembic)**:
  - **De-normalización Geográfica**: Migración de las columnas de dirección, ciudad y coordenadas geográficas desde la tabla `businesses` hacia la tabla `branches`.
  - **Propiedades de Retrocompatibilidad**: Definición de propiedades virtuales (`@property`) en el modelo `Business` que apuntan dinámicamente a la primera sede ("Sede Principal") para evitar conflictos de regresión con endpoints existentes.
  - **Migraciones Secuenciales**: Creación y aplicación automática de 3 versiones de base de datos Alembic para añadir las nuevas tablas, referencias de llaves foráneas y el campo opcional de teléfono de WhatsApp.
- **Flujos de Operación en el Backend**:
  - **Creación de Negocio**: Modificación del endpoint de registro de negocios para inicializar automáticamente una "Sede Principal" por defecto con la dirección provista originalmente.
  - **Búsqueda Geográfica de Negocios**: Modificación de la consulta del mapa en `list_businesses_for_map` para enlazar y consultar contra la tabla `branches`, permitiendo buscar sucursales individuales en lugar de la entidad de negocio global.
  - **Reglas de Negocio en Reservas (`create_booking`)**: Validación estricta que impide generar citas si el profesional seleccionado no pertenece a la sucursal de destino o no está calificado para el servicio solicitado.
- **Flujos y Experiencia en Frontend**:
  - **Agrupamiento en Formulario de Reserva**: Refactorización del dropdown de selección de servicios en `[slug]/page.tsx` para anidar opciones bajo etiquetas `<optgroup>` con el nombre de su categoría correspondiente.
  - **Filtrado Dinámico en Reserva**: El selector de profesionales y servicios ahora reacciona instantáneamente a la sucursal seleccionada por el cliente, limitando las opciones únicamente a lo disponible en dicha sucursal.

### Fixed
- **Optimización de Renderizado en Formularios (`BranchFormModal` & `StaffFormModal`)**: Reemplazo de los hooks `useEffect` síncronos de inicialización por un patrón de actualización de estado durante la renderización para evitar re-renders en cascada.
- **Validaciones de Tipado en Booking Client**: Adición de la propiedad `branch_id` a la firma del método de creación de reserva `CreateBookingInput` y tipado estricto en el evento submit.
- **Corrección de Estilos en Botones**: Actualización de la prop `variant="outline"` a `variant="secondary"` en los modales de sucursales y personal para cumplir con los lineamientos de diseño premium del proyecto.

## [0.3.7] - 2026-05-28

### Added
- **Accordion Component (`Accordion.tsx`)**: Created a premium, reusable accordion component with keyboard accessibility, focus rings, and custom slide-in/slide-out animations powered by `framer-motion` using custom easing transitions.

### Changed
- **Categorized Services Layout (`BusinessProfileView.tsx`)**: Redesigned the services showcase of the business page to group active services by their corresponding category using the new Accordion. Inside each category, services are displayed inside a smooth horizontal scrolling gallery with CSS scroll-snapping and lateral fade gradient masks.
- **Service Options in Booking Page (`[slug]/page.tsx`)**: Refactored the public booking form's dropdown selector to group available services under `<optgroup>` tags representing their categories, including a fallback "Otros servicios" section.
- **Concurrent API Data Fetching (`useBusinessProfileEditor.ts`)**: Optimized profile loading to fetch both active services and categories concurrently (`Promise.all`).
- **Global CSS & Styling Utilities (`globals.css` & `magic-card.tsx`)**: Added a global `.hide-scrollbar` CSS utility to remove native scrollbars in custom horizontal viewports, and reduced `BentoCard` minimum height to `24rem` to fit perfectly into the horizontal galleries.

## [0.3.6] - 2026-05-27

### Added
- **Design Guidelines (`AGENTS.md`)**: Added strict guidelines for CSS design tokens, shadows, custom radii compliance, and the Apple-inspired standard for modal and drawer form grouping cards.

### Changed
- **Services UX Refactoring (`ServiceFormModal` & `ServiceCategoriesModal`)**: Polished visual aesthetics to match Apple Human Interface Guidelines, grouping sections into container cards (`bg-[var(--surface-3)]`) and introducing custom easing curves (`ease: [0.32, 0.72, 0, 1]`) in Framer Motion.
- **Business Profile Styling (`BusinessProfileEditorPage` & `BusinessProfileView`)**: Restructured forms into modular layout groupings with subtle shadows and custom offset backgrounds to enhance UI breathing room.
- **Services Filtering & Views (`ServicesFilters`, `ServicesList`, `ServicesHeader`)**: Polished filtering selectors, refined card sizing, added responsive list/grid toggles, and unified visual layouts.
- **API Client Core (`client.ts`)**: Structured base client requests to support unified response formats and standardized error handling.

### Fixed
- **Cascading Render Warning (`ServicesPage.tsx`)**: Resolved a critical React ESLint warning by refactoring state synchronizations to run directly inside the render cycle rather than a synchronous `useEffect`.

## [0.3.5] - 2026-05-25

### Changed
- Refined Dashboard Sidebar navigation with a `framer-motion` sliding pill animation and optimized local state for 60fps frame-perfect transitions.
- Improved Agenda UI by redesigning the Right Rail metrics into compact, horizontal cards that strictly respect the timeline's grid height.
- Styled global scrollbars (`::-webkit-scrollbar`) with a premium macOS-inspired floating pill aesthetic to seamlessly blend into light and dark themes.

### Fixed
- Fixed a layout bug in the Agenda Timeline where hour labels were vertically offset by +30 minutes, causing the current-time indicator line to visually display incorrect proportions.
- Resolved an issue in the Dashboard Sidebar where `framer-motion`'s `layoutId` collided between mobile and desktop mounts, by assigning unique prefixes.

## [0.3.4] - 2026-05-21

### Changed
- Complete premium redesign of `ServiceCategoriesModal` and `ServiceFormModal` using glassmorphism backdrops, separated layout cards, and iOS-like switches.
- Refactored Map Markers (`SucursalesMapMarkers`) into high-resolution, responsive Tailwind CSS components with interactive hover and selected states.
- Implemented a custom CSS-filtered dark mode for OpenStreetMap tiles to provide a nighttime viewing experience without losing contrast on roads and topography.

### Fixed
- Resolved a bug in the `SucursalesMapCanvas` where the map would forcefully lock back to the selected business after panning, by decoupling the camera focus controller from the array reference updates.

## [0.3.3] - 2026-05-21

### Changed
- Redesigned `SucursalesFiltersPanel` to be more consumer-friendly (B2C), breaking away from corporate dashboard aesthetics. Lowered positioning to give the navbar breathing room.
- Replaced `next-themes` and `disableTransitionOnChange` hacks with a fully custom, native View Transitions API implementation for Dark Mode toggling (`animated-theme-toggler.tsx`). This natively handles the clip-path expansion and prevents the browser's default crossfade.
- Replaced custom shadows with standard `globals.css` tokens (`var(--glass-shadow)`, `var(--shadow-md)`) across the map filter panel.

## [0.3.2] - 2026-05-21

### Fixed
- I make little corrections to agenda for better experience 
- i centralized changelog so it could  be organized by version


## [0.3.1] - 2026-05-18

### Chore
- Reorganized and normalized CHANGELOG.md entries to maintain correct semantic versioning order (newest to oldest).
- Updated package.json versioning to reflect current release baseline.

## [0.3.0] - 2026-05-12

### Added
- Service categories feature across backend and frontend with new model, schemas, API router, migration, and dedicated UI modal/hook integration.
- New shared UI surface abstraction (`Surface`) to standardize panel styling in dashboard modules.

### Changed
- Large dashboard visual system refactor in `frontend/app/globals.css` and related components to use unified surface tokens and consistent theme behavior.
- Updated services flow (`ServicesPage`, `ServicesList`, `ServiceFormModal`) to support category assignment and improved interaction patterns.
- Improved agenda, business profile, auth, onboarding, and sucursales screens for layout consistency and spacing across breakpoints.
- Updated frontend API/type layers and package lock data to reflect service-category support.

### Fixed
- Cleaned up stale changelog typo and aligned release notes with current module structure.

## [0.2.2] - 2026-04-29

### Changed
- Agenda rendering and timeline spacing: improved day column layout and mobile gutter spacing in `frontend/components/agenda/`.
- Minor fixes in `sucursales` filters panel for consistent filter collapsing behavior.
- Removed temporary debug script `fix_glass.js` from the tree.

### Fixed
- Corrected editor/preview synchronization in `BusinessProfileEditorPage` to avoid stale preview state after saves.
- Small bugfixes for booking card display times and responsive wrapping.

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
