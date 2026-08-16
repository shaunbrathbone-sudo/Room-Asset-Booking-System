'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BuildingStack } from '@/components/three/BuildingStack';
import { api } from '@/lib/api';
import { 
    Building, MapPin, Clock, ArrowLeft, 
    Layers, BookOpen, Navigation, ThermometerSun, X 
} from 'lucide-react';
import { OfficeCommuteGuide } from '@/components/spatial/OfficeCommuteGuide';
import { OfficeWeatherForecast } from '@/components/spatial/OfficeWeatherForecast';
import type { Office, Floor } from '@/types/spatial';

const OfficeStackPage = () => {
    const params = useParams();
    const router = useRouter();
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const [activeModal, setActiveModal] = useState<'commute' | 'weather' | null>(null);

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

    const officeLat = office.latitude || (officeSlug.includes('india') ? 28.6280 : officeSlug.includes('london') ? 51.5235 : 52.6339);
    const officeLng = office.longitude || (officeSlug.includes('india') ? 77.3649 : officeSlug.includes('london') ? -0.1054 : -1.1360);
    const officeCity = office.city || (officeSlug.includes('india') ? 'Noida Sector 62' : officeSlug.includes('london') ? 'London Clerkenwell' : 'Leicester');
    const fullAddress = `${office.addressLine1 || ''}, ${office.city || ''}, ${office.postcode || ''}`;

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

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xl space-y-4">
                    <div>
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

                        <div className="space-y-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                    </div>

                    {/* Quick Access Action Bar: Commute, Weather & Full Guide */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveModal('commute')}
                            className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800/60 transition-all shadow-sm"
                        >
                            <Navigation className="w-3.5 h-3.5" /> Commute Guide
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('weather')}
                            className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800/60 transition-all shadow-sm"
                        >
                            <ThermometerSun className="w-3.5 h-3.5 text-amber-500" /> 3-Day Weather
                        </button>
                    </div>

                    {/* Prominent Office Induction & Welcome Guide CTA */}
                    <div>
                        <Link
                            href={`/explore/${countrySlug}/${officeSlug}/guide`}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-blue-500/20 group transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cyan-300" />
                                <span>Complete Welcome Guide</span>
                            </span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono group-hover:translate-x-0.5 transition-transform">
                                View →
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
                            className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200/60 dark:border-slate-700 transition-all flex items-center justify-between group shadow-sm"
                        >
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 block">
                                    {floor.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    Level {floor.floorNumber}
                                </span>
                            </div>
                            <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                Enter →
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D Interactive Building Stack */}
            <BuildingStack
                floors={floors}
                officeName={office.name}
                onFloorSelect={handleFloorSelect}
            />

            {/* Interactive Commute Modal / Drawer */}
            {activeModal === 'commute' && (
                <div 
                    role="dialog" 
                    aria-modal="true" 
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
                >
                    <div className="relative w-full max-w-3xl my-auto">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 shadow-xl"
                            aria-label="Close commute guide"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <OfficeCommuteGuide
                            officeSlug={officeSlug}
                            officeName={office.name}
                            address={fullAddress}
                        />
                    </div>
                </div>
            )}

            {/* Interactive Weather Modal / Drawer */}
            {activeModal === 'weather' && (
                <div 
                    role="dialog" 
                    aria-modal="true" 
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
                >
                    <div className="relative w-full max-w-xl my-auto">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 shadow-xl"
                            aria-label="Close weather forecast"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <OfficeWeatherForecast
                            latitude={officeLat}
                            longitude={officeLng}
                            cityName={officeCity}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeStackPage;