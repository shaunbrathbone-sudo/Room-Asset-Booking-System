'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BuildingStack } from '@/components/three/BuildingStack';
import { api } from '@/lib/api';
import { Building, MapPin, Clock, ArrowLeft, Layers, BookOpen } from 'lucide-react';
import type { Office, Floor } from '@/types/spatial';

const OfficeStackPage = () => {
    const params = useParams();
    const router = useRouter();
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const { data: office, isLoading: officeLoading } = useQuery<Office>({
        queryKey: ['office', officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}`);
            return data;
        },
    });

    const { data: floors = [], isLoading: floorsLoading } = useQuery<Floor[]>({
        queryKey: ['floors', officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}/floors`);
            return data;
        },
    });

    const handleFloorSelect = (floor: Floor) => {
        router.push(`/explore/${countrySlug}/${officeSlug}/${floor.slug}`);
    };

    if (officeLoading || floorsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!office) {
        return (
            <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold">Office Not Found</h1>
                <p className="text-slate-500 mt-2">The requested office location does not exist.</p>
                <Link
                    href={`/explore/${countrySlug}`}
                    className="inline-block mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                    Back to Gallery
                </Link>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Top Navigation & Info Overlay */}
            <div className="absolute top-6 left-6 z-10 max-w-md">
                <Link
                    href={`/explore/${countrySlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 mb-4 shadow-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Office Gallery
                </Link>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xl">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {office.tenants?.map((t) => (
                            <span
                                key={t.id}
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                                {t.name}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {office.name}
                    </h1>

                    <div className="space-y-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span>{office.addressLine1}, {office.city}, {office.postcode}</span>
                        </div>
                        {office.operationalHours && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span>{office.operationalHours}</span>
                            </div>
                        )}
                    </div>

                    {/* Prominent Office Induction & Welcome Guide CTA */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={`/explore/${countrySlug}/${officeSlug}/guide`}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-blue-500/20 group transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cyan-300" />
                                <span>17 Friar Lane Welcome Guide</span>
                            </span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono group-hover:translate-x-0.5 transition-transform">
                                Read Info →
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floor Selector Card (Top Right) */}
            <div className="absolute top-6 right-6 z-10 max-w-xs w-full hidden sm:block">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xl space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" /> Select Floor Level
                    </h2>
                    {floors.map((floor) => (
                        <button
                            key={floor.id}
                            onClick={() => handleFloorSelect(floor)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200/60 dark:border-slate-700/60 transition-all text-left group"
                        >
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {floor.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {floor.occupancyPercent}% Occupied
                                </p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                Enter →
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Interaction Hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 dark:bg-slate-950/90 text-white backdrop-blur-xl rounded-full px-6 py-2.5 border border-white/20 shadow-2xl">
                <p className="text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Hover floors to explode building stack • Click floor to view 2.5D desks
                </p>
            </div>

            {/* 3D Exploded Building Stack Canvas */}
            <BuildingStack
                officeName={office.name}
                floors={floors}
                onFloorSelect={handleFloorSelect}
            />
        </div>
    );
};

export default OfficeStackPage;