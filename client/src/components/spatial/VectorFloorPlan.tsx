'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Monitor,
    Sparkles,
    CheckCircle2,
    XCircle,
    UserCheck,
    Layers,
    Eye,
    SlidersHorizontal,
    Box,
    Maximize2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Desk, MeetingRoom, Floor, Zone } from '@/types/spatial';

interface VectorFloorPlanProps {
    floorPlan: {
        id: string;
        name: string;
        slug: string;
        officeName?: string;
        officeSlug?: string;
        planImageUrl?: string | null;
        zones?: Zone[];
        allFloors?: Floor[];
    };
    onDeskSelect: (desk: Desk) => void;
    onRoomSelect?: (room: MeetingRoom) => void;
    onFloorChange?: (floorSlug: string) => void;
    onSwitchTo3D?: () => void;
}

export const VectorFloorPlan: React.FC<VectorFloorPlanProps> = ({
    floorPlan,
    onDeskSelect,
    onRoomSelect,
    onFloorChange,
    onSwitchTo3D
}) => {
    const [zoom, setZoom] = useState(1);
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');
    const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Collect all desks across all zones on this floor
    const allDesks = useMemo(() => {
        const desks: Desk[] = [];
        floorPlan.zones?.forEach((z) => {
            if (z.desks) {
                z.desks.forEach((d) => {
                    // Attach zone name if not present
                    desks.push({ ...d, zoneId: z.name || d.zoneId });
                });
            }
        });
        return desks;
    }, [floorPlan]);

    // Summary counts
    const totalDesks = allDesks.length;
    const availableCount = allDesks.filter((d) => d.status === 'available').length;
    const bookedCount = allDesks.filter((d) => d.status === 'occupied').length;

    // Filtered desks
    const visibleDesks = useMemo(() => {
        if (filterStatus === 'available') return allDesks.filter((d) => d.status === 'available');
        if (filterStatus === 'occupied') return allDesks.filter((d) => d.status === 'occupied');
        return allDesks;
    }, [allDesks, filterStatus]);

    // Handle desk mouse hover
    const handleMouseEnter = (desk: Desk, e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setHoveredDesk(desk);
        setHoverPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseLeave = () => {
        setHoveredDesk(null);
        setHoverPos(null);
    };

    // Zoom handlers
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.2));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.7));
    const handleResetZoom = () => setZoom(1);

    // Architectural blueprint backdrop fallback
    const isLeicesterGround = floorPlan.slug === 'ground-floor';
    const isLeicesterFirst = floorPlan.slug === 'first-floor';
    const blueprintUrl = isLeicesterGround
        ? '/images/blueprint/leicester-ground-floor-blueprint.png'
        : isLeicesterFirst
        ? '/images/blueprint/leicester-first-floor-blueprint.png'
        : floorPlan.planImageUrl || null;

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
            {/* Top Toolbar (Figure 2 Style) */}
            <div className="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-20 transition-colors">
                {/* Floor Level Switcher Pills */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline-block">
                        Level:
                    </span>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {floorPlan.allFloors && floorPlan.allFloors.length > 0 ? (
                            floorPlan.allFloors.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => onFloorChange?.(f.slug)}
                                    className={cn(
                                        'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                                        floorPlan.slug === f.slug
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    )}
                                >
                                    {f.name.replace('Floor', '').trim() || `L${f.floorNumber}`}
                                </button>
                            ))
                        ) : (
                            <>
                                <button
                                    onClick={() => onFloorChange?.('ground-floor')}
                                    className={cn(
                                        'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                                        floorPlan.slug === 'ground-floor'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    )}
                                >
                                    Ground
                                </button>
                                <button
                                    onClick={() => onFloorChange?.('first-floor')}
                                    className={cn(
                                        'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                                        floorPlan.slug === 'first-floor'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    )}
                                >
                                    Level 1
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Center / Right: Zoom & Status Filters */}
                <div className="flex items-center gap-3">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={handleZoomOut}
                            title="Zoom out"
                            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-mono font-bold px-1 text-slate-600 dark:text-slate-300">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            title="Zoom in"
                            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            title="Reset zoom"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Filter:
                        </span>
                        <button
                            onClick={() => setFilterStatus(filterStatus === 'available' ? 'all' : 'available')}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border',
                                filterStatus === 'available'
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            )}
                        >
                            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
                            <span>Available ({availableCount})</span>
                        </button>

                        <button
                            onClick={() => setFilterStatus(filterStatus === 'occupied' ? 'all' : 'occupied')}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border',
                                filterStatus === 'occupied'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                            )}
                        >
                            <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" />
                            <span>Booked ({bookedCount})</span>
                        </button>
                    </div>

                    {/* 3D Isometric View Switcher Button */}
                    {onSwitchTo3D && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSwitchTo3D}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                            <Box className="w-3.5 h-3.5" />
                            <span>3D View</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Interactive Canvas Stage */}
            <div
                ref={containerRef}
                className="relative flex-1 w-full overflow-auto flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/60"
            >
                {/* Scaled Container */}
                <div
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease-out'
                    }}
                    className="relative w-[1000px] h-[650px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex items-center justify-center overflow-hidden"
                >
                    {/* Blueprint Background Rendering */}
                    {blueprintUrl ? (
                        <div className="absolute inset-4 rounded-2xl overflow-hidden opacity-85 dark:opacity-40 pointer-events-none">
                            <Image
                                src={blueprintUrl}
                                alt="Architectural Floor Plan CAD Blueprint"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    ) : (
                        /* Architectural Grid Overlay */
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                    )}

                    {/* Architectural Room Dividers & Zones Overlay */}
                    <div className="absolute inset-6 pointer-events-none border-2 border-dashed border-slate-300 dark:border-slate-700/60 rounded-2xl">
                        <div className="absolute top-3 left-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                            {floorPlan.name} · Architectural Vector Grid
                        </div>
                    </div>

                    {/* Plotted Interactive Desk Nodes (Figure 2 Style) */}
                    <div className="absolute inset-8">
                        {visibleDesks.map((desk, idx) => {
                            const isAvailable = desk.status === 'available';
                            const isOccupied = desk.status === 'occupied';

                            // Normalize desk coordinates to percentage if needed
                            // In spacebook.db, coordinates range roughly x: -40..40, y: -25..25
                            // Map them to 5%..95% of container
                            const normX = ((desk.x + 35) / 70) * 88 + 6;
                            const normY = ((desk.y + 25) / 50) * 82 + 9;

                            const deskLabel = desk.label || desk.code || `D-${idx + 1}`;

                            return (
                                <button
                                    key={desk.id}
                                    type="button"
                                    onClick={() => onDeskSelect(desk)}
                                    onMouseEnter={(e) => handleMouseEnter(desk, e)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{
                                        left: `${Math.max(5, Math.min(normX, 92))}%`,
                                        top: `${Math.max(6, Math.min(normY, 90))}%`,
                                    }}
                                    className={cn(
                                        'absolute -translate-x-1/2 -translate-y-1/2 w-14 h-9 rounded-lg font-mono font-bold text-[11px] flex items-center justify-center transition-all duration-150 shadow-md cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                                        isAvailable
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-600/60 hover:scale-110 hover:shadow-emerald-500/30'
                                            : 'bg-rose-500 hover:bg-rose-400 text-white border-rose-600/60 hover:scale-105'
                                    )}
                                    aria-label={`Desk ${deskLabel}, status: ${desk.status}`}
                                >
                                    <span className="truncate px-1">{deskLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Rich Hover Desk Card (Figure 2 Specification Flyout) */}
                {hoveredDesk && hoverPos && (
                    <div
                        style={{
                            left: `${hoverPos.x + 20}px`,
                            top: `${Math.max(10, hoverPos.y - 120)}px`,
                        }}
                        className="absolute z-50 pointer-events-auto w-72 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-4 text-white animate-in fade-in zoom-in-95 duration-100"
                    >
                        {/* Title Bar */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm tracking-tight">
                                    Desk {hoveredDesk.label || hoveredDesk.code}
                                </span>
                                <span
                                    className={cn(
                                        'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                                        hoveredDesk.status === 'available'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    )}
                                >
                                    {hoveredDesk.status === 'available' ? 'Available' : 'Booked'}
                                </span>
                            </div>
                        </div>

                        {/* Specs List */}
                        <div className="py-2.5 space-y-1.5 text-xs">
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400">Monitor:</span>
                                <span className="font-semibold text-slate-200 text-right">Dual 4K Screens (27&quot;)</span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400">Desk:</span>
                                <span className="font-semibold text-slate-200 text-right">
                                    Electric Sit/Stand Desk
                                </span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400">Connectivity:</span>
                                <span className="font-semibold text-slate-200 text-right">
                                    USB-C 90W PD, Gigabit LAN
                                </span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400">Location:</span>
                                <span className="font-semibold text-slate-200 text-right">
                                    {typeof hoveredDesk.zoneId === 'string' ? hoveredDesk.zoneId : 'Zone B'} (Quiet Zone)
                                </span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400">Nearby:</span>
                                <span className="font-semibold text-slate-200 text-right">Window View, Kitchen</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2 border-t border-slate-800">
                            <Button
                                onClick={() => onDeskSelect(hoveredDesk)}
                                size="sm"
                                className="w-full bg-slate-100 hover:bg-white text-slate-900 font-extrabold text-xs shadow-xs"
                            >
                                Explore / Book Desk
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Floating Legend (Figure 2 Style) */}
            <div className="absolute bottom-6 right-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" />
                    <span className="text-slate-700 dark:text-slate-300">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                    <span className="text-slate-700 dark:text-slate-300">Team Zone</span>
                </div>
            </div>
        </div>
    );
};
