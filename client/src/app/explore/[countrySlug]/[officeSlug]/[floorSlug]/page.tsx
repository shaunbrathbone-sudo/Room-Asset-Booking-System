"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Coffee, Eye, Sparkles, Settings2, Heart, Star, FileText, Map, Box, Layers } from "lucide-react";
import { useFavouriteDesks } from "@/hooks/useFavouriteDesks";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { FloorPlan } from "@/components/three/FloorPlan";
import { VectorFloorPlan } from "@/components/spatial/VectorFloorPlan";
import { ContextualBookingModal } from "@/components/booking/ContextualBookingModal";
import { ScheduleDrawer } from "@/components/booking/ScheduleDrawer";
import { FacilityHotspotModal, type FacilityArea } from "@/components/spatial/FacilityHotspotModal";
import { ArchitecturalBlueprintModal } from "@/components/spatial/ArchitecturalBlueprintModal";
import { Button } from "@/components/ui/button";
import type { Floor, Desk, MeetingRoom } from "@/types/spatial";

const FloorPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const floorSlug = params.floorSlug as string;
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const [selectedResource, setSelectedResource] = useState<Desk | MeetingRoom | null>(null);
    const [resourceType, setResourceType] = useState<"desk" | "meeting_room">("desk");
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<FacilityArea | null>(null);
    const [blueprintOpen, setBlueprintOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

    const isLocalOrTopAdmin = user?.role === 'super_admin' || user?.role === 'location_admin';
    const { favourites, isFavourite } = useFavouriteDesks();

    // Fetch floor data directly by slug (scoped to office)
    const { data: floorPlan, isLoading } = useQuery<any>({
        queryKey: ["floorPlan", officeSlug, floorSlug],
        queryFn: async () => {
            const { data } = await api.get(`/floors/${floorSlug}`, {
                params: { officeSlug },
            });
            return data;
        },
    });

    const handleDeskSelect = (desk: Desk) => {
        if (!desk.isBookable && (desk as any).is_bookable === 0) return;
        setSelectedResource(desk);
        setResourceType("desk");
        setBookingModalOpen(true);
    };

    const handleRoomSelect = (room: MeetingRoom) => {
        setSelectedResource(room);
        setResourceType("meeting_room");
        setBookingModalOpen(true);
    };

    const handleFloorChange = (newFloorSlug: string) => {
        router.push(`/explore/${countrySlug}/${officeSlug}/${newFloorSlug}`);
    };

    if (isLoading || !floorPlan) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* 2D Vector CAD / Blueprint View (Spec Figure 2 Default) */}
            {viewMode === "2d" ? (
                <VectorFloorPlan
                    floorPlan={floorPlan}
                    onDeskSelect={handleDeskSelect}
                    onRoomSelect={handleRoomSelect}
                    onFloorChange={handleFloorChange}
                    onSwitchTo3D={() => setViewMode("3d")}
                />
            ) : (
                /* 3D WebGL Isometric View */
                <div className="relative w-full h-full">
                    {/* View Switcher Overlay */}
                    <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode("2d")}
                            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md text-xs font-bold flex items-center gap-1.5"
                        >
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Switch to 2D Vector Plan</span>
                        </Button>
                    </div>

                    <FloorPlan
                        floor={floorPlan}
                        onDeskSelect={handleDeskSelect}
                        onRoomSelect={handleRoomSelect}
                    />
                </div>
            )}

            {/* Contextual Intelligence Booking Dialog (Figure 3) */}
            <ContextualBookingModal
                isOpen={bookingModalOpen}
                onClose={() => {
                    setBookingModalOpen(false);
                    setSelectedResource(null);
                }}
                resource={selectedResource}
                resourceType={resourceType}
                officeName={floorPlan.officeName || 'London HQ'}
                floorName={floorPlan.name}
            />

            {/* Fallback detailed Schedule Drawer */}
            <ScheduleDrawer
                resource={selectedResource}
                resourceType={resourceType}
                isOpen={scheduleDrawerOpen}
                onClose={() => {
                    setScheduleDrawerOpen(false);
                    setSelectedResource(null);
                }}
            />

            {/* Facility Hotspot Modal */}
            <FacilityHotspotModal
                facility={selectedFacility}
                isOpen={!!selectedFacility}
                onClose={() => setSelectedFacility(null)}
            />

            {/* Architectural Blueprint & 3D Cutaway Modal */}
            <ArchitecturalBlueprintModal
                isOpen={blueprintOpen}
                onClose={() => setBlueprintOpen(false)}
                floorName={floorPlan.name}
                officeName={floorPlan.officeName || 'Leicester Hub'}
                imageUrl={
                    floorPlan.planImageUrl || 
                    (floorSlug.includes('ground') ? '/images/floors/leicester-ground-floor.jpg' : '/images/floors/leicester-first-floor.jpg')
                }
                render3dUrl={
                    floorSlug.includes('ground') 
                        ? '/images/floors/leicester-ground-floor-3d.jpg' 
                        : '/images/floors/leicester-first-floor-3d.jpg'
                }
            />
        </div>
    );
};

export default FloorPage;