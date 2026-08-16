import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME || 'RoomAssetBooking',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool: sql.ConnectionPool | null = null;

export const getPool = async (): Promise<sql.ConnectionPool> => {
    if (pool) return pool;

    try {
        pool = await new sql.ConnectionPool(config).connect();
        console.log('[DB] Connected to MSSQL:', config.server, '/', config.database);

        pool.on('error', (err: Error) => {
            console.error('[DB] Pool error:', err.message);
            pool = null;
        });

        return pool;
    } catch (err) {
        console.error('[DB] Failed to connect:', (err as Error).message);
        throw err;
    }
};

export const closePool = async (): Promise<void> => {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('[DB] Connection pool closed.');
    }
};

export default { getPool, closePool };