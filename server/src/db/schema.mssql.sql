-- ============================================================
-- Room-Asset-Booking-System — MSSQL Schema DDL
-- Version: 1.0 (Phase 1)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- TENANTS — Company entities sharing office spaces
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tenants')
CREATE TABLE tenants (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name            NVARCHAR(200)    NOT NULL,
    code            NVARCHAR(20)     NOT NULL UNIQUE,
    logo_url        NVARCHAR(500)    NULL,
    is_active       BIT              NOT NULL DEFAULT 1,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- COUNTRIES — Geographic registry for globe pins
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'countries')
CREATE TABLE countries (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name            NVARCHAR(100)    NOT NULL,
    iso_code        CHAR(2)          NOT NULL UNIQUE,
    slug            NVARCHAR(100)    NOT NULL UNIQUE,
    latitude        FLOAT            NOT NULL,
    longitude       FLOAT            NOT NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- OFFICES — Physical office locations
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'offices')
CREATE TABLE offices (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    country_id      UNIQUEIDENTIFIER NOT NULL REFERENCES countries(id),
    name            NVARCHAR(200)    NOT NULL,
    slug            NVARCHAR(100)    NOT NULL UNIQUE,
    address_line1   NVARCHAR(200)    NOT NULL,
    address_line2   NVARCHAR(200)    NULL,
    city            NVARCHAR(100)    NOT NULL,
    postcode        NVARCHAR(20)     NOT NULL,
    latitude        FLOAT            NOT NULL,
    longitude       FLOAT            NOT NULL,
    photo_url       NVARCHAR(500)    NULL,
    floor_count     INT              NOT NULL DEFAULT 1,
    operational_hours NVARCHAR(100)  NULL,
    is_active       BIT              NOT NULL DEFAULT 1,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- OFFICE_TENANTS — Which tenants occupy which offices (M:M)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'office_tenants')
CREATE TABLE office_tenants (
    office_id       UNIQUEIDENTIFIER NOT NULL REFERENCES offices(id),
    tenant_id       UNIQUEIDENTIFIER NOT NULL REFERENCES tenants(id),
    PRIMARY KEY (office_id, tenant_id)
);

-- ──────────────────────────────────────────────────────────────
-- FLOORS — Floors within an office building
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'floors')
CREATE TABLE floors (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    office_id       UNIQUEIDENTIFIER NOT NULL REFERENCES offices(id),
    floor_number    INT              NOT NULL,
    name            NVARCHAR(100)    NOT NULL,
    slug            NVARCHAR(100)    NOT NULL,
    plan_image_url  NVARCHAR(500)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE (office_id, floor_number)
);

-- ──────────────────────────────────────────────────────────────
-- ZONES — Named areas within a floor (rooms, open-plan, etc.)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'zones')
CREATE TABLE zones (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    floor_id        UNIQUEIDENTIFIER NOT NULL REFERENCES floors(id),
    name            NVARCHAR(200)    NOT NULL,
    type            NVARCHAR(50)     NOT NULL CHECK (type IN ('workspace', 'meeting_room', 'amenity', 'hot_desk')),
    capacity        INT              NULL,
    x               FLOAT            NOT NULL DEFAULT 0,
    y               FLOAT            NOT NULL DEFAULT 0,
    width           FLOAT            NOT NULL DEFAULT 100,
    height          FLOAT            NOT NULL DEFAULT 100,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- ZONE_TENANTS — Tenant access control per zone (M:M)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'zone_tenants')
CREATE TABLE zone_tenants (
    zone_id         UNIQUEIDENTIFIER NOT NULL REFERENCES zones(id),
    tenant_id       UNIQUEIDENTIFIER NOT NULL REFERENCES tenants(id),
    PRIMARY KEY (zone_id, tenant_id)
);

