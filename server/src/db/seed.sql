-- 1. Tenants
INSERT OR IGNORE INTO tenants (id, name, code, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Cloudfy UK Ltd', 'CLOUDFY_UK', 1),
('22222222-2222-2222-2222-222222222222', 'Williams Commerce Ltd', 'WILLIAMS', 1),
('33333333-3333-3333-3333-333333333333', 'Brandwidth', 'BRANDWIDTH', 1);

-- 2. Countries
INSERT OR IGNORE INTO countries (id, name, iso_code, slug, latitude, longitude) VALUES
('44444444-4444-4444-4444-444444444444', 'United Kingdom', 'GB', 'united-kingdom', 52.6339, -1.1360);

-- 3. Offices
INSERT OR IGNORE INTO offices (id, country_id, name, slug, address_line1, city, postcode, latitude, longitude, floor_count, operational_hours, is_active) VALUES
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Leicester Hub', 'leicester-hub', '17 Friar Lane', 'Leicester', 'LE1 5RB', 52.6339, -1.1360, 2, '08:00 - 18:00', 1);

INSERT OR IGNORE INTO office_tenants (office_id, tenant_id) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222');

-- 4. Floors
INSERT OR IGNORE INTO floors (id, office_id, floor_number, name, slug) VALUES
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 0, 'Ground Floor', 'ground-floor'),
('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 1, 'First Floor', 'first-floor');

-- 5. Zones & Rooms & Desks (Ground Floor)
INSERT OR IGNORE INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
('z-boardroom', '66666666-6666-6666-6666-666666666666', 'Boardroom', 'meeting_room', 10, -15, 0, 140, 120),
('z-dev', '66666666-6666-6666-6666-666666666666', 'Development Team Office', 'workspace', 9, 15, 0, 180, 140),
('z-gf-kitchen', '66666666-6666-6666-6666-666666666666', 'Kitchen & Amenities (GF)', 'amenity', NULL, 0, -15, 100, 80);

INSERT OR IGNORE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
('mr-boardroom', 'z-boardroom', 'Boardroom', 10, 'AV Screen, Video Conference, Whiteboard', 1, 'available');

INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags) VALUES
('d-gf-01', 'z-dev', 'UK-LEI-GF-D01', 'Dev Desk 1', 10, -5, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-02', 'z-dev', 'UK-LEI-GF-D02', 'Dev Desk 2', 15, -5, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-03', 'z-dev', 'UK-LEI-GF-D03', 'Dev Desk 3', 20, -5, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-04', 'z-dev', 'UK-LEI-GF-D04', 'Dev Desk 4', 10, 0, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-05', 'z-dev', 'UK-LEI-GF-D05', 'Dev Desk 5', 15, 0, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-06', 'z-dev', 'UK-LEI-GF-D06', 'Dev Desk 6', 20, 0, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-07', 'z-dev', 'UK-LEI-GF-D07', 'Dev Desk 7', 10, 5, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-08', 'z-dev', 'UK-LEI-GF-D08', 'Dev Desk 8', 15, 5, 'permanent', 0, 'Dual 4K, Dock'),
('d-gf-09', 'z-dev', 'UK-LEI-GF-D09', 'Dev Desk 9', 20, 5, 'permanent', 0, 'Dual 4K, Dock');

INSERT OR IGNORE INTO amenities (id, zone_id, type, name, x, y) VALUES
('a-gf-k', 'z-gf-kitchen', 'kitchen', 'Ground Floor Kitchen', -2, -15),
('a-gf-t', 'z-gf-kitchen', 'toilet', 'Restrooms (GF)', 2, -15);

-- 6. Zones & Rooms & Desks (First Floor)
INSERT OR IGNORE INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
('z-proj', '77777777-7777-7777-7777-777777777777', 'Projects Office', 'workspace', 5, -20, 10, 120, 100),
('z-supp', '77777777-7777-7777-7777-777777777777', 'Support Office', 'workspace', 5, -5, 10, 120, 100),
('z-hd', '77777777-7777-7777-7777-777777777777', 'Hot Desks', 'hot_desk', 3, 10, 10, 100, 80),
('z-flex', '77777777-7777-7777-7777-777777777777', 'Flexible Desk Office (Williams)', 'workspace', 5, 25, 10, 120, 100),
('z-asgard', '77777777-7777-7777-7777-777777777777', 'Asgard Meeting Room', 'meeting_room', 6, -20, -10, 100, 80),
('z-mgmt', '77777777-7777-7777-7777-777777777777', 'Management Office', 'workspace', 4, 25, -10, 100, 80),
('z-1f-kitchen', '77777777-7777-7777-7777-777777777777', 'Kitchen & Amenities (1F)', 'amenity', NULL, 0, -10, 100, 80);

INSERT OR IGNORE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
('mr-asgard', 'z-asgard', 'Asgard', 6, 'TV Display, Conference Phone', 0, 'available');

-- 3 Hot Desks (Bookable)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags) VALUES
('d-1f-hd01', 'z-hd', 'UK-LEI-1F-HD01', 'Hot Desk 1', 8, 10, 'available', 1, 'Single Monitor, USB-C Dock'),
('d-1f-hd02', 'z-hd', 'UK-LEI-1F-HD02', 'Hot Desk 2', 11, 10, 'available', 1, 'Single Monitor, USB-C Dock'),
('d-1f-hd03', 'z-hd', 'UK-LEI-1F-HD03', 'Hot Desk 3', 14, 10, 'available', 1, 'Single Monitor, USB-C Dock');

