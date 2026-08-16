'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Lock, Mail, User, ShieldAlert, ArrowRight, Building } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const RegisterPage = () => {
    const router = useRouter();
    const { register, loginWithTokens } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('11111111-1111-1111-1111-111111111111');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await register({
                firstName,
                lastName,
                email,
                password,
                tenantId,
            });
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftSSO = async () => {
        setError(null);
        setLoading(true);

        try {
            const ssoEmail = email || prompt('Enter your Microsoft corporate email address:');
            if (!ssoEmail) {
                setLoading(false);
                return;
            }

            const { data } = await api.post('/auth/sso/microsoft', {
                email: ssoEmail,
                firstName: firstName || 'Corporate',
                lastName: lastName || 'User',
            });

            loginWithTokens(data.tokens, data.user);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Microsoft SSO authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Create Corporate Account
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Register with your authorized company email address.
                    </p>
                </div>

                {/* Microsoft SSO Fast-Track Button */}
                <button
                    type="button"
                    onClick={handleMicrosoftSSO}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 transition-all shadow-sm mb-6 group"
                >
                    <svg className="w-4 h-4" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                        <rect x="1" y="1" width="9" height="9" fill="#00a4ef" />
                        <rect x="11" y="1" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span>Single Sign-On with Microsoft 365</span>
                </button>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                    <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Or Register with Email
                    </span>
                </div>

                {error && (
                    <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Jane"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Corporate Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@cloudfy.com"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Authorized domains: @cloudfy.com, @williamscommerce.com, @brandwidth.com
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Tenant</label>
                        <div className="relative">
                            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <select
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="11111111-1111-1111-1111-111111111111">Cloudfy UK Ltd</option>
                                <option value="22222222-2222-2222-2222-222222222222">Williams Commerce Ltd</option>
                                <option value="33333333-3333-3333-3333-333333333333">Brandwidth Group</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-blue-600 hover:underline">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;