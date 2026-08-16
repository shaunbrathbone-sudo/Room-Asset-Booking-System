-- ============================================================
-- Seed Data: Leicester Office (17 Friar Lane) & UK Estate
-- ============================================================

DECLARE @TenantCloudfy UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @TenantWilliams UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @TenantBrandwidth UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';

-- 1. Tenants
IF NOT EXISTS (SELECT * FROM tenants WHERE id = @TenantCloudfy)
INSERT INTO tenants (id, name, code, is_active) VALUES
(@TenantCloudfy, 'Cloudfy UK Ltd', 'CLOUDFY_UK', 1),
(@TenantWilliams, 'Williams Commerce Ltd', 'WILLIAMS', 1),
(@TenantBrandwidth, 'Brandwidth', 'BRANDWIDTH', 1);

-- 2. Countries
DECLARE @CountryUK UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';
IF NOT EXISTS (SELECT * FROM countries WHERE id = @CountryUK)
INSERT INTO countries (id, name, iso_code, slug, latitude, longitude) VALUES
(@CountryUK, 'United Kingdom', 'GB', 'united-kingdom', 52.6339, -1.1360);

-- 3. Offices
DECLARE @OfficeLeicester UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';
IF NOT EXISTS (SELECT * FROM offices WHERE id = @OfficeLeicester)
INSERT INTO offices (id, country_id, name, slug, address_line1, city, postcode, latitude, longitude, floor_count, operational_hours, is_active) VALUES
(@OfficeLeicester, @CountryUK, 'Leicester Hub', 'leicester-hub', '17 Friar Lane', 'Leicester', 'LE1 5RB', 52.6339, -1.1360, 2, '08:00 - 18:00', 1);

-- Office Tenants
IF NOT EXISTS (SELECT * FROM office_tenants WHERE office_id = @OfficeLeicester AND tenant_id = @TenantCloudfy)
INSERT INTO office_tenants (office_id, tenant_id) VALUES
(@OfficeLeicester, @TenantCloudfy),
(@OfficeLeicester, @TenantWilliams);

-- 4. Floors
DECLARE @FloorGF UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666';
DECLARE @Floor1F UNIQUEIDENTIFIER = '77777777-7777-7777-7777-777777777777';

IF NOT EXISTS (SELECT * FROM floors WHERE id = @FloorGF)
INSERT INTO floors (id, office_id, floor_number, name, slug) VALUES
(@FloorGF, @OfficeLeicester, 0, 'Ground Floor', 'ground-floor'),
(@Floor1F, @OfficeLeicester, 1, 'First Floor', 'first-floor');

-- 5. Zones — Ground Floor
DECLARE @ZoneBoardroom UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneDev UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneGFKitchen UNIQUEIDENTIFIER = NEWID();

IF NOT EXISTS (SELECT * FROM zones WHERE floor_id = @FloorGF)
INSERT INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
(@ZoneBoardroom, @FloorGF, 'Boardroom', 'meeting_room', 10, -15, 0, 140, 120),
(@ZoneDev, @FloorGF, 'Development Team Office', 'workspace', 9, 15, 0, 180, 140),
(@ZoneGFKitchen, @FloorGF, 'Kitchen & Amenities (GF)', 'amenity', NULL, 0, -15, 100, 80);

