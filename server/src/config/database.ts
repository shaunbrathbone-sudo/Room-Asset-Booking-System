import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Universal Dual-Database Interface (MSSQL with automatic SQLite fallback).
 */
export interface UniversalPool {
    request: () => UniversalRequest;
    close: () => Promise<void>;
}

export interface UniversalRequest {
    input: (name: string, valueOrType: any, value?: any) => UniversalRequest;
    query: (sqlText: string) => Promise<{ recordset: any[]; rowsAffected?: number[] }>;
}

let activeDriver: 'mssql' | 'sqlite' = 'sqlite';
let sqliteDb: any = null;
let mssqlPool: any = null;

const initSqlite = () => {
    if (!sqliteDb) {
        const { DatabaseSync } = require('node:sqlite');
        const dbPath = path.join(__dirname, '..', '..', 'spacebook.db');
        sqliteDb = new DatabaseSync(dbPath);
        console.log(`[DB] Connected to SQLite database at: ${dbPath}`);

        const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
        const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
            sqliteDb.exec(schemaSql);
        }

        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf-8');
            try {
                sqliteDb.exec(seedSql);
            } catch (err) {
                // Ignore duplicates
            }
        }
    }
};

const createSqliteRequest = (): UniversalRequest => {
    const params: Record<string, any> = {};

    const req: UniversalRequest = {
        input: (name: string, valueOrType: any, value?: any) => {
            const actualVal = value !== undefined ? value : valueOrType;
            params[name] = actualVal;
            return req;
        },
        query: async (sqlText: string) => {
            initSqlite();

            // Transform MSSQL SQL text to SQLite compatible SQL
            let transformed = sqlText
                .replace(/GETUTCDATE\(\)/gi, "datetime('now')")
                .replace(/DATEADD\(minute,\s*@?([a-zA-Z0-9_]+),\s*([^)]+)\)/gi, "datetime($2, '+' || @$1 || ' minutes')")
                .replace(/DATEADD\(hour,\s*([0-9]+),\s*GETUTCDATE\(\)\)/gi, "datetime('now', '+$1 hours')")
                .replace(/TOP\s*\(\s*@?([a-zA-Z0-9_]+)\s*\)/gi, "")
                .replace(/\[([^\]]+)\]/g, '"$1"')
                .replace(/u\.first_name\s*\+\s*' '\s*\+\s*u\.last_name/gi, "u.first_name || ' ' || u.last_name");

            // Extract numeric TOP N and append as LIMIT N
            const numTopMatch = sqlText.match(/TOP\s+([0-9]+)/i);
            transformed = transformed.replace(/TOP\s+[0-9]+/gi, "");
            if (numTopMatch && !transformed.toLowerCase().includes('limit')) {
                transformed += ` LIMIT ${numTopMatch[1]}`;
            }

            // Convert @named params to :named params for SQLite
            let sqliteSql = transformed.replace(/@([a-zA-Z0-9_]+)/g, ':$1');

            const bindObj: Record<string, any> = {};
            for (const [k, v] of Object.entries(params)) {
                if (typeof v === 'boolean') {
                    bindObj[k] = v ? 1 : 0;
                } else if (v === undefined) {
                    bindObj[k] = null;
                } else {
                    bindObj[k] = v;
                }
            }

            try {
                const trimmed = sqliteSql.trim().toUpperCase();
                if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
                    const stmt = sqliteDb.prepare(sqliteSql);
                    const rows = stmt.all(bindObj);
                    return { recordset: rows };
                } else {
                    const stmt = sqliteDb.prepare(sqliteSql);
                    const info = stmt.run(bindObj);
                    return { recordset: [], rowsAffected: [info.changes] };
                }
            } catch (err) {
                console.error(`[SQLITE ERROR] in query:\n${sqliteSql}\nParams:`, bindObj, `\nError: ${(err as Error).message}`);
                throw err;
            }
        },
    };

    return req;
};

export const getPool = async (): Promise<UniversalPool> => {
    if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost_disabled') {
        try {
            if (!mssqlPool) {
                const sql = require('mssql');
                const config = {
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
                    connectionTimeout: 2000,
                };
                mssqlPool = await new sql.ConnectionPool(config).connect();
                activeDriver = 'mssql';
                console.log('[DB] Connected to MSSQL Server on port 1433.');
            }
            return mssqlPool;
        } catch {
            activeDriver = 'sqlite';
        }
    }

    initSqlite();
    return {
        request: createSqliteRequest,
        close: async () => {
            if (sqliteDb) {
                sqliteDb.close();
                sqliteDb = null;
            }
        },
    };
};

export const closePool = async (): Promise<void> => {
    if (mssqlPool) {
        await mssqlPool.close();
        mssqlPool = null;
    }
    if (sqliteDb) {
        sqliteDb.close();
        sqliteDb = null;
    }
};

export default { getPool, closePool };