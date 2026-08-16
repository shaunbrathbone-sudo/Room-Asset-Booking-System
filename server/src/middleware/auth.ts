import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Role-Based Access Control middleware for Local & Top Admins.
 */
export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userRole = req.user.role;
        
        // Super Admin always has universal estate access
        if (userRole === 'super_admin') {
            next();
            return;
        }

        // Local Admins / Location Admins / Facility Managers
        const allowedRoles = roles.length > 0 ? roles : ['super_admin', 'location_admin', 'facility_manager', 'admin'];
        if (allowedRoles.includes(userRole)) {
            next();
            return;
        }

        res.status(403).json({ error: 'Forbidden: Requires Local or Top Admin privileges' });
    };
};

/**
 * Optional authentication - attaches user if token present, continues without if not.
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
    } catch {
        // Token invalid - continue without user context
    }

    next();
};