import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getPool } from '../config/database';
import { UserPayload, RegisterBody, LoginBody, TokenPair } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 12;

const generateTokens = (user: UserPayload): TokenPair => {
    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

export const register = async (body: RegisterBody): Promise<{ user: UserPayload; tokens: TokenPair }> => {
    const pool = await getPool();

    const existing = await pool.request()
        .input('email', body.email.toLowerCase())
        .query('SELECT id FROM users WHERE email = @email');

    if (existing.recordset.length > 0) {
        throw new Error('An account with this email already exists');
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

    await pool.request()
        .input('id', id)
        .input('email', body.email.toLowerCase())
        .input('passwordHash', passwordHash)
        .input('firstName', body.firstName)
        .input('lastName', body.lastName)
        .input('tenantId', body.tenantId || null)
        .query(`
            INSERT INTO users (id, email, password_hash, first_name, last_name, tenant_id)
            VALUES (@id, @email, @passwordHash, @firstName, @lastName, @tenantId)
        `);

    await pool.request()
        .input('userId', id)
        .query('INSERT INTO user_preferences (user_id) VALUES (@userId)');

    const user: UserPayload = {
        id,
        email: body.email.toLowerCase(),
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'employee',
        tenantId: body.tenantId || null,
    };

    const tokens = generateTokens(user);
    return { user, tokens };
};

export const login = async (body: LoginBody): Promise<{ user: UserPayload; tokens: TokenPair }> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('email', body.email.toLowerCase())
        .query(`
            SELECT id, email, password_hash, first_name, last_name, role, tenant_id
            FROM users
            WHERE email = @email AND is_active = 1
        `);

    if (result.recordset.length === 0) {
        throw new Error('Invalid email or password');
    }

    const row = result.recordset[0];
    const valid = await bcrypt.compare(body.password, row.password_hash);

    if (!valid) {
        throw new Error('Invalid email or password');
    }

    const user: UserPayload = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        tenantId: row.tenant_id,
    };

    const tokens = generateTokens(user);
    return { user, tokens };
};

export const refreshToken = async (token: string): Promise<TokenPair> => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
        const pool = await getPool();

        const result = await pool.request()
            .input('id', decoded.id)
            .query(`
                SELECT id, email, first_name, last_name, role, tenant_id
                FROM users
                WHERE id = @id AND is_active = 1
            `);

        if (result.recordset.length === 0) {
            throw new Error('User not found');
        }

        const row = result.recordset[0];
        const user: UserPayload = {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            tenantId: row.tenant_id,
        };

        return generateTokens(user);
    } catch {
        throw new Error('Invalid or expired refresh token');
    }
};

export const getUserById = async (id: string): Promise<UserPayload | null> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', id)
        .query(`
            SELECT id, email, first_name, last_name, role, tenant_id
            FROM users
            WHERE id = @id AND is_active = 1
        `);

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];
    return {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        tenantId: row.tenant_id,
    };
};