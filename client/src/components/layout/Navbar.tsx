'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, ChevronRight, Sun, Moon, LogOut, Settings, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { useAuth } from '@/providers/AuthProvider';

/** Parse the current path into breadcrumb segments */
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const breadcrumbs = parseBreadcrumbs(pathname);

    return (
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50" role="navigation" aria-label="Main navigation">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Breadcrumbs */}
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/explore" className="flex items-center gap-2 flex-shrink-0" aria-label="Go to globe view">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <span className="hidden sm:block font-bold text-slate-900 dark:text-white">SpaceBook</span>
                        </Link>

                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                            <div className="hidden md:flex items-center gap-1 text-sm" aria-label="Breadcrumb" role="navigation">
                                {breadcrumbs.map((crumb, i) => (
                                    <div key={crumb.href} className="flex items-center gap-1">
                                        {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                        <Link
                                            href={crumb.href}
                                            className={`px-2 py-1 rounded-md transition-colors ${
                                                i === breadcrumbs.length - 1
                                                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30'
                                                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                            aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
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
                        <div className="hidden sm:block">
                            <UniversalSearch />
                        </div>

                        {/* Theme toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User menu */}
                        {isAuthenticated && user && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/settings"
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                                    aria-label="Settings"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {user.firstName}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                    aria-label="Log out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {!isAuthenticated && (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
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