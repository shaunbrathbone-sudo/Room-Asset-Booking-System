'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
    Building2, Users, Layers, Shield, Sparkles, Plus, 
    ArrowRight, MapPin, Monitor, Coffee, BarChart3, CheckSquare, Mail 
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
                            Onboard new office hubs, configure interactive floor plans & photo hotspots, and customize automated email notifications.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => router.push('/admin/analytics')}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-left hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Occupancy & ESG Analytics</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Desk utilisation, peak hours & hybrid attendance.</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/approvals')}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-left hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Room Approvals</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review pending executive boardroom & VIP suite requests.</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/email-templates')}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-left hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Email & Alerts Studio</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confirmation receipts, 24h reminders & 15m room alerts.</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/offices/new')}
                        className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 text-left transition-all hover:scale-[1.02] group"
                    >
                        <div className="p-3 rounded-2xl bg-white/20 text-white w-fit mb-3 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black text-white">Hub Onboarding Wizard</h3>
                        <p className="text-xs text-blue-100 mt-1">5-step provisioning for building stacks, desks & amenities.</p>
                    </button>
                </div>

                {/* Active Offices & Visual Floor Organisers */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" /> Active Workplace Hubs & Visual Organisers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            {office.totalDesks ?? 24} Desks
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                            {office.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            <span className="truncate">{office.city || office.addressLine1}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => router.push(`/admin/offices/${office.slug}/floor-editor`)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-between transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Layers className="w-4 h-4" /> Visual Desk & Floor Organiser
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => router.push(`/admin/offices/${office.slug}/guide`)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Coffee className="w-4 h-4" /> Edit Welcome & Hotspots Guide
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5" />
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