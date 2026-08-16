"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { GlobeScene } from "@/components/three/GlobeScene";
import type { Country } from "@/types/spatial";

const ExplorePage = () => {
    const router = useRouter();

    const { data: countries = [], isLoading } = useQuery<Country[]>({
        queryKey: ["countries"],
        queryFn: async () => {
            const { data } = await api.get("/countries");
            return data;
        },
    });

    const handleCountrySelect = (country: Country) => {
        router.push(`/explore/${country.slug}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">Loading globe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-4rem)]">
            {/* Stats overlay */}
            <div className="absolute top-6 left-6 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-slate-700/50">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Global Workspace</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {countries.length} {countries.length === 1 ? "Country" : "Countries"} •{" "}
                    {countries.reduce((sum, c) => sum + (c.officeCount ?? 0), 0)} Offices •{" "}
                    {countries.reduce((sum, c) => sum + (c.totalDesks ?? 0), 0)} Desks
                </p>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-full px-6 py-2.5 border border-white/20 dark:border-slate-700/50">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Click a location pin to explore offices
                </p>
            </div>

            <GlobeScene countries={countries} onCountrySelect={handleCountrySelect} />
        </div>
    );
};

export default ExplorePage;