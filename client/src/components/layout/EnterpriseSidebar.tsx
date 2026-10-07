'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Globe2,
    MapPin,
    CalendarDays,
    Building2,
    Shield,
    Sun,
    Moon,
    LogOut,
    ChevronRight,
    UserCircle2,
    Layers
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/explore',
        icon: LayoutDashboard,
    },
    {
        label: 'Global Map',
        href: '/explore',
        icon: Globe2,
    },
    {
        label: 'Floor Plan',
        href: '/explore/united-kingdom/leicester-hub/ground-floor',
        icon: Layers,
    },
    {
        label: 'Offices',
        href: '/explore/united-kingdom/leicester-hub',
        icon: Building2,
    },
    {
        label: 'Bookings',
        href: '/bookings',
        icon: CalendarDays,
    },
    {
        label: 'Admin Portal',
        href: '/admin',
        icon: Shield,
        adminOnly: true,
        badge: 'Admin',
    },
];

export const EnterpriseSidebar = () => {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isAdmin = user?.role === 'location_admin' || user?.role === 'super_admin';

    return (
        <aside
            className="w-64 h-screen sticky top-0 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transition-colors"
            aria-label="Enterprise Navigation Sidebar"
        >
            {/* Top Brand Section */}
            <div className="flex flex-col">
                <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg">
                        <Globe2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                            Global<span className="text-blue-600 dark:text-cyan-400">Connect</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            Workspace SAMS v1.2
                        </span>
                    </div>
                </div>

                {/* Primary Nav Links */}
                <nav className="p-3 space-y-1" aria-label="Main links">
                    {navItems.map((item) => {
                        if (item.adminOnly && !isAdmin) return null;
                        const Icon = item.icon;
                        const isActive =
                            item.label === 'Floor Plan'
                                ? pathname.includes('/ground-floor') || pathname.includes('/first-floor') || pathname.includes('/floor-')
                                : item.label === 'Global Map'
                                ? pathname === '/explore'
                                : pathname.startsWith(item.href) && item.href !== '/explore';

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                                    isActive
                                        ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={cn(
                                            'w-4 h-4 transition-colors',
                                            isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                        )}
                                    />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom User Profile & Theme Section */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {/* Theme Toggle Button */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        aria-label="Toggle colour theme"
                    >
                        <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-500" />
                            )}
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            {theme === 'dark' ? 'DARK' : 'LIGHT'}
                        </Badge>
                    </Button>
                )}

                {/* User Info Card */}
                {isAuthenticated && user ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                                    {user.role?.replace('_', ' ') || 'Staff Member'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            title="Sign out"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            aria-label="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                            Sign In
                        </Button>
                    </Link>
                )}
            </div>
        </aside>
    );
};
