'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Layers, Monitor, Coffee, ArrowLeft, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminOperationsStudio } from '@/components/admin/AdminOperationsStudio';
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
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                    <div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-1.5 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Admin Hub
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Global Offices Management: {office?.name}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Visual SVG floorplan mapper, workstation node plotting, and facilities governance.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setActiveTab('desks')}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                    activeTab === 'desks'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Monitor className="w-3.5 h-3.5" /> Operations Studio
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('facilities')}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                    activeTab === 'facilities'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Coffee className="w-3.5 h-3.5" /> Photo Hotspots
                            </button>
                        </div>

                        <button
                            onClick={() => router.push(`/explore/united-kingdom/${slug}/${currentFloor?.slug || 'ground-floor'}`)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                        >
                            <Eye className="w-4 h-4" /> Live Floor Plan
                        </button>
                    </div>
                </div>

                {activeTab === 'desks' ? (
                    <AdminOperationsStudio
                        office={office}
                        floors={data?.floors || []}
                        activeFloorIdx={activeFloorIdx}
                        onFloorSelect={(idx) => setActiveFloorIdx(idx)}
                        onSaveSuccess={refetch}
                    />
                ) : (
                    <FacilityHotspotsEditor floor={currentFloor} onSaved={refetch} />
                )}
            </div>
        </AdminGuard>
    );
}