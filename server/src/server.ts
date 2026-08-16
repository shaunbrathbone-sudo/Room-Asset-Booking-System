import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getPool, closePool } from './config/database';

// Route imports
import authRoutes from './routes/auth.routes';
import spatialRoutes from './routes/spatial.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ── Security & Parsing ──────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,  // Allow inline scripts during dev
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', spatialRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Database Init & Schema Application ──────────────────────
const applySchema = async (): Promise<void> => {
    try {
        const pool = await getPool();
        const schemaPath = path.join(__dirname, 'db', 'schema.mssql.sql');

        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf-8');

            // Split by GO-like batches (double newline before IF/CREATE)
            const statements = schema
                .split(/\n\n(?=(?:IF|CREATE|INSERT|ALTER))/gi)
                .filter((s) => s.trim().length > 0);

            for (const stmt of statements) {
                try {
                    await pool.request().query(stmt);
                } catch (err) {
                    // Ignore errors for IF NOT EXISTS patterns and duplicate indexes
                    const msg = (err as Error).message;
                    if (!msg.includes('already exists') && !msg.includes('duplicate')) {
                        console.warn('[DB] Schema statement warning:', msg.substring(0, 200));
                    }
                }
            }

            console.log('[DB] Schema applied successfully.');
        }
    } catch (err) {
        console.error('[DB] Failed to apply schema:', (err as Error).message);
    }
};

// ── Start Server ────────────────────────────────────────────
const start = async (): Promise<void> => {
    try {
        await applySchema();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
        });
    } catch (err) {
        console.error('Failed to start server:', (err as Error).message);
        process.exit(1);
    }
};

// ── Graceful Shutdown ───────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    await closePool();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();