-- ──────────────────────────────────────────────────────────────
-- DESKS — Individual desk nodes with 2D coordinates
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'desks')
CREATE TABLE desks (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    zone_id         UNIQUEIDENTIFIER NOT NULL REFERENCES zones(id),
    code            NVARCHAR(50)     NOT NULL UNIQUE,
    label           NVARCHAR(100)    NULL,
    x               FLOAT            NOT NULL DEFAULT 0,
    y               FLOAT            NOT NULL DEFAULT 0,
    status          NVARCHAR(30)     NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'occupied', 'out_of_service', 'permanent')),
    is_bookable     BIT              NOT NULL DEFAULT 1,
    equipment_tags  NVARCHAR(500)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- MEETING_ROOMS — Meeting rooms with capacity & amenities
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'meeting_rooms')
CREATE TABLE meeting_rooms (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    zone_id         UNIQUEIDENTIFIER NOT NULL REFERENCES zones(id),
    name            NVARCHAR(200)    NOT NULL,
    capacity        INT              NOT NULL DEFAULT 4,
    equipment_tags  NVARCHAR(500)    NULL,
    requires_approval BIT            NOT NULL DEFAULT 0,
    status          NVARCHAR(30)     NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'occupied', 'out_of_service')),
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- AMENITIES — Non-bookable facilities (kitchens, toilets, etc.)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'amenities')
CREATE TABLE amenities (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    zone_id         UNIQUEIDENTIFIER NOT NULL REFERENCES zones(id),
    type            NVARCHAR(50)     NOT NULL CHECK (type IN ('kitchen', 'toilet', 'fire_exit', 'printer', 'shower', 'bike_storage', 'ev_charging', 'parking', 'coffee_point')),
    name            NVARCHAR(200)    NOT NULL,
    x               FLOAT            NOT NULL DEFAULT 0,
    y               FLOAT            NOT NULL DEFAULT 0,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- USERS — User accounts with RBAC roles
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email           NVARCHAR(254)    NOT NULL UNIQUE,
    password_hash   NVARCHAR(500)    NOT NULL,
    first_name      NVARCHAR(100)    NOT NULL,
    last_name       NVARCHAR(100)    NOT NULL,
    role            NVARCHAR(30)     NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('employee', 'approver', 'location_admin', 'super_admin')),
    tenant_id       UNIQUEIDENTIFIER NULL REFERENCES tenants(id),
    avatar_url      NVARCHAR(500)    NULL,
    is_active       BIT              NOT NULL DEFAULT 1,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- USER_PREFERENCES — Home office & default landing config
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_preferences')
CREATE TABLE user_preferences (
    user_id         UNIQUEIDENTIFIER PRIMARY KEY REFERENCES users(id),
    home_office_id  UNIQUEIDENTIFIER NULL REFERENCES offices(id),
    home_floor_id   UNIQUEIDENTIFIER NULL REFERENCES floors(id),
    preferred_zone_id UNIQUEIDENTIFIER NULL REFERENCES zones(id),
    default_view    NVARCHAR(20)     NOT NULL DEFAULT 'globe'
                    CHECK (default_view IN ('globe', 'office', 'floor')),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- BOOKINGS — Resource reservations (schema scaffold for Phase 2)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bookings')
CREATE TABLE bookings (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    resource_type   NVARCHAR(30)     NOT NULL CHECK (resource_type IN ('desk', 'meeting_room', 'asset')),
    resource_id     UNIQUEIDENTIFIER NOT NULL,
    start_time      DATETIME2        NOT NULL,
    end_time        DATETIME2        NOT NULL,
    status          NVARCHAR(30)     NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'pending_approval', 'cancelled', 'checked_in', 'no_show')),
    checked_in      BIT              NOT NULL DEFAULT 0,
    approval_note   NVARCHAR(1000)   NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IX_offices_country ON offices(country_id);
