'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, Calendar, ShieldCheck, Car, Clock, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const AnalyticsPage = () => {
    const { user } = useAuth();

    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const { data } = await api.get('/countries');
            return data;
        },
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: async () => {
            const { data } = await api.get('/assets');
            return data;
        },
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['allBookings'],
        queryFn: async () => {
            const { data } = await api.get('/bookings/my');
            return data;
        },
    });

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <BarChart3 className="w-8 h-8 text-blue-600" /> Space Utilization & Workplace Analytics
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Live telemetry on office occupancy, department desk ratios, fleet vehicle turnover, and ghost booking recovery.
                </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider">Overall Occupancy</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">74.2%</div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold flex items-center gap-1">
                        +5.8% vs last week • High efficiency
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider">Active Workstations</span>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">31 Desks</div>
                    <p className="text-xs text-slate-500 mt-1">23 Permanent • 8 Hot/Flex Bookable</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider">Ghost Booking Saved</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">18.5 Hrs</div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                        Auto-released via 15m grace rule
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider">Fleet Vehicle Utilization</span>
                        <Car className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">82%</div>
                    <p className="text-xs text-slate-500 mt-1">Tesla Model 3 • Skoda Octavia</p>
                </div>
            </div>

            {/* Department Breakdown & Floor Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Department Workstation Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Workstation Allocation by Zone</h2>
                    <p className="text-xs text-slate-500 mb-6">Leicester Hub (17 Friar Lane)</p>

                    <div className="space-y-4">
                        {[
                            { name: 'Ground Floor: Development Team (Cloudfy)', desks: 9, type: 'Permanent', percent: 100, color: 'bg-blue-600' },
                            { name: 'First Floor: Projects & Support', desks: 8, type: 'Permanent', percent: 100, color: 'bg-indigo-600' },
                            { name: 'First Floor: Flexible Office (Williams)', desks: 5, type: 'Bookable Flex', percent: 60, color: 'bg-green-600' },
                            { name: 'First Floor: Hot Desks', desks: 3, type: 'Bookable Hot', percent: 66, color: 'bg-teal-600' },
                            { name: 'First Floor: Senior Leadership', desks: 2, type: 'Permanent', percent: 100, color: 'bg-purple-600' },
                        ].map((zone, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{zone.name}</span>
                                    <span className="text-slate-500">{zone.desks} Desks ({zone.type})</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${zone.color}`}
                                        style={{ width: `${zone.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meeting Room Utilization & Turnover */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Meeting Room Utilization</h2>
                    <p className="text-xs text-slate-500 mb-6">Average hours booked per working day</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Executive Boardroom</h3>
                            <p className="text-xs text-slate-500 mb-2">Ground Floor • 10 Seats</p>
                            <div className="text-2xl font-black text-blue-600">5.8 hrs/day</div>
                            <span className="text-[10px] uppercase font-bold text-amber-600">Approval Gated</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Asgard Meeting Room</h3>
                            <p className="text-xs text-slate-500 mb-2">First Floor • 6 Seats</p>
                            <div className="text-2xl font-black text-green-600">4.2 hrs/day</div>
                            <span className="text-[10px] uppercase font-bold text-green-600">Instant Booking</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                        <div>
                            <p className="font-bold">Wall-Mounted Tablet Kiosks Active</p>
                            <p className="text-[11px] opacity-80">Connected over PoE with 1-touch ad-hoc booking</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;