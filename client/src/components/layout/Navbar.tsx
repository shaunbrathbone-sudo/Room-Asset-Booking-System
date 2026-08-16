'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    Globe, ChevronRight, ChevronDown, Sun, Moon, LogOut, Settings, 
    Calendar, Car, Sparkles, Bug, ShieldCheck, BarChart3, Shield, 
    User as UserIcon, Zap, Building2, HelpCircle, Layers, Mail, 
    CheckSquare, PlusCircle, BookOpen, Compass 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { BookNowQuickModal } from '@/components/booking/BookNowQuickModal';
import { useAuth } from '@/providers/AuthProvider';

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();

    const [bookNowOpen, setBookNowOpen] = useState(false);
    const [spacesDropdownOpen, setSpacesDropdownOpen] = useState(false);
    const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const spacesRef = useRef<HTMLDivElement>(null);
    const supportRef = useRef<HTMLDivElement>(null);
    const adminRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const isApproverOrAdmin = user?.role === 'approver' || user?.role === 'location_admin' || user?.role === 'super_admin';
    const isFullAdmin = user?.role === 'location_admin' || user?.role === 'super_admin';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (spacesRef.current && !spacesRef.current.contains(target)) setSpacesDropdownOpen(false);
            if (supportRef.current && !supportRef.current.contains(target)) setSupportDropdownOpen(false);
            if (adminRef.current && !adminRef.current.contains(target)) setAdminDropdownOpen(false);
            if (profileRef.current && !profileRef.current.contains(target)) setProfileDropdownOpen(false);
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSpacesDropdownOpen(false);
                setSupportDropdownOpen(false);
                setAdminDropdownOpen(false);
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setSpacesDropdownOpen(false);
        setSupportDropdownOpen(false);
        setAdminDropdownOpen(false);
        setProfileDropdownOpen(false);
    }, [pathname]);
    return (
        <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800" role="navigation" aria-label="Main navigation">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-6 min-w-0">
                        <Link href="/explore/united-kingdom/leicester-hub" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="Go to My Workspaces Home">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                                    My <span className="text-blue-600 dark:text-cyan-400 font-bold">Workspaces</span>
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                    3D Space & Booking
                                </span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setBookNowOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 mr-1"
                            >
                                <Zap className="w-3.5 h-3.5 fill-slate-950 animate-pulse" />
                                <span>Book Now</span>
                            </button>

                            <div ref={spacesRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setSpacesDropdownOpen(!spacesDropdownOpen)}
                                    aria-expanded={spacesDropdownOpen}
                                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                        pathname.startsWith('/explore') || pathname === '/assets'
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-bold'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Building2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                                    <span>Workspaces</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${spacesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {spacesDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                        <Link
                                            href="/explore/united-kingdom/leicester-hub"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    My Local Office
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Leicester Hub Floor Stack
                                                </span>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/explore"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    Global 3D Earth Globe
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Explore UK & India Hubs
                                                </span>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/assets"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                                <Car className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    Shared Fleet & Assets
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Pool Vehicles & Tech Gear
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/bookings"
                                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                    pathname === '/bookings'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-bold'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                                <span>My Bookings</span>
                            </Link>
                            <div ref={supportRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setSupportDropdownOpen(!supportDropdownOpen)}
                                    aria-expanded={supportDropdownOpen}
                                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                        pathname.startsWith('/feedback') || pathname.endsWith('/guide')
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-bold'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <HelpCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                                    <span>Support</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {supportDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                        <Link
                                            href="/feedback/features"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    Roadmap & Proposals
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Vote on new workspace features
                                                </span>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/feedback/bugs"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                                <Bug className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    Report Bug / Issue
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Hardware, AV or system bugs
                                                </span>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/explore/united-kingdom/leicester-hub/guide"
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                    Office Guide & Commute
                                                </span>
                                                <span className="text-[10px] text-slate-500 block">
                                                    Arrival, transit & parking
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {isFullAdmin && (
                                <div ref={adminRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                        aria-expanded={adminDropdownOpen}
                                        className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                            pathname.startsWith('/admin')
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-bold'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Shield className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                                        <span>Estate Admin</span>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {adminDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Estate Management Hub
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Active offices & quick tools
                                                    </span>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/admin/offices/new"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <PlusCircle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Onboard Workplace (Wizard)
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        5-step building provisioner
                                                    </span>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/admin/offices/leicester-hub/floor-editor"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                                    <Layers className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Floor & Desk Organiser
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Workstation layout & tags
                                                    </span>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/admin/email-templates"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Email & Alerts Studio
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Confirmations & 15m alerts
                                                    </span>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/admin/analytics"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                                    <BarChart3 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Occupancy & ESG Analytics
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Utilisation & hybrid trends
                                                    </span>
                                                </div>
                                            </Link>

                                            <Link
                                                href="/admin/approvals"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                    <CheckSquare className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                                        Room Approvals
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        VIP suite & boardroom queue
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <UniversalSearch />
                        </div>

                        <button
                            type="button"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
                        </button>

                        {isAuthenticated && user && (
                            <div ref={profileRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    aria-expanded={profileDropdownOpen}
                                    className="flex items-center gap-2 p-1 pl-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                                    aria-label="Open user profile menu"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user.firstName[0]}</span>
                                        )}
                                    </div>
                                    <div className="hidden md:flex flex-col text-left pr-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {user.email}
                                            </p>
                                            {user.tenantName && (
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400">
                                                    {user.tenantName}
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-slate-500" />
                                            <span>Profile & Schedule</span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BookNowQuickModal isOpen={bookNowOpen} onClose={() => setBookNowOpen(false)} />
        </nav>
    );
};

export default Navbar;