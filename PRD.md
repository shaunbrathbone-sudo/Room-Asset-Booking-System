# Product Requirements Document & Functional Specification

## Global 3D Workspace, Desk, Meeting Room & Asset Booking System

| Field | Value |
|---|---|
| **Prepared By** | Shaun Rathbone |
| **Document Version** | 1.0 (Master Release) |
| **Target Ecosystem** | Web / Mobile PWA, Microsoft 365 / Bookings |
| **Date** | August 2026 |

---

## 1. Executive Summary & Architectural Strategy

This document establishes the comprehensive functional specification and architectural blueprint for a modern, multi-tenant workspace management platform. The application orchestrates hot desk allocation, meeting room scheduling, and shared corporate assets (fleet vehicles, portable AV, and loaner hardware) across a distributed global real estate portfolio.

### 1.1 Reactive Front-End & Viewport Strategy

The system is engineered as a unified, mobile-first Progressive Web App (PWA) delivering seamless performance across all screen form factors:

- **Desktop Workstations**: Full WebGL canvas, multi-pane navigation, persistent breadcrumbs, split-screen search, and docking 7/14-day schedule drawers.
- **Mobile & Tablet Web**: Touch-optimised 3D canvas (pinch-to-zoom, dual-finger orbit/pan), collapsible bottom-sheet booking drawers, and an instant 'Switch to List View' fallback toggle.
- **Wall-Mounted Room Panels**: High-contrast, lightweight route (`/kiosk/rooms/{id}`) specifically designed for wall-mounted 7-10 inch PoE panels outside meeting spaces for ad-hoc booking and real-time status.

---

## 2. Global Spatial Hierarchy & 3D Navigation

Navigation replaces traditional cascading dropdowns with an intuitive 5-level spatial drill-down journey powered by Three.js / WebGL:

- **Level 1 — Interactive 3D World Globe**: Interactive, rotatable 3D Earth featuring glowing location pins and dynamic office clustering. Hovering surfaces high-level metrics (e.g. 'United Kingdom: 3 Offices — 74% Desks Available Today'). Clicking initiates a smooth camera fly-to animation.
- **Level 2 — Regional Office Hub & Gallery**: Split-view card gallery with high-resolution photography, address, operational hours, total floor count, room inventory, and active amenities (parking, EV bays, showers).
- **Level 3 — Exploded 3D Isometric Building Stack**: Multi-story 3D isometric building model. Floors vertically separate ('explode') on hover/selection to reveal live occupancy percentages, department zones, and sector wings.
- **Level 4 — Interactive 3D Floor Plan**: Detailed architectural rendering of physical desks, glass meeting rooms, acoustic booths, and amenities (coffee points, printers, restrooms, fire exits). Nodes feature live shader color-coding: Green (Available), Amber (Partially Booked / Restricted), Red (Occupied), Grey (Out of Service / Permanent).
- **Level 5 — 7-14 Day Schedule Drawer & Checkout**: Clicking any node slides out a rolling schedule grid to review availability and drag-to-select booking intervals.

---

## 3. Fast-Path Navigation & User Personalization

### 3.1 User Default Location & Smart Landing

- **Workplace Preferences**: Users can configure their Home Country, Home Office, and Preferred Floor/Zone.
- **Adaptive Smart Landing**: Upon login, users with a configured default automatically bypass the global globe and land directly on their 3D home floor plan.
- **SSO Pre-population**: Auto-detects and provisions default locations based on Azure AD / Microsoft 365 directory metadata (`officeLocation`).
- **1-Click Escape**: A persistent breadcrumb `[ Globe > UK > London HQ > Floor 2 ]` enables 1-click zoom-out back to the 3D globe for traveling staff.

### 3.2 Universal Direct Search Engine

A persistent search bar accessible in the top navigation provides instant typeahead lookup across the global estate:

- **Resource ID Matching**: Direct query on desk codes (e.g., `UK-LON-F2-D42`) or room names (e.g., `Boardroom Alpha`).
- **Colleague Seating Finder**: Search colleagues to locate their current/upcoming desk reservations on the 3D floor plan, with a 1-click 'Book Desk Nearby' action.
- **Deep Navigation**: Selecting any result instantly triggers a smooth camera fly-to animation that focuses on the target node and opens its booking drawer.

---

## 4. Resource Booking & Calendar Mechanics

### 4.1 Rolling 7-Day & 14-Day Schedule Drawer

- **Timeline Toggle**: Switch between 7-Day View (detailed hourly slots) and 14-Day View (multi-day overview).
- **Interactive Drag-to-Select**: Configurable intervals (15-min, 30-min, half-day, full-day blocks). Drag directly across empty blocks to populate booking times.
- **Amenity Badges**: Displays AV equipment, monitor setups, ergonomic configurations, and catering/layout options.

### 4.2 Dedicated Shared Assets Module

