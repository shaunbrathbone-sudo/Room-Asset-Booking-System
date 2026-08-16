"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { MapPin, Building2, Users, Layers, ArrowRight } from "lucide-react";
import type { Office } from "@/types/spatial";

const CountryPage = () => {
    const router = useRouter();
    const params = useParams();
    const countrySlug = params.countrySlug as string;

    const { data: offices = [], isLoading } = useQuery<Office[]>({
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
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{countryName}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {offices.length} {offices.length === 1 ? "Office" : "Offices"} available
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offices.map((office) => (
                    <button
                        key={office.id}
                        onClick={() => router.push(`/explore/${countrySlug}/${office.slug}`)}
                        className="group text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10"
                    >
                        {/* Hero image placeholder */}
                        <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                        </div>

                        <div className="p-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {office.name}
                            </h2>

                            <div className="flex items-start gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{office.addressLine1}, {office.city}, {office.postcode}</span>
                            </div>

                            {/* Tenant badges */}
                            {office.tenants && office.tenants.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {office.tenants.map((t) => (
                                        <span
                                            key={t.id}
                                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                        >
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                    <Layers className="w-4 h-4" />
                                    <span>{office.floorCount} {office.floorCount === 1 ? "Floor" : "Floors"}</span>
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                                    Explore <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CountryPage;