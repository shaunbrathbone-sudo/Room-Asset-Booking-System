"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { GlobeScene } from "@/components/three/GlobeScene";
import { Globe2, Building2, Monitor, ArrowRight, Sparkles, Navigation2, Crosshair } from "lucide-react";
import type { Country } from "@/types/spatial";

const ExplorePage = () => {
    const router = useRouter();
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const { data: countries = [], isLoading } = useQuery<any[]>({
        queryKey: ["countries"],
        queryFn: async () => {
            const { data } = await api.get("/countries");
            return data;
        },
    });

    const handleCountrySelect = (country: Country) => {
        router.push(`/explore/${country.slug}`);
    };

    const handleCenterUserLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                },
                undefined,
                { enableHighAccuracy: true }
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading 3D Spatial Canvas...</p>
                </div>
            </div>
        );
    }

    const totalOffices = countries.reduce((sum, c) => sum + (c.officeCount ?? c.totalOffices ?? (c.offices ? c.offices.length : 0)), 0);
    const totalDesks = countries.reduce((sum, c) => sum + (c.totalDesks ?? 0), 0);
    const availableDesks = countries.reduce((sum, c) => sum + (c.availableDesks ?? 0), 0);

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Top Left Stats Overlay Card */}
            <div className="absolute top-6 left-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xl max-w-sm">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Global Workspace Portfolio
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Global 3D Explorer
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Navigate our global offices with live real-time workstation availability.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
                        <div className="text-lg font-black text-slate-900 dark:text-white">{countries.length}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Countries</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60">
                        <div className="text-lg font-black text-slate-900 dark:text-white">{totalOffices}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Offices</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{availableDesks}</div>
                        <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Available</div>
                    </div>
                </div>
            </div>

            {/* Quick Regional Jumper (Top Right) */}
            <div className="absolute top-6 right-6 z-10 hidden sm:flex flex-col gap-2">
                {countries.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => handleCountrySelect(c)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-400 shadow-lg text-left transition-all hover:scale-105 group"
                    >
                        <span className="text-xl">🇬🇧</span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                                {c.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {c.officeCount ?? c.totalOffices ?? 2} Offices • {c.availableDesks}/{c.totalDesks} Desks
                            </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 ml-2" />
                    </button>
                ))}
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
                <div className="bg-slate-900/90 dark:bg-slate-950/90 text-white backdrop-blur-xl rounded-full px-6 py-2.5 border border-white/20 shadow-2xl">
                    <p className="text-xs font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Rotate globe & click any office pin (Leicester Hub or London HQ)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCenterUserLocation}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-2xl border border-blue-400/50 hover:scale-105 transition-all"
                    title="Center globe to your current browser GPS location"
                >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Locate Me</span>
                </button>
            </div>

            {/* 3D WebGL Canvas */}
            <GlobeScene
                countries={countries}
                onCountrySelect={handleCountrySelect}
                userLocation={userLocation}
                onLocationFound={setUserLocation}
            />
        </div>
    );
};

export default ExplorePage;