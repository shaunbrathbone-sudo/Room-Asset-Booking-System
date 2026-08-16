'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { UserPayload, TokenPair, AuthState, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('auth_user');
            const storedTokens = localStorage.getItem('auth_tokens');

            if (storedUser && storedTokens) {
                setState({
                    user: JSON.parse(storedUser),
                    tokens: JSON.parse(storedTokens),
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } catch {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const persistAuth = useCallback((user: UserPayload, tokens: TokenPair) => {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
        setState({ user, tokens, isAuthenticated: true, isLoading: false });
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const { data } = await api.post('/auth/login', credentials);
        persistAuth(data.user, data.tokens);
    }, [persistAuth]);

    const register = useCallback(async (regData: RegisterData) => {
        const { data } = await api.post('/auth/register', regData);
        persistAuth(data.user, data.tokens);
    }, [persistAuth]);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tokens');
        setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};