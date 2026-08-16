# Feature Registry

This file is the single source of truth for all features built in the **Room-Asset-Booking-System** project.
Whenever a new feature is created, add an entry here with a unique sequential ID (`FEAT-0001`, `FEAT-0002`, etc.).

---

## Registered Features

| ID | Date | Feature Name | Description | Status |
|---|---|---|---|---|
| FEAT-0001 | 2026-08-16 | 3D Spatial Hierarchy Engine | 5-level spatial drill-down with Three.js (Globe, Office Gallery, Exploded Building Stack, Floor Plan, Schedule Drawer). | Completed |
| FEAT-0002 | 2026-08-16 | Multi-Tenant Database Schema | MSSQL schema with 14 tables supporting tenants, spatial tree, RBAC, preferences, and booking scaffold. | Completed |
| FEAT-0003 | 2026-08-16 | Express Spatial & Auth API | REST API with JWT auth, password hashing, spatial queries, and typeahead search. | Completed |
| FEAT-0004 | 2026-08-16 | Universal Direct Search Engine | Typeahead search across desks, meeting rooms, offices, and colleagues with deep navigation. | Completed |
| FEAT-0005 | 2026-08-16 | User Personalisation & Smart Landing | User home office preferences and smart automatic landing redirect upon sign-in. | Completed |
| FEAT-0006 | 2026-08-16 | Leicester 17 Friar Lane Seed Data | Seed script for 2 floors, 31 desks (hot, flexible, dev, projects, support, leadership), and 2 meeting rooms. | Completed |
| FEAT-0007 | 2026-08-16 | Interactive 7/14-Day Timeline Booking Drawer | Drag/click 30-minute interval selection, presets (morning/afternoon/full day), and real-time conflict checking. | Completed |
| FEAT-0008 | 2026-08-16 | Dedicated Shared Corporate Assets Module | Filterable catalog for Fleet Vehicles, High-Value AV Equipment, and Loaner Hardware with license verification. | Completed |
| FEAT-0009 | 2026-08-16 | Check-In & Ghost Booking Engine | QR / tokenized check-in with 15-minute configurable grace period auto-release background scheduler. | Completed |
| FEAT-0010 | 2026-08-16 | Pre-Event Reminder & 1-Click Cancel | 24-hour pre-event reminder service with secure tokenized 1-click cancellation URL. | Completed |
| FEAT-0011 | 2026-08-16 | Microsoft 365 / Bookings Sync Adapter | Two-way calendar sync adapter for Exchange room mailboxes and Microsoft Bookings business API. | Completed |
| FEAT-0012 | 2026-08-16 | Moderated Feature Request & Community Voting Board | Employee proposal submission, super admin moderation queue, 1-click upvoting (+1/-1), and roadmap status tracking. | Completed |
| FEAT-0013 | 2026-08-16 | Intelligent Bug Capture & NLP Deduplication | Telemetry bug logger with live keyword duplicate detection and +1 Incident Multiplier subscriptions. | Completed |
| FEAT-0014 | 2026-08-16 | Tiered Approval Workflow Engine | Facility manager review queue for gated Boardrooms and Fleet Cars with mandatory rejection justification. | Completed |
| FEAT-0015 | 2026-08-16 | Wall-Mounted Room Tablet Kiosk Mode | High-contrast 7"-10" PoE wall display route (/kiosk/rooms/[id]) with live OCCUPIED/AVAILABLE LED status and 1-touch booking. | Completed |
| FEAT-0016 | 2026-08-16 | Floating Feedback FAB Quick Launcher | Global floating action button (FeedbackFAB.tsx) with instant bug, feature, and facility issue submission. | Completed |
| FEAT-0017 | 2026-08-16 | Space Utilization & Workplace Analytics | Department occupancy ratios, meeting room turnover, fleet car metrics, and ghost booking recovery tracker (/admin/analytics). | Completed |
<!-- Append new features above this line -->