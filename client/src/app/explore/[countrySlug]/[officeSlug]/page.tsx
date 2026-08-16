"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { BuildingStack } from "@/components/three/BuildingStack";
import type { Floor } from "@/types/spatial";

const OfficePage = () => {
    const router = useRouter();
    const params = useParams();
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const { data: floors = [], isLoading } = useQuery<Floor[]>({
        queryKey: ["floors", officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}/floors`);
            return data;
        },
    });

    const handleFloorSelect = (floor: Floor) => {
        router.push(`/explore/${countrySlug}/${officeSlug}/${floor.slug}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const officeName = officeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="relative h-[calc(100vh-4rem)]">
            {/* Info overlay */}
            <div className="absolute top-6 left-6 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-slate-700/50">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{officeName}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {floors.length} {floors.length === 1 ? "Floor" : "Floors"} • Hover to explode • Click to enter
                </p>
            </div>

            {/* Floor legend */}
            <div className="absolute top-6 right-6 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-slate-700/50 space-y-2">
                {floors.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-3 h-3 rounded-full ${
                            (f.occupancyPercent ?? 0) > 80 ? 'bg-red-500' :
                            (f.occupancyPercent ?? 0) > 50 ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <span className="text-slate-700 dark:text-slate-300">{f.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">{f.occupancyPercent ?? 0}%</span>
                    </div>
                ))}
            </div>

            <BuildingStack
                floors={floors}
                officeName={officeName}
                onFloorSelect={handleFloorSelect}
            />
        </div>
    );
};

export default OfficePage;