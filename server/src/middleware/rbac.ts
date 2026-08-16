import { Request, Response, NextFunction } from 'express';

type Role = 'employee' | 'approver' | 'location_admin' | 'super_admin';

/**
 * Role hierarchy — higher roles include all lower role permissions.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
    employee: 0,
    approver: 1,
    location_admin: 2,
    super_admin: 3,
};

/**
 * Require a minimum role level to access the route.
 * Must be used AFTER the authenticate middleware.
 */
export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userRole = req.user.role as Role;
        const userLevel = ROLE_HIERARCHY[userRole] ?? -1;

        const hasPermission = allowedRoles.some(
            (role) => userLevel >= ROLE_HIERARCHY[role]
        );

        if (!hasPermission) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};