-- Meeting Room: Boardroom (capacity 10)
INSERT INTO meeting_rooms (zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
(@ZoneBoardroom, 'Boardroom', 10, 'AV Screen, Video Conference, Whiteboard', 1, 'available');

-- Desks: Dev Team (9 permanent desks)
INSERT INTO desks (zone_id, code, label, x, y, status, is_bookable, equipmentTags) VALUES
(@ZoneDev, 'UK-LEI-GF-D01', 'Dev Desk 1', 10, -5, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D02', 'Dev Desk 2', 15, -5, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D03', 'Dev Desk 3', 20, -5, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D04', 'Dev Desk 4', 10, 0, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D05', 'Dev Desk 5', 15, 0, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D06', 'Dev Desk 6', 20, 0, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D07', 'Dev Desk 7', 10, 5, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D08', 'Dev Desk 8', 15, 5, 'permanent', 0, 'Dual 4K, Dock'),
(@ZoneDev, 'UK-LEI-GF-D09', 'Dev Desk 9', 20, 5, 'permanent', 0, 'Dual 4K, Dock');

-- Amenities: Ground Floor
INSERT INTO amenities (zone_id, type, name, x, y) VALUES
(@ZoneGFKitchen, 'kitchen', 'Ground Floor Kitchen', -2, -15),
(@ZoneGFKitchen, 'toilet', 'Restrooms (GF)', 2, -15);

-- 6. Zones — First Floor
DECLARE @ZoneProjects UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneSupport UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneHotDesks UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneFlex UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneAsgard UNIQUEIDENTIFIER = NEWID();
DECLARE @ZoneManagement UNIQUEIDENTIFIER = NEWID();
DECLARE @Zone1FKitchen UNIQUEIDENTIFIER = NEWID();

IF NOT EXISTS (SELECT * FROM zones WHERE floor_id = @Floor1F)
INSERT INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
(@ZoneProjects, @Floor1F, 'Projects Office', 'workspace', 5, -20, 10, 120, 100),
(@ZoneSupport, @Floor1F, 'Support Office', 'workspace', 5, -5, 10, 120, 100),
(@ZoneHotDesks, @Floor1F, 'Hot Desks', 'hot_desk', 3, 10, 10, 100, 80),
(@ZoneFlex, @Floor1F, 'Flexible Desk Office (Williams)', 'workspace', 5, 25, 10, 120, 100),
(@ZoneAsgard, @Floor1F, 'Asgard Meeting Room', 'meeting_room', 6, -20, -10, 100, 80),
(@ZoneManagement, @Floor1F, 'Management Office', 'workspace', 4, 25, -10, 100, 80),
(@Zone1FKitchen, @Floor1F, 'Kitchen & Amenities (1F)', 'amenity', NULL, 0, -10, 100, 80);

-- Meeting Room: Asgard (capacity 6)
INSERT INTO meeting_rooms (zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
(@ZoneAsgard, 'Asgard', 6, 'TV Display, Conference Phone', 0, 'available');

-- 3 Hot Desks (Bookable)
INSERT INTO desks (zone_id, code, label, x, y, status, is_bookable, equipmentTags) VALUES
(@ZoneHotDesks, 'UK-LEI-1F-HD01', 'Hot Desk 1', 8, 10, 'available', 1, 'Single Monitor, USB-C Dock'),
(@ZoneHotDesks, 'UK-LEI-1F-HD02', 'Hot Desk 2', 11, 10, 'available', 1, 'Single Monitor, USB-C Dock'),
(@ZoneHotDesks, 'UK-LEI-1F-HD03', 'Hot Desk 3', 14, 10, 'available', 1, 'Single Monitor, USB-C Dock');

-- 5 Flexible Desks (Bookable for Williams)
INSERT INTO desks (zone_id, code, label, x, y, status, is_bookable, equipmentTags) VALUES
(@ZoneFlex, 'UK-LEI-1F-FL01', 'Flex Desk 1', 22, 8, 'available', 1, 'Dual Monitor'),
(@ZoneFlex, 'UK-LEI-1F-FL02', 'Flex Desk 2', 25, 8, 'available', 1, 'Dual Monitor'),
(@ZoneFlex, 'UK-LEI-1F-FL03', 'Flex Desk 3', 28, 8, 'available', 1, 'Dual Monitor'),
(@ZoneFlex, 'UK-LEI-1F-FL04', 'Flex Desk 4', 23, 12, 'available', 1, 'Dual Monitor'),
(@ZoneFlex, 'UK-LEI-1F-FL05', 'Flex Desk 5', 27, 12, 'available', 1, 'Dual Monitor');

-- Permanent Desks: Projects, Support, Management
INSERT INTO desks (zone_id, code, label, x, y, status, is_bookable) VALUES
(@ZoneProjects, 'UK-LEI-1F-PR01', 'Projects 1', -22, 8, 'permanent', 0),
(@ZoneProjects, 'UK-LEI-1F-PR02', 'Projects 2', -18, 8, 'permanent', 0),
(@ZoneProjects, 'UK-LEI-1F-PR03', 'Projects 3', -22, 12, 'permanent', 0),
(@ZoneProjects, 'UK-LEI-1F-PR04', 'Projects 4', -18, 12, 'permanent', 0),
(@ZoneSupport, 'UK-LEI-1F-SP01', 'Support 1', -7, 8, 'permanent', 0),
(@ZoneSupport, 'UK-LEI-1F-SP02', 'Support 2', -3, 8, 'permanent', 0),
(@ZoneSupport, 'UK-LEI-1F-SP03', 'Support 3', -7, 12, 'permanent', 0),
(@ZoneSupport, 'UK-LEI-1F-SP04', 'Support 4', -3, 12, 'permanent', 0),
(@ZoneManagement, 'UK-LEI-1F-MG01', 'Leadership 1', 23, -8, 'permanent', 0),
(@ZoneManagement, 'UK-LEI-1F-MG02', 'Leadership 2', 27, -8, 'permanent', 0);

-- Amenities: First Floor
INSERT INTO amenities (zone_id, type, name, x, y) VALUES
(@Zone1FKitchen, 'kitchen', 'First Floor Kitchen', -2, -10),
(@Zone1FKitchen, 'toilet', 'Restrooms (1F)', 2, -10),
(@Zone1FKitchen, 'printer', 'Network Print Station', 5, -10);