import { getPool } from '../config/database';

export const seedDomainsAndConfigs = async () => {
    const pool = await getPool();

    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS allowed_domains (
            id              TEXT PRIMARY KEY,
            domain          TEXT NOT NULL UNIQUE,
            tenant_id       TEXT REFERENCES tenants(id),
            is_active       INTEGER NOT NULL DEFAULT 1,
            created_at      TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    const domains = [
        { id: 'dom-1', domain: 'cloudfy.com', tenantId: '11111111-1111-1111-1111-111111111111' },
        { id: 'dom-2', domain: 'williamscommerce.com', tenantId: '22222222-2222-2222-2222-222222222222' },
        { id: 'dom-3', domain: 'brandwidth.com', tenantId: '33333333-3333-3333-3333-333333333333' },
        { id: 'dom-4', domain: 'msn.com', tenantId: '11111111-1111-1111-1111-111111111111' },
    ];

    for (const d of domains) {
        await pool.request()
            .input('id', d.id)
            .input('domain', d.domain)
            .input('tenantId', d.tenantId)
            .query('INSERT OR IGNORE INTO allowed_domains (id, domain, tenant_id, is_active) VALUES (@id, @domain, @tenantId, 1)');
    }

    const configs = [
        { key: 'ghost_booking_grace_minutes', val: '15', desc: 'Minutes before unconfirmed reservation is auto-released' },
        { key: 'max_advance_booking_days', val: '14', desc: 'Maximum days in advance employees can book desks/rooms' },
        { key: 'require_sso', val: 'false', desc: 'Enforce Microsoft Entra ID SSO for all logins' },
    ];

    for (const c of configs) {
        await pool.request()
            .input('key', c.key)
            .input('val', c.val)
            .input('desc', c.desc)
            .query('INSERT OR REPLACE INTO system_configs (config_key, config_value, description) VALUES (@key, @val, @desc)');
    }

    console.log('[DOMAINS] Allowed domains and system configs initialized successfully.');
};

if (require.main === module) {
    seedDomainsAndConfigs().then(() => process.exit(0));
}