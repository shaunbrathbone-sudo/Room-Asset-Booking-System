-- 1. Tenants
INSERT OR IGNORE INTO tenants (id, name, code, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Cloudfy UK Ltd', 'CLOUDFY_UK', 1),
('22222222-2222-2222-2222-222222222222', 'Williams Commerce Ltd', 'WILLIAMS', 1),
('33333333-3333-3333-3333-333333333333', 'Brandwidth', 'BRANDWIDTH', 1);

-- 2. Countries
INSERT OR IGNORE INTO countries (id, name, iso_code, slug, latitude, longitude) VALUES
('44444444-4444-4444-4444-444444444444', 'United Kingdom', 'GB', 'united-kingdom', 52.6339, -1.1360);

-- 3. Offices
INSERT OR IGNORE INTO offices (id, country_id, name, slug, address_line1, city, postcode, latitude, longitude, photo_url, floor_count, operational_hours, is_active) VALUES
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Leicester Hub', 'leicester-hub', '17 Friar Lane', 'Leicester', 'LE1 5RB', 52.6339, -1.1360, '/images/offices/leicester-hub.jpg', 2, '08:00 - 18:00', 1);

INSERT OR IGNORE INTO office_tenants (office_id, tenant_id) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222');

-- 4. Floors
INSERT OR IGNORE INTO floors (id, office_id, floor_number, name, slug, plan_image_url) VALUES
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 0, 'Ground Floor', 'ground-floor', '/images/floors/leicester-ground-floor.jpg'),
('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 1, 'First Floor', 'first-floor', '/images/floors/leicester-first-floor.jpg');

-- 5. Zones & Rooms & Desks (Ground Floor)
INSERT OR IGNORE INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
('z-dev', '66666666-6666-6666-6666-666666666666', 'Room 1 - Dev Team', 'workspace', 11, -12, 5, 180, 140),
('z-boardroom', '66666666-6666-6666-6666-666666666666', 'Room 7 - Board Room', 'meeting_room', 8, 18, -16, 140, 120),
('z-reception', '66666666-6666-6666-6666-666666666666', 'Reception & Meeting Suite', 'workspace', 6, -12, -18, 140, 100),
('z-gf-kitchen', '66666666-6666-6666-6666-666666666666', 'Shared Kitchen & Amenities (GF)', 'amenity', NULL, 18, 5, 120, 100);

INSERT OR IGNORE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
('mr-boardroom', 'z-boardroom', 'Room 7 - Board Room', 8, '8-Person Boardroom Table, 75" 4K Screen, Video Conference, Whiteboard', 1, 'available'),
('mr-reception', 'z-reception', 'Client Meeting Room', 6, '4K Display, Conference Phone', 0, 'available');

-- Ground Floor Room 1 Dev Team Desks (Ian, Sasha, James, Greg, Luan, Sam W, Seb, Sukhpal, Pete, Bence, Jack)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags, desk_type, assigned_user_name) VALUES
('d-gf-01', 'z-dev', 'UK-LEI-GF-D01', 'Ian', -16, 8, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Ian'),
('d-gf-02', 'z-dev', 'UK-LEI-GF-D02', 'Sasha', -12, 8, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Sasha'),
('d-gf-03', 'z-dev', 'UK-LEI-GF-D03', 'James', -8, 8, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'James'),
('d-gf-04', 'z-dev', 'UK-LEI-GF-D04', 'Greg', -16, 4, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Greg'),
('d-gf-05', 'z-dev', 'UK-LEI-GF-D05', 'Luan', -12, 4, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Luan'),
('d-gf-06', 'z-dev', 'UK-LEI-GF-D06', 'Sam W', -8, 4, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Sam W'),
('d-gf-07', 'z-dev', 'UK-LEI-GF-D07', 'Seb', -16, 0, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Seb'),
('d-gf-08', 'z-dev', 'UK-LEI-GF-D08', 'Sukhpal', -12, 0, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Sukhpal'),
('d-gf-09', 'z-dev', 'UK-LEI-GF-D09', 'Pete', -8, 0, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Pete'),
('d-gf-10', 'z-dev', 'UK-LEI-GF-D10', 'Bence', -4, 4, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Bence'),
('d-gf-11', 'z-dev', 'UK-LEI-GF-D11', 'Jack', -4, 8, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Jack');

INSERT OR IGNORE INTO amenities (id, zone_id, type, name, x, y) VALUES
('a-gf-k', 'z-gf-kitchen', 'kitchen', 'Ground Floor Shared Kitchen', 16, 4),
('a-gf-t', 'z-gf-kitchen', 'toilet', 'Restrooms (Disabled, F/M)', 16, -2);

-- 6. Zones & Rooms & Desks (First Floor)
INSERT OR IGNORE INTO zones (id, floor_id, name, type, capacity, x, y, width, height) VALUES
('z-proj', '77777777-7777-7777-7777-777777777777', 'Room 2 - Projects Team', 'workspace', 6, 18, 16, 140, 120),
('z-supp', '77777777-7777-7777-7777-777777777777', 'Room 3 - Support Team', 'workspace', 5, 18, 2, 140, 120),
('z-overflow', '77777777-7777-7777-7777-777777777777', 'Room 4 - Overflow & WCL Hotdesks', 'hot_desk', 4, 18, -16, 140, 120),
('z-meeting-5', '77777777-7777-7777-7777-777777777777', 'Room 5 - Meeting Room', 'meeting_room', 6, 0, -16, 120, 100),
('z-mgmt', '77777777-7777-7777-7777-777777777777', 'Room 6 - Senior Management', 'workspace', 4, -18, -16, 140, 120),
('z-1f-kitchen', '77777777-7777-7777-7777-777777777777', 'Tea Point & Amenities (1F)', 'amenity', NULL, 12, -8, 100, 80);

INSERT OR IGNORE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES
('mr-room-5', 'z-meeting-5', 'Room 5 - Meeting Room', 6, 'Conference Table, 4K Screen, Soundbar', 0, 'available'),
('mr-room-6', 'z-mgmt', 'Room 6 - Executive Board Table', 8, '8-Seat Boardroom Table, AV Display, Video Conference', 1, 'available');

-- Room 2 Projects Team (Simon, Shaun, etc.)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags, desk_type, assigned_user_name) VALUES
('d-1f-pr01', 'z-proj', 'UK-LEI-1F-PR01', 'Simon', 16, 18, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Simon'),
('d-1f-pr02', 'z-proj', 'UK-LEI-1F-PR02', 'Shaun', 20, 18, 'permanent', 0, 'Dual 4K, Dock', 'permanent', 'Shaun'),
('d-1f-pr03', 'z-proj', 'UK-LEI-1F-PR03', 'Projects Desk 3', 16, 14, 'available', 1, 'Dual Monitor, USB-C Dock', 'flexible', NULL),
('d-1f-pr04', 'z-proj', 'UK-LEI-1F-PR04', 'Projects Desk 4', 20, 14, 'available', 1, 'Dual Monitor, USB-C Dock', 'flexible', NULL);

-- Room 3 Support Team (Jed, Sam C, Beyzanur, Claudia, Alek)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags, desk_type, assigned_user_name) VALUES
('d-1f-sp01', 'z-supp', 'UK-LEI-1F-SP01', 'Jed', 16, 4, 'permanent', 0, 'Dual Monitor, Headset Dock', 'permanent', 'Jed'),
('d-1f-sp02', 'z-supp', 'UK-LEI-1F-SP02', 'Sam C', 20, 4, 'permanent', 0, 'Dual Monitor, Headset Dock', 'permanent', 'Sam C'),
('d-1f-sp03', 'z-supp', 'UK-LEI-1F-SP03', 'Beyzanur', 16, 0, 'permanent', 0, 'Dual Monitor, Headset Dock', 'permanent', 'Beyzanur'),
('d-1f-sp04', 'z-supp', 'UK-LEI-1F-SP04', 'Claudia', 20, 0, 'permanent', 0, 'Dual Monitor, Headset Dock', 'permanent', 'Claudia'),
('d-1f-sp05', 'z-supp', 'UK-LEI-1F-SP05', 'Alek', 18, -2, 'permanent', 0, 'Dual Monitor, Headset Dock', 'permanent', 'Alek');

-- Room 4 Overflow Desks & WCL Hotdesks (Rob, WCL hotdesks)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags, desk_type, assigned_user_name) VALUES
('d-1f-ov01', 'z-overflow', 'UK-LEI-1F-OV01', 'Rob', 16, -14, 'permanent', 0, 'Dual Monitor', 'permanent', 'Rob'),
('d-1f-ov02', 'z-overflow', 'UK-LEI-1F-OV02', 'WCL Hotdesk 1', 20, -14, 'available', 1, 'Single Monitor, USB-C Dock', 'flexible', NULL),
('d-1f-ov03', 'z-overflow', 'UK-LEI-1F-OV03', 'WCL Hotdesk 2', 16, -18, 'available', 1, 'Single Monitor, USB-C Dock', 'flexible', NULL),
('d-1f-ov04', 'z-overflow', 'UK-LEI-1F-OV04', 'WCL Hotdesk 3', 20, -18, 'available', 1, 'Single Monitor, USB-C Dock', 'flexible', NULL);

-- Room 6 Senior Management (Jack, Joe)
INSERT OR IGNORE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags, desk_type, assigned_user_name) VALUES
('d-1f-mg01', 'z-mgmt', 'UK-LEI-1F-MG01', 'Jack', -16, -14, 'permanent', 0, 'Executive Dual Display', 'permanent', 'Jack'),
('d-1f-mg02', 'z-mgmt', 'UK-LEI-1F-MG02', 'Joe', -20, -14, 'permanent', 0, 'Executive Dual Display', 'permanent', 'Joe');

INSERT OR IGNORE INTO amenities (id, zone_id, type, name, x, y) VALUES
('a-1f-k', 'z-1f-kitchen', 'kitchen', 'First Floor Tea Point', 12, -8),
('a-1f-t', 'z-1f-kitchen', 'toilet', 'Restrooms & Shower (1F)', 16, -8),
('a-1f-p', 'z-1f-kitchen', 'printer', 'Network Print Station', 10, -8);

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