"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Coffee, Eye, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { FloorPlan } from "@/components/three/FloorPlan";
import { ScheduleDrawer } from "@/components/booking/ScheduleDrawer";
import { FacilityHotspotModal, type FacilityArea } from "@/components/spatial/FacilityHotspotModal";
import type { Floor, Desk, MeetingRoom } from "@/types/spatial";

const FloorPage = () => {
    const params = useParams();
    const router = useRouter();
    const floorSlug = params.floorSlug as string;
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const [selectedResource, setSelectedResource] = useState<Desk | MeetingRoom | null>(null);
    const [resourceType, setResourceType] = useState<"desk" | "meeting_room">("desk");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<FacilityArea | null>(null);

    // Fetch floor data directly by slug
    const { data: floorPlan, isLoading } = useQuery<any>({
        queryKey: ["floorPlan", floorSlug],
        queryFn: async () => {
            const { data } = await api.get(`/floors/${floorSlug}`);
            return data;
        },
    });

    const handleDeskSelect = (desk: Desk) => {
        if (!desk.isBookable && (desk as any).is_bookable === 0) return;
        setSelectedResource(desk);
        setResourceType("desk");
        setDrawerOpen(true);
    };

    const handleRoomSelect = (room: MeetingRoom) => {
        setSelectedResource(room);
        setResourceType("meeting_room");
        setDrawerOpen(true);
    };

    if (isLoading || !floorPlan) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-4rem)]">
            {/* Floor info overlay */}
            <div className="absolute top-6 left-6 z-10 bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-slate-700/50 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        {floorPlan.officeName || 'Workplace'}
                    </span>
                    <button
                        onClick={() => router.push(`/explore/${countrySlug}/${officeSlug}/guide`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                    >
                        <Sparkles className="w-3 h-3" /> Guide
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{floorPlan.name}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    Click a desk or room to book • Or explore on-site facilities below
                </p>

                {/* On-Site Facility Buttons with Hotspot Launchers */}
                {floorPlan.facilities && floorPlan.facilities.length > 0 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                        {floorPlan.facilities.map((fac: FacilityArea) => (
                            <button
                                key={fac.id}
                                onClick={() => setSelectedFacility(fac)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 text-white border border-amber-400/60 hover:border-amber-300 text-xs font-bold transition-all shadow-md hover:scale-105"
                            >
                                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                                <span>{fac.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 text-amber-300">
                                    {fac.hotspots?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="absolute top-6 right-6 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-slate-700/50 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500" /> <span className="text-slate-300">Available</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-amber-500" /> <span className="text-slate-300">Partially Booked</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> <span className="text-slate-300">Occupied</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-gray-500" /> <span className="text-slate-300">Permanent / Out of Service</span>
                </div>
            </div>

            <FloorPlan
                floor={floorPlan}
                onDeskSelect={handleDeskSelect}
                onRoomSelect={handleRoomSelect}
            />

            <ScheduleDrawer
                resource={selectedResource}
                resourceType={resourceType}
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedResource(null); }}
            />

            <FacilityHotspotModal
                facility={selectedFacility}
                isOpen={!!selectedFacility}
                onClose={() => setSelectedFacility(null)}
            />
        </div>
    );
};

export default FloorPage;