-- 5 Flexible Desks (Bookable for Williams)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags) VALUES
('d-1f-fl01', 'z-flex', 'UK-LEI-1F-FL01', 'Flex Desk 1', 22, 8, 'available', 1, 'Dual Monitor'),
('d-1f-fl02', 'z-flex', 'UK-LEI-1F-FL02', 'Flex Desk 2', 25, 8, 'available', 1, 'Dual Monitor'),
('d-1f-fl03', 'z-flex', 'UK-LEI-1F-FL03', 'Flex Desk 3', 28, 8, 'available', 1, 'Dual Monitor'),
('d-1f-fl04', 'z-flex', 'UK-LEI-1F-FL04', 'Flex Desk 4', 23, 12, 'available', 1, 'Dual Monitor'),
('d-1f-fl05', 'z-flex', 'UK-LEI-1F-FL05', 'Flex Desk 5', 27, 12, 'available', 1, 'Dual Monitor');

-- Permanent Desks
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable) VALUES
('d-1f-pr01', 'z-proj', 'UK-LEI-1F-PR01', 'Projects 1', -22, 8, 'permanent', 0),
('d-1f-pr02', 'z-proj', 'UK-LEI-1F-PR02', 'Projects 2', -18, 8, 'permanent', 0),
('d-1f-pr03', 'z-proj', 'UK-LEI-1F-PR03', 'Projects 3', -22, 12, 'permanent', 0),
('d-1f-pr04', 'z-proj', 'UK-LEI-1F-PR04', 'Projects 4', -18, 12, 'permanent', 0),
('d-1f-sp01', 'z-supp', 'UK-LEI-1F-SP01', 'Support 1', -7, 8, 'permanent', 0),
('d-1f-sp02', 'z-supp', 'UK-LEI-1F-SP02', 'Support 2', -3, 8, 'permanent', 0),
('d-1f-sp03', 'z-supp', 'UK-LEI-1F-SP03', 'Support 3', -7, 12, 'permanent', 0),
('d-1f-sp04', 'z-supp', 'UK-LEI-1F-SP04', 'Support 4', -3, 12, 'permanent', 0),
('d-1f-mg01', 'z-mgmt', 'UK-LEI-1F-MG01', 'Leadership 1', 23, -8, 'permanent', 0),
('d-1f-mg02', 'z-mgmt', 'UK-LEI-1F-MG02', 'Leadership 2', 27, -8, 'permanent', 0);

INSERT OR IGNORE INTO amenities (id, zone_id, type, name, x, y) VALUES
('a-1f-k', 'z-1f-kitchen', 'kitchen', 'First Floor Kitchen', -2, -10),
('a-1f-t', 'z-1f-kitchen', 'toilet', 'Restrooms (1F)', 2, -10),
('a-1f-p', 'z-1f-kitchen', 'printer', 'Network Print Station', 5, -10);

-- 7. Shared Corporate Assets
INSERT OR IGNORE INTO assets (id, office_id, category, name, model, identifier_code, description, requires_approval, requires_license, current_mileage, fuel_or_battery, specifications, status) VALUES
('asset-car-1', '55555555-5555-5555-5555-555555555555', 'vehicle', 'Pool Car - Tesla Model 3', 'Model 3 Long Range', 'LE24 EVT', 'Company pool vehicle for client visits and site inspections.', 1, 1, 14250, '88% Battery', 'Electric, Dual Motor AWD, Autopilot enabled, Range ~340mi', 'available'),
('asset-car-2', '55555555-5555-5555-5555-555555555555', 'vehicle', 'Pool Car - Skoda Octavia Estate', 'Octavia SE Technology 2.0 TDI', 'LE73 DTE', 'Spacious estate car for team travel and cargo transport.', 1, 1, 28900, 'Diesel (3/4 Tank)', '2.0L Diesel, Manual, Large Boot Capacity, Sat Nav', 'available'),
('asset-proj-1', '55555555-5555-5555-5555-555555555555', 'av_equipment', 'Portable 4K Laser Projector', 'Epson EpiqVision Ultra EF-12', 'AV-PROJ-01', 'High-brightness laser projector with built-in Yamaha audio.', 0, 0, NULL, NULL, '4K PRO-UHD, 1000 Lumens, HDMI 2.1, USB-C, Bluetooth Audio', 'available'),
('asset-vr-1', '55555555-5555-5555-5555-555555555555', 'av_equipment', 'Meta Quest Pro VR Demo Rig', 'Meta Quest Pro 256GB', 'AV-VR-01', 'Enterprise virtual reality headset for 3D walkthroughs & client demos.', 1, 0, NULL, NULL, '256GB Storage, Face & Eye Tracking, Touch Pro Controllers', 'available'),
('asset-laptop-1', '55555555-5555-5555-5555-555555555555', 'loaner_hardware', 'Emergency Loaner Laptop (MacBook Pro)', 'MacBook Pro 14" M3 Pro', 'IT-LNR-01', 'Emergency loaner machine for developers and engineers.', 0, 0, NULL, NULL, 'Apple M3 Pro (12-Core CPU, 18-Core GPU), 36GB RAM, 1TB SSD', 'available');

-- 8. Seed Super Admin User (Shaun Rathbone: shaunrathbone@msn.com / 199214)
-- bcrypt hash for 199214 with salt rounds 12
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, tenant_id) VALUES
('u-admin-shaun', 'shaunrathbone@msn.com', '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Shaun', 'Rathbone', 'super_admin', '11111111-1111-1111-1111-111111111111');

INSERT OR IGNORE INTO user_preferences (user_id, home_office_id, home_floor_id, default_view) VALUES
('u-admin-shaun', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'globe');