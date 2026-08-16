'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, ChevronRight, Sun, Moon, LogOut, Settings, Calendar, Car, Sparkles, Bug, ShieldCheck, BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { useAuth } from '@/providers/AuthProvider';

const parseBreadcrumbs = (pathname: string) => {
    const crumbs: { label: string; href: string }[] = [];

    if (!pathname.startsWith('/explore')) return crumbs;

    crumbs.push({ label: 'Globe', href: '/explore' });

    const parts = pathname.replace('/explore/', '').split('/').filter(Boolean);
    let href = '/explore';

    parts.forEach((part, i) => {
        href += `/${part}`;
        const label = part
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        crumbs.push({ label, href });
    });

    return crumbs;
};

export const Navbar = () => {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const breadcrumbs = parseBreadcrumbs(pathname);
    const isApproverOrAdmin = user?.role === 'approver' || user?.role === 'location_admin' || user?.role === 'super_admin';

    return (
        <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800" role="navigation" aria-label="Main navigation">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Navigation Links */}
                    <div className="flex items-center gap-6 min-w-0">
                        <Link href="/explore" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Go to globe view">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <span className="hidden sm:block font-bold text-base tracking-tight text-slate-900 dark:text-white">SpaceBook 3D</span>
                        </Link>

                        {/* Top Nav Links */}
                        <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
                            <Link
                                href="/explore"
                                className={`px-3 py-1.5 rounded-lg transition-colors ${
                                    pathname.startsWith('/explore')
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                3D Spaces
                            </Link>
                            <Link
                                href="/assets"
                                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                    pathname === '/assets'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                <Car className="w-4 h-4" /> Shared Assets
                            </Link>
                            <Link
                                href="/bookings"
                                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                    pathname === '/bookings'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                <Calendar className="w-4 h-4" /> My Bookings
                            </Link>
                            <Link
                                href="/feedback/features"
                                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                    pathname.startsWith('/feedback/features')
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                <Sparkles className="w-4 h-4" /> Roadmap
                            </Link>
                            <Link
                                href="/feedback/bugs"
                                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                    pathname.startsWith('/feedback/bugs')
                                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                                }`}
                            >
                                <Bug className="w-4 h-4" /> Bugs
                            </Link>
                            {isApproverOrAdmin && (
                                <>
                                    <Link
                                        href="/admin/approvals"
                                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                            pathname.startsWith('/admin/approvals')
                                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'
                                        }`}
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Approvals
                                    </Link>
                                    <Link
                                        href="/admin/analytics"
                                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                                            pathname.startsWith('/admin/analytics')
                                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
                                        }`}
                                    >
                                        <BarChart3 className="w-4 h-4" /> Analytics
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Spatial Breadcrumbs */}
                        {breadcrumbs.length > 1 && (
                            <div className="hidden xl:flex items-center gap-1 text-xs pl-4 border-l border-slate-200 dark:border-slate-800" aria-label="Breadcrumb">
                                {breadcrumbs.map((crumb, i) => (
                                    <div key={crumb.href} className="flex items-center gap-1">
                                        {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                                        <Link
                                            href={crumb.href}
                                            className={`px-1.5 py-0.5 rounded transition-colors ${
                                                i === breadcrumbs.length - 1
                                                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-slate-500 hover:text-blue-500'
                                            }`}
                                        >
                                            {crumb.label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search + Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <UniversalSearch />
                        </div>

                        {/* Theme toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User Profile / Menu */}
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/settings"
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                                    aria-label="Settings"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        {user.firstName}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                    aria-label="Log out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};