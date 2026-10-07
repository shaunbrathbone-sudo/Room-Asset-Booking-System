'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Layers,
    Monitor,
    Users,
    Upload,
    Plus,
    CheckCircle2,
    SlidersHorizontal,
    Search,
    Eye,
    ShieldAlert,
    RotateCcw,
    FileCode,
    Sparkles,
    Settings,
    ArrowUpDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DeskLayoutCanvas } from '@/components/admin/DeskLayoutCanvas';
import { cn } from '@/lib/utils';
import type { Desk, MeetingRoom, Floor } from '@/types/spatial';

interface AdminOperationsStudioProps {
    office: {
        id: string;
        name: string;
        slug: string;
    };
    floors: any[];
    activeFloorIdx: number;
    onFloorSelect: (idx: number) => void;
    onSaveSuccess?: () => void;
}

export const AdminOperationsStudio: React.FC<AdminOperationsStudioProps> = ({
    office,
    floors,
    activeFloorIdx,
    onFloorSelect,
    onSaveSuccess
}) => {
    const router = useRouter();
    const currentFloor = floors[activeFloorIdx];

    // Selected desk or room for right-side configuration inspector
    const [selectedDesk, setSelectedDesk] = useState<any | null>(currentFloor?.desks?.[0] || null);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

    // Filter toggles (Figure 4)
    const [filterShowDesks, setFilterShowDesks] = useState(true);
    const [filterShowRooms, setFilterShowRooms] = useState(true);
    const [filterShowOccupied, setFilterShowOccupied] = useState(true);
    const [filterShowVacant, setFilterShowVacant] = useState(true);

    // Reorderable table columns standard (Rule 22)
    const [deskColumns, setDeskColumns] = useState(['Desk', 'Status', 'Details', 'Zone']);
    const [roomColumns, setRoomColumns] = useState(['Room', 'Capacity', 'Equipment']);

    // Reorder column helper
    const moveColumn = (list: string[], setList: (l: string[]) => void, fromIndex: number, toIndex: number) => {
        const updated = [...list];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setList(updated);
    };

    const resetColumns = () => {
        setDeskColumns(['Desk', 'Status', 'Details', 'Zone']);
        setRoomColumns(['Room', 'Capacity', 'Equipment']);
    };

    // Calculate aggregated metrics
    const totalOffices = 3;
    const totalFloors = floors.length || 2;
    const totalDesks = floors.reduce((acc, f) => acc + (f.desks?.length || 0), 0) || 52;
    const activeUsers = 48;

    return (
        <div className="w-full space-y-6">
            {/* Top Stat Metrics Bar (Figure 4 Specification) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Total Offices
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {totalOffices} Global Sites
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Total Floors
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {totalFloors} Active Levels
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Total Desks
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {totalDesks} Workstations
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Active Employees
                    </div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {activeUsers} Provisioned
                    </div>
                </Card>
            </div>

            {/* Main Stage Grid: Center Canvas + Right Config Inspector (Figure 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Center / Left Canvas & Data Grid (8 or 9 cols) */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {/* Header Controls */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4 flex-wrap shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {office.name} — {currentFloor?.name}
                            </span>
                            {/* Floor Switcher */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                {floors.map((f, idx) => (
                                    <button
                                        key={f.id}
                                        onClick={() => onFloorSelect(idx)}
                                        className={cn(
                                            'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                                            activeFloorIdx === idx
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        )}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Checkboxes (Figure 4) */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterShowDesks}
                                    onChange={(e) => setFilterShowDesks(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600"
                                />
                                <span>Desk</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterShowRooms}
                                    onChange={(e) => setFilterShowRooms(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600"
                                />
                                <span>Room</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterShowOccupied}
                                    onChange={(e) => setFilterShowOccupied(e.target.checked)}
                                    className="rounded border-slate-300 text-rose-500"
                                />
                                <span>Occupied</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterShowVacant}
                                    onChange={(e) => setFilterShowVacant(e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-500"
                                />
                                <span>Vacant</span>
                            </label>
                        </div>
                    </div>

                    {/* Blueprint & Drag-and-Drop Floorplan Canvas */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <DeskLayoutCanvas
                            floor={currentFloor}
                            onSaved={onSaveSuccess || (() => {})}
                        />
                    </div>

                    {/* Lower Reorderable Data Grids (Figure 4 & Rule 22) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Desk Inventory Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                                        Desk Inventory ({currentFloor?.desks?.length || 0})
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetColumns}
                                    title="Reset column order"
                                    className="h-7 text-[10px] text-slate-400 hover:text-slate-700"
                                >
                                    <RotateCcw className="w-3 h-3 mr-1" /> Reset Order
                                </Button>
                            </div>

                            <div className="overflow-x-auto mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {deskColumns.map((col, idx) => (
                                                <TableHead
                                                    key={col}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                                                        moveColumn(deskColumns, setDeskColumns, fromIdx, idx);
                                                    }}
                                                    className="cursor-move text-[11px] font-bold uppercase tracking-wider"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span>{col}</span>
                                                        <ArrowUpDown className="w-2.5 h-2.5 opacity-50" />
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(currentFloor?.desks || []).slice(0, 8).map((d: any) => (
                                            <TableRow
                                                key={d.id}
                                                onClick={() => setSelectedDesk(d)}
                                                className={cn(
                                                    'cursor-pointer text-xs font-semibold',
                                                    selectedDesk?.id === d.id && 'bg-blue-50/60 dark:bg-blue-950/40'
                                                )}
                                            >
                                                {deskColumns.map((col) => {
                                                    if (col === 'Desk') return <TableCell key={col} className="font-bold">{d.code || d.label}</TableCell>;
                                                    if (col === 'Status') {
                                                        const isAvail = d.status === 'available';
                                                        return (
                                                            <TableCell key={col}>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[10px] font-bold font-mono',
                                                                        isAvail
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300'
                                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300'
                                                                    )}
                                                                >
                                                                    {isAvail ? 'Active' : 'Occupied'}
                                                                </Badge>
                                                            </TableCell>
                                                        );
                                                    }
                                                    if (col === 'Details') return <TableCell key={col} className="text-slate-500">{d.equipmentTags || 'Dual 4K'}</TableCell>;
                                                    return <TableCell key={col} className="text-slate-400 font-mono text-[11px]">Zone A</TableCell>;
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Room Inventory Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                                        Meeting Suites
                                    </h3>
                                </div>
                            </div>

                            <div className="overflow-x-auto mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {roomColumns.map((col, idx) => (
                                                <TableHead
                                                    key={col}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                                                        moveColumn(roomColumns, setRoomColumns, fromIdx, idx);
                                                    }}
                                                    className="cursor-move text-[11px] font-bold uppercase tracking-wider"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span>{col}</span>
                                                        <ArrowUpDown className="w-2.5 h-2.5 opacity-50" />
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="text-xs font-semibold">
                                            <TableCell className="font-bold">Room 1 (Dev Hub)</TableCell>
                                            <TableCell>12 Seats</TableCell>
                                            <TableCell className="text-slate-500">VC, Dual 4K</TableCell>
                                        </TableRow>
                                        <TableRow className="text-xs font-semibold">
                                            <TableCell className="font-bold">Room 7 (Boardroom)</TableCell>
                                            <TableCell>16 Seats</TableCell>
                                            <TableCell className="text-slate-500">Teams Room, WB</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Configuration Inspector Panel (Figure 4) */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-5">
                    {/* Active Blueprint File Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Active Floor Plan SVG
                        </span>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FileCode className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {currentFloor?.slug || 'blueprint'}_plan.svg
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">1.2 MB · Vector Scaled</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500 text-white text-[10px] font-bold">Active</Badge>
                        </div>

                        <Button variant="outline" size="sm" className="w-full text-xs font-bold flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Upload SVG / CAD Blueprint
                        </Button>
                    </div>

                    {/* Desk Setup Inspector */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Desk Setup Inspector
                        </span>

                        {selectedDesk ? (
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Workstation:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white">
                                        {selectedDesk.code || selectedDesk.label || 'D1'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Status:</span>
                                    <Badge
                                        className={cn(
                                            'text-[10px] font-mono font-bold',
                                            selectedDesk.status === 'available'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-rose-500 text-white'
                                        )}
                                    >
                                        {selectedDesk.status === 'available' ? 'Available' : 'Occupied'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Desk Type:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        Sit/Stand Electric
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Connectivity:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        USB-C 90W PD, LAN
                                    </span>
                                </div>

                                <Button size="sm" className="w-full text-xs font-bold mt-2">
                                    Update Desk Specs
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Select a workstation to inspect details.</p>
                        )}
                    </div>

                    {/* RBAC User Permissions (Figure 4) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            User Permissions & Governance
                        </span>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 dark:text-slate-200">Governance Tier:</span>
                                <Badge variant="secondary" className="text-[10px] font-bold">Local Admin</Badge>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Authorized to calibrate SVG blueprints, arrange desk nodes, and tag local office hardware.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
