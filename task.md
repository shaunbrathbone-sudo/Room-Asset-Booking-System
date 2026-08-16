# Tasks Log

- **2026-08-16**:
  - **Feature Expansion & Visual Organisers**:
    - **FEAT-0029**: Office Onboarding Wizard (`/admin/offices/new`) — 5-step provisioning workflow for hubs, building stacks, desks, and geocoded coordinates.
    - **FEAT-0030**: Interactive Floor Plan & Facility Photo Hotspots Editor (`/admin/offices/[slug]/floor-editor`) — Workstation canvas layout editor, system ID mapper, and interactive photo hotspot tagger with modal instructions popups.
    - **FEAT-0031**: Device GPS Geolocation Globe Orientation — 3D globe camera automatic device coordinate detection and orientation.
  - **Security & Standards Audit**:
    - Dual Database Schemas: Synced `facility_areas` and `facility_hotspots` tables to both SQLite (`schema.sql`) and MSSQL (`schema.mssql.sql`).
    - Role-Based Access Control (RBAC): Enforced `AdminGuard` across all admin routes and API endpoints for `super_admin` (Top Admin) and `location_admin` (Local Admin).
    - WCAG 2.2 Level AA & Theme Compatibility: Added keyboard `Escape` dismissal, `aria-modal`, visible focus rings, and high-contrast Light/Dark mode styling.