"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { FloorPlan } from "@/components/three/FloorPlan";
import { ScheduleDrawer } from "@/components/booking/ScheduleDrawer";
import type { Floor, Desk, MeetingRoom } from "@/types/spatial";

const FloorPage = () => {
    const params = useParams();
    const floorSlug = params.floorSlug as string;

    const [selectedResource, setSelectedResource] = useState<Desk | MeetingRoom | null>(null);
    const [resourceType, setResourceType] = useState<"desk" | "meeting_room">("desk");
    const [drawerOpen, setDrawerOpen] = useState(false);

    // We need the floor ID — first fetch floors to resolve slug -> id
    const officeSlug = params.officeSlug as string;
    const { data: floors = [] } = useQuery<Floor[]>({
        queryKey: ["floors", officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}/floors`);
            return data;
        },
    });

    const floor = floors.find((f) => f.slug === floorSlug);

    const { data: floorPlan, isLoading } = useQuery<Floor>({
        queryKey: ["floorPlan", floor?.id],
        queryFn: async () => {
            const { data } = await api.get(`/floors/${floor!.id}`);
            return data;
        },
        enabled: !!floor?.id,
    });

    const handleDeskSelect = (desk: Desk) => {
        if (!desk.isBookable) return;
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
            <div className="absolute top-6 left-6 z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-slate-700/50">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{floorPlan.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Click a desk or room to view schedule
                </p>
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
        </div>
    );
};

export default FloorPage;