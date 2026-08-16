import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';
import { UserPayload } from '../types/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const generateTokens = (payload: UserPayload) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
    const refreshToken = jwt.sign({ id: payload.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
    return { accessToken, refreshToken };
};

// ── Register with Corporate Domain Whitelist Validation ──────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName, tenantId } = req.body;

        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ error: 'All fields (firstName, lastName, email, password) are required.' });
            return;
        }

        const pool = await getPool();

        // 1. Extract email domain & validate against allowed corporate domains
        const emailParts = email.toLowerCase().split('@');
        if (emailParts.length !== 2) {
            res.status(400).json({ error: 'Invalid email address format' });
            return;
        }
        const emailDomain = emailParts[1];

        const domainResult = await pool.request()
            .input('domain', emailDomain)
            .query('SELECT * FROM allowed_domains WHERE domain = @domain AND is_active = 1');

        if (domainResult.recordset.length === 0) {
            res.status(403).json({
                error: `Registration restricted: '${emailDomain}' is not an authorized company domain. Please use your corporate email address or contact your administrator.`,
                code: 'DOMAIN_NOT_WHITELISTED',
                domain: emailDomain,
            });
            return;
        }

        // Auto-assign tenant if configured for domain
        const matchedTenantId = tenantId || domainResult.recordset[0].tenant_id || '11111111-1111-1111-1111-111111111111';

        // 2. Check if user already exists
        const existingUser = await pool.request()
            .input('email', email.toLowerCase())
            .query('SELECT id FROM users WHERE email = @email');

        if (existingUser.recordset.length > 0) {
            res.status(409).json({ error: 'A user with this email address already exists' });
            return;
        }

        // 3. Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const userId = uuidv4();

        // 4. Create user
        await pool.request()
            .input('id', userId)
            .input('email', email.toLowerCase())
            .input('passwordHash', passwordHash)
            .input('firstName', firstName)
            .input('lastName', lastName)
            .input('role', 'employee')
            .input('tenantId', matchedTenantId)
            .query(`
                INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id)
                VALUES (@id, @email, @passwordHash, @firstName, @lastName, @role, @tenantId)
            `);

        // 5. Default preferences (Leicester Hub as default home office)
        await pool.request()
            .input('userId', userId)
            .input('homeOfficeId', '55555555-5555-5555-5555-555555555555')
            .input('defaultView', 'globe')
            .query(`
                INSERT INTO user_preferences (user_id, home_office_id, default_view)
                VALUES (@userId, @homeOfficeId, @defaultView)
            `);

        const userPayload: UserPayload = {
            id: userId,
            email: email.toLowerCase(),
            firstName,
            lastName,
            role: 'employee',
            tenantId: matchedTenantId,
        };

        const tokens = generateTokens(userPayload);
        res.status(201).json({ user: userPayload, tokens });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// ── Microsoft Entra ID Single Sign-On (SSO) ───────────────────
router.post('/sso/microsoft', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, firstName = 'Corporate', lastName = 'User' } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email address is required for SSO' });
            return;
        }

        const emailDomain = email.toLowerCase().split('@')[1];
        const pool = await getPool();

        // Domain Whitelist Check
        const domainResult = await pool.request()
            .input('domain', emailDomain)
            .query('SELECT * FROM allowed_domains WHERE domain = @domain AND is_active = 1');

        if (domainResult.recordset.length === 0) {
            res.status(403).json({
                error: `Single Sign-On blocked: '${emailDomain}' is not registered under corporate tenant federation. Please contact your IT administrator.`,
                code: 'DOMAIN_NOT_WHITELISTED',
                domain: emailDomain,
            });
            return;
        }

        const tenantId = domainResult.recordset[0].tenant_id || '11111111-1111-1111-1111-111111111111';

        // Check if user exists
        const userResult = await pool.request()
            .input('email', email.toLowerCase())
            .query('SELECT * FROM users WHERE email = @email');

        let userRow = userResult.recordset[0];

        if (!userRow) {
            // Provision user on first SSO login
            const userId = uuidv4();
            const dummyHash = await bcrypt.hash(uuidv4(), 10);
            await pool.request()
                .input('id', userId)
                .input('email', email.toLowerCase())
                .input('passwordHash', dummyHash)
                .input('firstName', firstName)
                .input('lastName', lastName)
                .input('role', 'employee')
                .input('tenantId', tenantId)
                .query(`
                    INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id)
                    VALUES (@id, @email, @passwordHash, @firstName, @lastName, @role, @tenantId)
                `);

            await pool.request()
                .input('userId', userId)
                .input('homeOfficeId', '55555555-5555-5555-5555-555555555555')
                .input('defaultView', 'globe')
                .query(`
                    INSERT INTO user_preferences (user_id, home_office_id, default_view)
                    VALUES (@userId, @homeOfficeId, @defaultView)
                `);

            userRow = {
                id: userId,
                email: email.toLowerCase(),
                first_name: firstName,
                last_name: lastName,
                role: 'employee',
                tenant_id: tenantId,
            };
        }

        const userPayload: UserPayload = {
            id: userRow.id,
            email: userRow.email,
            firstName: userRow.first_name,
            lastName: userRow.last_name,
            role: userRow.role,
            tenantId: userRow.tenant_id,
        };

        const tokens = generateTokens(userPayload);
        res.json({ user: userPayload, tokens });
    } catch (err) {
        console.error('SSO error:', err);
        res.status(500).json({ error: 'Single Sign-On authentication error' });
    }
});

// ── Login ───────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const pool = await getPool();

        const result = await pool.request()
            .input('email', email.toLowerCase())
            .query('SELECT * FROM users WHERE email = @email AND is_active = 1');

        if (result.recordset.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const userPayload: UserPayload = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            tenantId: user.tenant_id,
        };

        const tokens = generateTokens(userPayload);
        res.json({ user: userPayload, tokens });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// ── Refresh Token ───────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
        const pool = await getPool();

        const result = await pool.request()
            .input('id', decoded.id)
            .query('SELECT * FROM users WHERE id = @id AND is_active = 1');

        if (result.recordset.length === 0) {
            res.status(401).json({ error: 'User not found or inactive' });
            return;
        }

        const user = result.recordset[0];
        const userPayload: UserPayload = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            tenantId: user.tenant_id,
        };

        const tokens = generateTokens(userPayload);
        res.json({ tokens });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// ── Get Current User Profile ────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', req.user!.id)
            .query(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
                       u.avatar_url, t.name AS tenant_name
                FROM users u
                LEFT JOIN tenants t ON t.id = u.tenant_id
                WHERE u.id = @id
            `);

        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const row = result.recordset[0];
        res.json({
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            tenantId: row.tenant_id,
            tenantName: row.tenant_name,
            avatarUrl: row.avatar_url,
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;