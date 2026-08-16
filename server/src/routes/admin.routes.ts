import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Gated for approvers, location admins and super admins
router.use(authenticate);

// ── 1. APPROVALS QUEUE ───────────────────────────────────────────
router.get('/approvals', requireRole('approver', 'location_admin', 'super_admin'), async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT 
                b.id, b.resource_type, b.resource_id, b.start_time, b.end_time, b.status,
                b.created_at,
                u.id AS user_id, u.first_name || ' ' || u.last_name AS user_name, u.email AS user_email,
                CASE 
                    WHEN b.resource_type = 'meeting_room' THEN mr.name
                    WHEN b.resource_type = 'asset' THEN a.name
                    ELSE 'Resource'
                END AS resource_name
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            LEFT JOIN meeting_rooms mr ON mr.id = b.resource_id AND b.resource_type = 'meeting_room'
            LEFT JOIN assets a ON a.id = b.resource_id AND b.resource_type = 'asset'
            WHERE b.status = 'pending_approval'
            ORDER BY b.start_time ASC
        `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            resourceName: row.resource_name,
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.status,
            createdAt: row.created_at,
            userId: row.user_id,
            userFullName: row.user_name,
            userEmail: row.user_email,
        })));
    } catch (err) {
        console.error('Error fetching approvals queue:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/approvals/:id/decision', requireRole('approver', 'location_admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: "Action must be 'approve' or 'reject'" });
        }

        const pool = await getPool();
        const newStatus = action === 'approve' ? 'confirmed' : 'rejected';

        await pool.request()
            .input('id', id)
            .input('status', newStatus)
            .input('note', note || null)
            .query(`
                UPDATE bookings 
                SET status = @status, 
                    approval_note = @note,
                    updated_at = datetime('now')
                WHERE id = @id
            `);

        res.json({ message: `Reservation ${newStatus} successfully.` });
    } catch (err) {
        console.error('Error processing approval decision:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 2. ALLOWED CORPORATE DOMAINS (WHITELIST) ─────────────────────
router.get('/domains', requireRole('location_admin', 'super_admin'), async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT d.*, t.name AS tenant_name
            FROM allowed_domains d
            LEFT JOIN tenants t ON t.id = d.tenant_id
            ORDER BY d.domain ASC
        `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            domain: row.domain,
            tenantId: row.tenant_id,
            tenantName: row.tenant_name || 'All Tenants',
            isActive: row.is_active === 1,
            createdAt: row.created_at,
        })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch domain whitelist' });
    }
});

router.post('/domains', requireRole('super_admin'), async (req, res) => {
    try {
        const { domain, tenantId } = req.body;
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }

        const cleanDomain = domain.trim().toLowerCase().replace(/^@/, '');
        const pool = await getPool();
        const id = uuidv4();

        await pool.request()
            .input('id', id)
            .input('domain', cleanDomain)
            .input('tenantId', tenantId || null)
            .query(`
                INSERT INTO allowed_domains (id, domain, tenant_id, is_active, created_at)
                VALUES (@id, @domain, @tenantId, 1, datetime('now'))
            `);

        res.status(201).json({ message: `Domain '@${cleanDomain}' added to authorized whitelist.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add domain' });
    }
});

router.delete('/domains/:id', requireRole('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        await pool.request()
            .input('id', id)
            .query('DELETE FROM allowed_domains WHERE id = @id');

        res.json({ message: 'Domain removed from whitelist.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete domain' });
    }
});

// ── 3. USER MANAGEMENT & RBAC ────────────────────────────────────
router.get('/users', requireRole('location_admin', 'super_admin'), async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
                   t.name AS tenant_name,
                   COUNT(b.id) AS total_bookings
            FROM users u
            LEFT JOIN tenants t ON t.id = u.tenant_id
            LEFT JOIN bookings b ON b.user_id = u.id
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at, t.name
            ORDER BY u.created_at DESC
        `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            fullName: `${row.first_name} ${row.last_name}`,
            role: row.role,
            tenantName: row.tenant_name || 'Unassigned',
            isActive: row.is_active === 1,
            totalBookings: row.total_bookings || 0,
            createdAt: row.created_at,
        })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user directory' });
    }
});

router.put('/users/:id/role', requireRole('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['employee', 'approver', 'location_admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const pool = await getPool();
        await pool.request()
            .input('id', id)
            .input('role', role)
            .query("UPDATE users SET role = @role, updated_at = datetime('now') WHERE id = @id");

        res.json({ message: 'User role updated.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

router.put('/users/:id/status', requireRole('super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const pool = await getPool();
        await pool.request()
            .input('id', id)
            .input('isActive', isActive ? 1 : 0)
            .query("UPDATE users SET is_active = @isActive, updated_at = datetime('now') WHERE id = @id");

        res.json({ message: `User status set to ${isActive ? 'active' : 'disabled'}.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
});

// ── 4. SYSTEM & BOOKING GOVERNANCE CONFIGS ───────────────────────
router.get('/system-configs', requireRole('location_admin', 'super_admin'), async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM system_configs ORDER BY config_key ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch system configs' });
    }
});

router.put('/system-configs', requireRole('super_admin'), async (req, res) => {
    try {
        const { configs } = req.body; // Array of { config_key, config_value }
        const pool = await getPool();

        for (const item of configs) {
            await pool.request()
                .input('key', item.config_key)
                .input('val', String(item.config_value))
                .query("UPDATE system_configs SET config_value = @val, updated_at = datetime('now') WHERE config_key = @key");
        }

        res.json({ message: 'System governance parameters updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update system configs' });
    }
});

export default router;