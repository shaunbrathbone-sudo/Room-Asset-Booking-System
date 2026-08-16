"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Globe, Building2, Layers, Save, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import type { Office, Floor, UserPreferences } from "@/types/spatial";

interface PreferencesForm {
    homeOfficeId: string;
    homeFloorId: string;
    defaultView: "globe" | "office" | "floor";
}

const SettingsPage = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    const { data: prefs, isLoading: prefsLoading } = useQuery<UserPreferences>({
        queryKey: ["userPreferences"],
        queryFn: async () => {
            const { data } = await api.get("/users/preferences");
            return data;
        },
    });

    const { data: offices = [] } = useQuery<Office[]>({
        queryKey: ["allOffices"],
        queryFn: async () => {
            const { data } = await api.get("/countries/united-kingdom/offices");
            return data;
        },
    });

    const { register, handleSubmit, watch, reset } = useForm<PreferencesForm>();
    const selectedOfficeId = watch("homeOfficeId");

    const { data: floors = [] } = useQuery<Floor[]>({
        queryKey: ["officeFloors", selectedOfficeId],
        queryFn: async () => {
            const office = offices.find((o) => o.id === selectedOfficeId);
            if (!office) return [];
            const { data } = await api.get(`/offices/${office.slug}/floors`);
            return data;
        },
        enabled: !!selectedOfficeId,
    });

    useEffect(() => {
        if (prefs) {
            reset({
                homeOfficeId: prefs.homeOfficeId || "",
                homeFloorId: prefs.homeFloorId || "",
                defaultView: prefs.defaultView || "globe",
            });
        }
    }, [prefs, reset]);

    const mutation = useMutation({
        mutationFn: async (data: PreferencesForm) => {
            await api.put("/users/preferences", {
                homeOfficeId: data.homeOfficeId || null,
                homeFloorId: data.homeFloorId || null,
                defaultView: data.defaultView,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        },
    });

    const onSubmit = (data: PreferencesForm) => {
        mutation.mutate(data);
    };

    if (prefsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Workplace Preferences</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
                Configure your home office and landing preferences for faster daily booking.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Home Office */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Home Office</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Your primary working location</p>
                        </div>
                    </div>

                    <select
                        {...register("homeOfficeId")}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select an office...</option>
                        {offices.map((o) => (
                            <option key={o.id} value={o.id}>{o.name} — {o.city}</option>
                        ))}
                    </select>
                </div>

                {/* Home Floor */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Preferred Floor</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Your default floor within the building</p>
                        </div>
                    </div>

                    <select
                        {...register("homeFloorId")}
                        disabled={!selectedOfficeId}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <option value="">Select a floor...</option>
                        {floors.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {/* Default View / Smart Landing */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Smart Landing View</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Where you land after signing in</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: "globe", label: "3D Globe", desc: "Global portfolio overview" },
                            { value: "office", label: "Home Office", desc: "3D building stack" },
                            { value: "floor", label: "Home Floor", desc: "Direct to floor plan" },
                        ].map((opt) => (
                            <label
                                key={opt.value}
                                className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
                            >
                                <input
                                    type="radio"
                                    value={opt.value}
                                    {...register("defaultView")}
                                    className="sr-only"
                                />
                                <span className="font-semibold text-sm text-slate-900 dark:text-white">{opt.label}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save button */}
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    {saved ? (
                        <>
                            <Check className="w-4 h-4 text-green-300" /> Preferences Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Preferences
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SettingsPage;