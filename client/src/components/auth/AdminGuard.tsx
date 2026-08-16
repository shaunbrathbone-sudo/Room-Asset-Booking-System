'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface AdminGuardProps {
    children: ReactNode;
    allowedRoles?: Array<'employee' | 'approver' | 'location_admin' | 'super_admin'>;
}

export const AdminGuard = ({ 
    children, 
    allowedRoles = ['location_admin', 'super_admin'] 
}: AdminGuardProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const hasPermission = isAuthenticated && user && (
        user.role === 'super_admin' || allowedRoles.includes(user.role)
    );

    if (!hasPermission) {
        return (
            <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center shadow-lg">
                    <ShieldAlert className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                        Access Restricted
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Administrator Privileges Required
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        This section requires Local Admin or Top Admin permissions. You are currently signed in as{' '}
                        <span className="font-bold text-slate-700 dark:text-slate-200 uppercase font-mono">
                            {user?.role ? user.role.replace('_', ' ') : 'Guest / User'}
                        </span>.
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/explore')}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                    >
                        <Globe className="w-4 h-4" /> Return to Workplace Explorer
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminGuard;