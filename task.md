# Task Log

A record of larger tasks completed across the **Room-Asset-Booking-System** project. Updated after significant pieces of work are finished.

---

## Completed Tasks

| Date | Task | Details |
|---|---|---|
| 2026-08-16 | Workspace Rules & Skills Setup | Initialized .agents, AGENTS.md, rules 1-19, full skills suite, features.md, and task.md. |
| 2026-08-16 | Phase 1 Foundation & 3D Spatial Engine | Built monorepo structure (Next.js 16 + Express + MSSQL), 14-table DDL, Three.js 5-level spatial engine (Globe, Gallery, Exploded Stack, Floor Plan, Schedule Drawer), Universal Search, JWT Auth, Smart Landing, Docker Compose, and Leicester 17 Friar Lane seed data. |
| 2026-08-16 | Phase 2 Booking Engine & Shared Assets | Built interactive 7/14-day timeline booking drawer with quick presets, Dedicated Shared Assets module (/assets) for fleet vehicles with license verification & AV gear, My Reservations dashboard (/bookings) with QR codes, 1-Click email cancel (/cancel-booking), QR mobile check-in (/checkin/[token]), background Ghost Booking auto-release scheduler, and Microsoft 365 calendar sync adapter. |
| 2026-08-16 | Phase 3 Governance, Feedback & Hardware | Built Moderated Feature Board (/feedback/features) with 1-click upvoting and roadmap tracking, Telemetry Bug Logger (/feedback/bugs) with live NLP deduplication and incident multipliers, Tiered Facility Approvals Queue (/admin/approvals) with mandatory justification notes, and Wall-Mounted PoE Tablet Kiosk Mode (/kiosk/rooms/[id]) with live OCCUPIED/AVAILABLE glow and 1-touch ad-hoc booking. |
| 2026-08-16 | Analytics Dashboard & Global Feedback FAB | Built Space Utilization & Workplace Analytics (/admin/analytics) and Global Floating Feedback FAB (FeedbackFAB.tsx). |
| 2026-08-16 | Office Welcome Guide & Admin CMS | Implemented the 17 Friar Lane Induction & Welcome Guide (/explore/united-kingdom/leicester-hub/guide) and Admin Content Manager (/admin/offices/[slug]/guide). |
| 2026-08-16 | Centralized Admin Panel & Domain-Gated Registration | Built unified Admin Hub (/admin) with Domain Whitelist management, User Directory & RBAC, Estate CMS, and System Configs; built Self-Service Registration (/register) with corporate email domain whitelist gate and Microsoft 365 Single Sign-On (SSO) integration. |
| 2026-08-16 | Cloudfy Branding & Profile Photo Avatar System | Rebranded system to Cloudfy Workspaces; built Profile photo uploader (device upload + presets) in /settings with live instant avatar rendering in the Navbar, User Directory, and Reservation system. |
| 2026-08-16 | Geographically-Locked Real-Time Solar Engine | Updated GLSL day/night shader to world-space normals, locking the sunlight hemisphere and night city lights to actual Earth geography based on live UTC clock time while permitting free 360° camera orbit. |
<!-- Append new tasks above this line -->