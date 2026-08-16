-- ============================================================
-- Room-Asset-Booking-System — SQLite Schema DDL
-- ============================================================

CREATE TABLE IF NOT EXISTS tenants (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    code            TEXT NOT NULL UNIQUE,
    logo_url        TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS countries (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    iso_code        TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE,
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS offices (
    id              TEXT PRIMARY KEY,
    country_id      TEXT NOT NULL REFERENCES countries(id),
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    city            TEXT NOT NULL,
    postcode        TEXT NOT NULL,
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL,
    photo_url       TEXT,
    floor_count     INTEGER NOT NULL DEFAULT 1,
    operational_hours TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS office_tenants (
    office_id       TEXT NOT NULL REFERENCES offices(id),
    tenant_id       TEXT NOT NULL REFERENCES tenants(id),
    PRIMARY KEY (office_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS floors (
    id              TEXT PRIMARY KEY,
    office_id       TEXT NOT NULL REFERENCES offices(id),
    floor_number    INTEGER NOT NULL,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    plan_image_url  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (office_id, floor_number)
);

CREATE TABLE IF NOT EXISTS zones (
    id              TEXT PRIMARY KEY,
    floor_id        TEXT NOT NULL REFERENCES floors(id),
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    capacity        INTEGER,
    x               REAL NOT NULL DEFAULT 0,
    y               REAL NOT NULL DEFAULT 0,
    width           REAL NOT NULL DEFAULT 100,
    height          REAL NOT NULL DEFAULT 100,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS zone_tenants (
    zone_id         TEXT NOT NULL REFERENCES zones(id),
    tenant_id       TEXT NOT NULL REFERENCES tenants(id),
    PRIMARY KEY (zone_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS desks (
    id              TEXT PRIMARY KEY,
    zone_id         TEXT NOT NULL REFERENCES zones(id),
    code            TEXT NOT NULL UNIQUE,
    label           TEXT,
    x               REAL NOT NULL DEFAULT 0,
    y               REAL NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'available',
    is_bookable     INTEGER NOT NULL DEFAULT 1,
    equipment_tags  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meeting_rooms (
    id              TEXT PRIMARY KEY,
    zone_id         TEXT NOT NULL REFERENCES zones(id),
    name            TEXT NOT NULL,
    capacity        INTEGER NOT NULL DEFAULT 4,
    equipment_tags  TEXT,
    requires_approval INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'available',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS amenities (
    id              TEXT PRIMARY KEY,
    zone_id         TEXT NOT NULL REFERENCES zones(id),
    type            TEXT NOT NULL,
    name            TEXT NOT NULL,
    x               REAL NOT NULL DEFAULT 0,
    y               REAL NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
    id                  TEXT PRIMARY KEY,
    office_id           TEXT NOT NULL REFERENCES offices(id),
    category            TEXT NOT NULL,
    name                TEXT NOT NULL,
    model               TEXT,
    identifier_code     TEXT NOT NULL UNIQUE,
    photo_url           TEXT,
    description         TEXT,
    requires_approval   INTEGER NOT NULL DEFAULT 0,
    requires_license    INTEGER NOT NULL DEFAULT 0,
    current_mileage     INTEGER,
    fuel_or_battery     TEXT,
    specifications      TEXT,
    status              TEXT NOT NULL DEFAULT 'available',
    is_active           INTEGER NOT NULL DEFAULT 1,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'employee',
    tenant_id       TEXT REFERENCES tenants(id),
    avatar_url      TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id         TEXT PRIMARY KEY REFERENCES users(id),
    home_office_id  TEXT REFERENCES offices(id),
    home_floor_id   TEXT REFERENCES floors(id),
    preferred_zone_id TEXT REFERENCES zones(id),
    default_view    TEXT NOT NULL DEFAULT 'globe',
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(id),
    resource_type       TEXT NOT NULL,
    resource_id         TEXT NOT NULL,
    start_time          TEXT NOT NULL,
    end_time            TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'confirmed',
    checked_in          INTEGER NOT NULL DEFAULT 0,
    checkin_time        TEXT,
    cancel_token        TEXT,
    checkin_token       TEXT,
    license_image_url   TEXT,
    start_mileage       INTEGER,
    end_mileage         INTEGER,
    condition_notes     TEXT,
    external_event_id   TEXT,
    approval_note       TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_configs (
    config_key          TEXT PRIMARY KEY,
    config_value        TEXT NOT NULL,
    description         TEXT,
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feature_requests (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(id),
    title               TEXT NOT NULL,
    problem_statement   TEXT NOT NULL,
    business_impact     TEXT NOT NULL,
    category            TEXT NOT NULL DEFAULT 'general',
    status              TEXT NOT NULL DEFAULT 'pending_moderation',
    moderation_notes    TEXT,
    upvotes_count       INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feature_upvotes (
    feature_id          TEXT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id             TEXT NOT NULL REFERENCES users(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (feature_id, user_id)
);

CREATE TABLE IF NOT EXISTS bug_tickets (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(id),
    office_id           TEXT REFERENCES offices(id),
    parent_bug_id       TEXT REFERENCES bug_tickets(id),
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    route_path          TEXT,
    object_id           TEXT,
    three_coords        TEXT,
    browser_info        TEXT,
    os_info             TEXT,
    viewport_size       TEXT,
    console_logs        TEXT,
    multiplier_count    INTEGER NOT NULL DEFAULT 1,
    status              TEXT NOT NULL DEFAULT 'open',
    resolution_notes    TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bug_subscribers (
    bug_id              TEXT NOT NULL REFERENCES bug_tickets(id) ON DELETE CASCADE,
    user_id             TEXT NOT NULL REFERENCES users(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (bug_id, user_id)
);
-- Facility Areas for on-site amenities (kitchens, showers, restrooms, lounges)
CREATE TABLE IF NOT EXISTS facility_areas (
    id TEXT PRIMARY KEY,
    floor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'kitchen',
    photo_url TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Interactive Photo Hotspots inside facility areas
CREATE TABLE IF NOT EXISTS facility_hotspots (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    title TEXT NOT NULL,
    item_name TEXT,
    description TEXT,
    instructions TEXT,
    pos_x REAL NOT NULL,
    pos_y REAL NOT NULL,
    icon TEXT DEFAULT 'Coffee',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facility_areas(id) ON DELETE CASCADE
);