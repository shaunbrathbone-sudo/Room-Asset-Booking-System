'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
    Building2, Users, Layers, Shield, Sparkles, Plus, 
    ArrowRight, MapPin, Monitor, Coffee, BarChart3, CheckSquare 
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminDashboardPage() {
    const router = useRouter();

    const { data: countries, isLoading } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const { data } = await api.get('/countries');
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const allOffices: any[] = [];
    countries?.forEach((c: any) => {
        if (Array.isArray(c.offices)) {
            allOffices.push(...c.offices);
        }
    });

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                            <Shield className="w-3.5 h-3.5" /> Facilities & Estate Administration
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Enterprise Workplace Management
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Onboard new office hubs, configure interactive floor plans & photo hotspots, and manage approvals.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/offices/new')}
                            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4" /> Onboard New Workplace (Wizard)
                        </button>
                    </div>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => router.push('/admin/analytics')}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-left hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Occupancy & ESG Analytics</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Desk utilisation, peak hours & hybrid attendance trends.</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/approvals')}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-left hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Meeting Room Approvals</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review pending executive boardroom & VIP suite requests.</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/offices/new')}
                        className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 text-left transition-all hover:scale-[1.02] group"
                    >
                        <div className="p-3 rounded-2xl bg-white/20 text-white w-fit mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black text-white">Hub Onboarding Wizard</h3>
                        <p className="text-xs text-blue-100 mt-1">5-step provisioning for building stacks, desks & amenities.</p>
                    </button>
                </div>

                {/* Active Offices & Visual Floor Organisers */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" /> Active Workplace Hubs & Visual Organisers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allOffices.map((office) => (
                            <div
                                key={office.id}
                                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">
                                            {office.countryName || 'United Kingdom'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                            {office.totalDesks ?? 12} Desks
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        {office.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                                        <span>{office.address}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => router.push(`/admin/offices/${office.slug}/floor-editor`)}
                                        className="py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Monitor className="w-4 h-4" /> Floor & Hotspots Editor
                                    </button>
                                    <button
                                        onClick={() => router.push(`/admin/offices/${office.slug}/guide`)}
                                        className="py-3 px-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Sparkles className="w-4 h-4" /> Edit Welcome Guide
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}