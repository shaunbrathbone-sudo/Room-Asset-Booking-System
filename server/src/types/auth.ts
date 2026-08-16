export interface UserPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'employee' | 'approver' | 'location_admin' | 'super_admin';
    tenantId: string | null;
}

export interface RegisterBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId?: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}