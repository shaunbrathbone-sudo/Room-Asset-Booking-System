'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Layers, Monitor, Coffee, ArrowLeft, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { DeskLayoutCanvas } from '@/components/admin/DeskLayoutCanvas';
import { FacilityHotspotsEditor } from '@/components/admin/FacilityHotspotsEditor';

export default function FloorEditorPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [activeFloorIdx, setActiveFloorIdx] = useState(0);
    const [activeTab, setActiveTab] = useState<'desks' | 'facilities'>('desks');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['adminFloorEditor', slug],
        queryFn: async () => {
            const { data } = await api.get(`/admin/offices/${slug}/floor-editor`);
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

    const office = data?.office;
    const currentFloor = data?.floors?.[activeFloorIdx];

    return (
        <AdminGuard>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Admin Hub
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Floor & Facility Organiser — {office?.name}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Place workstations, bind system IDs, and manage on-site facility photo hotspots.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push(`/explore/united-kingdom/${slug}/${currentFloor?.slug || 'ground-floor'}`)}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                        >
                            <Eye className="w-4 h-4" /> Preview Live View
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {data?.floors?.map((f: any, idx: number) => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFloorIdx(idx)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeFloorIdx === idx
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>{f.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                                    {f.desks?.length || 0} Desks
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('desks')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeTab === 'desks'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Monitor className="w-4 h-4" /> Workstations & Desks
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('facilities')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                                activeTab === 'facilities'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Coffee className="w-4 h-4" /> Facility Photo Hotspots
                        </button>
                    </div>
                </div>

                {activeTab === 'desks' ? (
                    <DeskLayoutCanvas floor={currentFloor} onSaved={refetch} />
                ) : (
                    <FacilityHotspotsEditor floor={currentFloor} onSaved={refetch} />
                )}
            </div>
        </AdminGuard>
    );
}