A segregated catalog specifically designed for non-desk portable and fleet equipment:

- **Fleet & Pool Vehicles**: Mandatory driver's license image upload, pickup/return mileage logging, and fuel/battery condition checklist.
- **High-Value AV Equipment**: Portable laser projectors, podcast rigs, VR demo sets, and event sound systems.
- **Loaner Hardware**: Emergency loaner laptops, testing smartphones, and video adapters.

---

## 5. Workflows, Integrations & Governance

### 5.1 Tiered Approval Workflow Engine

Admins can designate high-impact resources (e.g. Executive Boardrooms, Fleet Cars) as 'Requires Approval'. Booking requests place a soft hold on the calendar, notify assigned facility managers via email/app, and allow 1-click approval/rejection with mandatory justification on rejection.

### 5.2 Microsoft 365 & Microsoft Bookings Integration

- **Two-Way Calendar Sync**: Reservations synchronize two-way with Microsoft 365 Exchange room mailboxes via Microsoft Graph API.
- **Microsoft Bookings API**: Shared assets (cars, projectors) interface with Microsoft Bookings API (`/solutions/bookingBusinesses`) for staff assignment and slot reservations.
- **Enterprise Authentication**: Single Sign-On (SSO) and role mapping via Microsoft Entra ID (Azure AD).

### 5.3 Pre-Event Reminder & 1-Click Cancellation Engine

An automated cron scheduler dispatches an HTML email reminder exactly 24 hours prior to booking start. The email includes a secure, cryptographically signed token (HMAC/JWT) on the 'Cancel Booking' button, enabling 1-click cancellation without requiring login.

### 5.4 Check-in & Auto-Release Engine ('Ghost Bookings')

The backend includes a complete QR code / web check-in engine with a configurable 15-minute grace period. This capability is built into the codebase and toggled OFF by default in the Admin Panel.

---

## 6. Feedback, Feature Requests & Bug Management

### 6.1 Moderated Feature Request & Community Voting Board

- **Moderation Gate**: Employees submit suggestions with problem statements and business impact. Submissions enter 'Pending Moderation'.
- **Admin Review Queue**: Admins review, edit, reject (with notes), or Approve & Publish ideas to the public board.
- **Community Upvoting**: Employees cast 1-click upvotes (+1 / -1 toggle; strict 1 vote per user limit).
- **Roadmap Tracking**: Status transitions (Planned > In Development > Completed) trigger broadcast alerts to all voters and feed the 'What's New' release log.

### 6.2 Intelligent Bug Capture & NLP Deduplication

- **Telemetry Capture**: Automatically attaches route, 3D coordinates, object ID, OS, browser, viewport, and client console logs.
- **Live Deduplication**: As users type, NLP similarity algorithms scan active unresolved tickets in that office.
- **Incident Multipliers**: Users can click 'I Have This Issue Too', incrementing the parent ticket multiplier (+1) and subscribing without creating duplicate tickets.
- **Broadcast Resolution**: Resolving a parent bug notifies all linked reporters simultaneously.

---

## 7. Role-Based Access Control (RBAC) Matrix

| Capability / Module | Employee | Approver | Location Admin | Super Admin |
|---|---|---|---|---|
| Search & Book Standard Desks/Rooms | Yes | Yes | Yes | Yes |
| Book Approval-Gated Resources | Request Only | Yes (Direct) | Yes (Direct) | Yes (Direct) |
| Approve / Reject Bookings | No | Yes | Yes | Yes |
| Manage 3D Floor Coordinates | No | No | Yes (Local) | Yes (Global) |
| Moderate Feature Requests | No | No | No | Yes |
| Upvote Feature Requests | Yes | Yes | Yes | Yes |
| Triage & Merge Bug Tickets | No | Yes (Local) | Yes (Local) | Yes (Global) |
| Toggle System Configs (Ghost Booking) | No | No | No | Yes |

---

## 8. Phased Implementation Roadmap

- **Phase 1 — 3D Spatial Engine & Navigation**: Three.js WebGL canvas (Globe, Building Stack, Isometric Floor Plan), Universal Search, Colleague Finder, and User Home Office Landing Engine.
- **Phase 2 — Booking Engine & Calendar Integrations**: 7/14-Day Timeline Drawer, Shared Assets Catalog, Microsoft Graph / Bookings Two-Way Sync, and 24h Reminder with 1-Click Cancellation.
- **Phase 3 — Governance, Feedback & Hardware**: Tiered Approval Workflows, Moderated Feature Board & Upvoting, Bug Capture with NLP Deduplication, and Room Display Tablet Kiosk Mode.

---

> **DEVELOPER & AGENT DIRECTIVE**: This specification is fully structured for consumption by Google Antigravity or full-stack engineering teams. You can provide this document directly into your agentic workspace to scaffold the database models, API routes, and 3D WebGL components phase by phase.