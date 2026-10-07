'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MapPin,
    Search,
    Bell,
    Zap,
    Building2,
    CheckCircle2,
    Calendar,
    ChevronDown,
    X
} from 'lucide-react';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { BookNowQuickModal } from '@/components/booking/BookNowQuickModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthProvider';

interface EnterpriseHeaderProps {
    currentOfficeName?: string;
    floorTitle?: string;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({
    currentOfficeName = 'London, UK (HQ)',
    floorTitle
}) => {
    const { user, isAuthenticated } = useAuth();
    const [bookNowOpen, setBookNowOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
            {/* Left Location / Title Context */}
            <div className="flex items-center gap-3 min-w-0">
                {floorTitle ? (
                    <div className="flex items-center gap-2">
                        <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                            Floor Plan
                        </h1>
                        <span className="text-slate-400 dark:text-slate-600 font-bold">·</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {floorTitle}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-3 py-1.5 rounded-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Current Location:
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">
                                {currentOfficeName}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Middle: Global Universal Search (Figure 1 & 2 search bar) */}
            <div className="flex-1 max-w-xl mx-4">
                <UniversalSearch />
            </div>

            {/* Right: Quick Booker, Notifications & User */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Book Now Button */}
                <Button
                    onClick={() => setBookNowOpen(true)}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Quick Book</span>
                </Button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="View notifications"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">Notifications</span>
                                <Badge variant="secondary" className="text-[10px]">2 New</Badge>
                            </div>
                            <div className="py-3 space-y-2.5">
                                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
                                    <p className="font-bold text-blue-900 dark:text-blue-200">Upcoming Desk Booking</p>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                        Desk B5 at London HQ starts in 45 minutes.
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 text-xs">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Calendar Synchronisation Active</p>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                        Desk reservations marked as &apos;Free&apos; on Outlook.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar Chip */}
                {isAuthenticated && user && (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                            {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : user.email.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="hidden md:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                        </span>
                    </div>
                )}
            </div>

            <BookNowQuickModal isOpen={bookNowOpen} onClose={() => setBookNowOpen(false)} />
        </header>
    );
};
