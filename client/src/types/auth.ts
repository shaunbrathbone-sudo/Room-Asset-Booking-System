export interface UserPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'employee' | 'approver' | 'location_admin' | 'super_admin';
    tenantId: string | null;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AuthState {
    user: UserPayload | null;
    tokens: TokenPair | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId?: string;
}