CREATE INDEX IX_floors_office ON floors(office_id);
CREATE INDEX IX_zones_floor ON zones(floor_id);
CREATE INDEX IX_desks_zone ON desks(zone_id);
CREATE INDEX IX_desks_code ON desks(code);
CREATE INDEX IX_meeting_rooms_zone ON meeting_rooms(zone_id);
CREATE INDEX IX_amenities_zone ON amenities(zone_id);
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_tenant ON users(tenant_id);
CREATE INDEX IX_bookings_user ON bookings(user_id);
CREATE INDEX IX_bookings_resource ON bookings(resource_type, resource_id);
CREATE INDEX IX_bookings_time ON bookings(start_time, end_time);

-- ============================================================
-- Phase 2 Database Schema Additions
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- ASSETS — Shared Fleet Vehicles, AV Equipment, Loaner Hardware
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'assets')
CREATE TABLE assets (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    office_id           UNIQUEIDENTIFIER NOT NULL REFERENCES offices(id),
    category            NVARCHAR(50)     NOT NULL CHECK (category IN ('vehicle', 'av_equipment', 'loaner_hardware')),
    name                NVARCHAR(200)    NOT NULL,
    model               NVARCHAR(200)    NULL,
    identifier_code     NVARCHAR(100)    NOT NULL UNIQUE, -- e.g. License Plate "AB24 CDE" or Asset Tag "AV-PROJ-01"
    photo_url           NVARCHAR(500)    NULL,
    description         NVARCHAR(1000)   NULL,
    requires_approval   BIT              NOT NULL DEFAULT 0,
    requires_license    BIT              NOT NULL DEFAULT 0, -- Mandatory driving license upload for vehicles
    current_mileage     INT              NULL,               -- For fleet vehicles
    fuel_or_battery     NVARCHAR(50)     NULL,               -- e.g. "85% Battery", "Petrol (Full)"
    specifications      NVARCHAR(MAX)    NULL,               -- JSON or text specs (laser 4K, 32GB RAM, etc.)
    status              NVARCHAR(30)     NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
    is_active           BIT              NOT NULL DEFAULT 1,
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- SYSTEM_CONFIGS — Dynamic admin settings (Ghost bookings, grace period)
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'system_configs')
CREATE TABLE system_configs (
    config_key          NVARCHAR(100) PRIMARY KEY,
    config_value        NVARCHAR(MAX) NOT NULL,
    description         NVARCHAR(500) NULL,
    updated_at          DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- Seed default ghost booking configs (Disabled by default per PRD 5.4)
IF NOT EXISTS (SELECT * FROM system_configs WHERE config_key = 'ghost_booking_enabled')
INSERT INTO system_configs (config_key, config_value, description) VALUES
('ghost_booking_enabled', 'false', 'Auto-release booking if user has not checked in within grace period'),
('ghost_booking_grace_mins', '15', 'Check-in grace period in minutes before auto-releasing'),
('reminder_email_hours_prior', '24', 'Hours before booking to send reminder email with 1-click cancel');

-- ──────────────────────────────────────────────────────────────
-- EXTEND BOOKINGS TABLE — Cancellation tokens, check-in QR & vehicle logs
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bookings') AND name = 'cancel_token')
BEGIN
    ALTER TABLE bookings ADD
        cancel_token        NVARCHAR(200)    NULL,
        checkin_token       NVARCHAR(200)    NULL,
        checkin_time        DATETIME2        NULL,
        license_image_url   NVARCHAR(500)    NULL,
        start_mileage       INT              NULL,
        end_mileage         INT              NULL,
        condition_notes     NVARCHAR(1000)   NULL,
        external_event_id   NVARCHAR(200)    NULL; -- For Graph API Exchange/Bookings sync
END;

CREATE INDEX IX_assets_office ON assets(office_id);
CREATE INDEX IX_assets_category ON assets(category);
CREATE INDEX IX_bookings_cancel_token ON bookings(cancel_token);
CREATE INDEX IX_bookings_checkin_token ON bookings(checkin_token);

-- ============================================================
-- Phase 3 Database Schema Additions
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- FEATURE_REQUESTS — Employee suggestions & Community Roadmap
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feature_requests')
CREATE TABLE feature_requests (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    title               NVARCHAR(200)    NOT NULL,
    problem_statement   NVARCHAR(MAX)    NOT NULL,
    business_impact     NVARCHAR(MAX)    NOT NULL,
    category            NVARCHAR(50)     NOT NULL DEFAULT 'general',
    status              NVARCHAR(30)     NOT NULL DEFAULT 'pending_moderation'
                        CHECK (status IN ('pending_moderation', 'approved', 'rejected', 'planned', 'in_development', 'completed')),
    moderation_notes    NVARCHAR(1000)   NULL,
    upvotes_count       INT              NOT NULL DEFAULT 0,
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- FEATURE_UPVOTES — Strict 1 vote per employee limit
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feature_upvotes')
CREATE TABLE feature_upvotes (
    feature_id          UNIQUEIDENTIFIER NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (feature_id, user_id)
);

-- ──────────────────────────────────────────────────────────────
-- BUG_TICKETS — Telemetry-attached issue tracker with multipliers
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bug_tickets')
CREATE TABLE bug_tickets (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    office_id           UNIQUEIDENTIFIER NULL REFERENCES offices(id),
    parent_bug_id       UNIQUEIDENTIFIER NULL REFERENCES bug_tickets(id), -- For duplicates linked to parent
    title               NVARCHAR(200)    NOT NULL,
    description         NVARCHAR(MAX)    NOT NULL,
    route_path          NVARCHAR(500)    NULL,
    object_id           NVARCHAR(100)    NULL, -- e.g. Desk code or Room ID
    three_coords        NVARCHAR(200)    NULL, -- 3D x,y,z
    browser_info        NVARCHAR(500)    NULL,
    os_info             NVARCHAR(200)    NULL,
    viewport_size       NVARCHAR(100)    NULL,
    console_logs        NVARCHAR(MAX)    NULL,
    multiplier_count    INT              NOT NULL DEFAULT 1,
    status              NVARCHAR(30)     NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'triaged', 'in_progress', 'resolved', 'closed')),
    resolution_notes    NVARCHAR(1000)   NULL,
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────────────────────────
-- BUG_SUBSCRIBERS — "I Have This Issue Too" subscribers
-- ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bug_subscribers')
CREATE TABLE bug_subscribers (
    bug_id              UNIQUEIDENTIFIER NOT NULL REFERENCES bug_tickets(id) ON DELETE CASCADE,
    user_id             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (bug_id, user_id)
);

CREATE INDEX IX_feature_requests_status ON feature_requests(status);
CREATE INDEX IX_feature_requests_upvotes ON feature_requests(upvotes_count DESC);
CREATE INDEX IX_bug_tickets_office ON bug_tickets(office_id);
CREATE INDEX IX_bug_tickets_status ON bug_tickets(status);
CREATE INDEX IX_bug_tickets_parent ON bug_tickets(parent_bug_id);
-- Facility Areas for on-site amenities (kitchens, showers, restrooms, lounges)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'facility_areas')
BEGIN
    CREATE TABLE facility_areas (
        id NVARCHAR(36) PRIMARY KEY,
        floor_id NVARCHAR(36) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(50) NOT NULL DEFAULT 'kitchen',
        photo_url NVARCHAR(1000) NOT NULL,
        description NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_facility_areas_floor FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
    );
END

-- Interactive Photo Hotspots inside facility areas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'facility_hotspots')
BEGIN
    CREATE TABLE facility_hotspots (
        id NVARCHAR(36) PRIMARY KEY,
        facility_id NVARCHAR(36) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        item_name NVARCHAR(255),
        description NVARCHAR(MAX),
        instructions NVARCHAR(MAX),
        pos_x FLOAT NOT NULL,
        pos_y FLOAT NOT NULL,
        icon NVARCHAR(50) DEFAULT 'Coffee',
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_facility_hotspots_facility FOREIGN KEY (facility_id) REFERENCES facility_areas(id) ON DELETE CASCADE
    );
END