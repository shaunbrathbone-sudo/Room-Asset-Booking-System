"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { MapPin, Building2, Users, Layers, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import type { Office } from "@/types/spatial";

const CountryPage = () => {
    const router = useRouter();
    const params = useParams();
    const countrySlug = params.countrySlug as string;

    const { data: offices = [], isLoading } = useQuery<any[]>({
        queryKey: ["offices", countrySlug],
        queryFn: async () => {
            const { data } = await api.get(`/countries/${countrySlug}/offices`);
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const countryName = countrySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                        <span>🇬🇧 Global Workspace Portfolio</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{countryName} Locations</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select a workplace hub to explore 3D exploded floor plans, live desk availability, and office induction guides.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Total Hubs</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{offices.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {offices.map((office) => (
                    <div
                        key={office.id}
                        className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-500/80 dark:hover:border-blue-500/80 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col"
                    >
                        {/* Office Image Banner */}
                        <div className="h-56 relative overflow-hidden bg-slate-900">
                            <img
                                src={office.imageUrl || office.photoUrl || (office.slug === 'leicester-hub' ? '/images/offices/leicester-hub.jpg' : 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200')}
                                alt={office.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            
                            {/* Live Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-lg shadow-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    {office.availableDesks || office.totalDesks || 28} Desks Open
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4">
                                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                    {office.slug === 'london-hq' ? 'Creative & Innovation Lab' : 'Headquarters & Engineering'}
                                </span>
                                <h2 className="text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                                    {office.name}
                                </h2>
                            </div>
                        </div>

                        {/* Office Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <span>{office.address || `${office.addressLine1 || ''}, ${office.city || ''} ${office.postcode || ''}`}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Floors</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
                                            <Layers className="w-3.5 h-3.5 text-blue-500" />
                                            {office.floorsCount || office.floorCount || 2}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Total Desks</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                                            {office.totalDesks || 31}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                                        <span className="block text-[10px] uppercase font-bold text-slate-400">Meeting Rooms</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                                            {office.totalMeetingRooms || 2}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => router.push(`/explore/${countrySlug}/${office.slug}/guide`)}
                                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <span>Welcome Guide</span>
                                </button>

                                <button
                                    onClick={() => router.push(`/explore/${countrySlug}/${office.slug}`)}
                                    className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 group-hover:gap-2.5"
                                >
                                    <span>3D Floor Stack</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountryPage;