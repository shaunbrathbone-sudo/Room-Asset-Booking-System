'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Compass, Monitor, Move, Save, CheckCircle2, User, Calendar, Lock, Unlock } from 'lucide-react';
import { api } from '@/lib/api';

export interface DeskNode {
    id: string;
    code: string;
    label?: string | null;
    x: number;
    y: number;
    status: 'available' | 'booked' | 'occupied' | 'maintenance';
    is_bookable?: number | boolean;
    isBookable?: boolean;
    equipment_tags?: string | null;
    equipmentTags?: string | null;
    desk_type?: 'flexible' | 'permanent';
    assigned_user_id?: string | null;
    assigned_user_name?: string | null;
    assigned_days?: string | null;
}

export interface FloorCanvasData {
    id: string;
    name: string;
    floorNumber: number;
    slug: string;
    plan_image_url?: string | null;
    planImageUrl?: string | null;
    desks?: DeskNode[];
}

interface DeskLayoutCanvasProps {
    floor?: FloorCanvasData | null;
    onSaved: () => void;
}

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const DeskLayoutCanvas = ({ floor, onSaved }: DeskLayoutCanvasProps) => {
    const [selectedDesk, setSelectedDesk] = useState<DeskNode | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showBlueprint, setShowBlueprint] = useState(true);
    const [blueprintOpacity, setBlueprintOpacity] = useState(40);

    const blueprintUrl = floor?.plan_image_url || floor?.planImageUrl || (
        floor?.slug === 'ground-floor' ? '/images/floors/leicester-ground-floor.jpg' :
        floor?.slug === 'first-floor' ? '/images/floors/leicester-first-floor.jpg' : null
    );

    const parseDays = (daysStr?: string | null): string[] => {
        if (!daysStr) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        try {
            const parsed = JSON.parse(daysStr);
            return Array.isArray(parsed) ? parsed : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        } catch {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        }
    };

    const saveMutation = useMutation({
        mutationFn: async (desk: DeskNode) => {
            // Save layout position & labels
            await api.post(`/admin/desks/${desk.id}/layout`, {
                x: desk.x,
                y: desk.y,
                label: desk.label,
                equipmentTags: desk.equipment_tags || desk.equipmentTags,
                isBookable: desk.is_bookable !== 0 && desk.isBookable !== false,
            });

            // Save Permanent vs Flexible allocation
            await api.put(`/admin/desks/${desk.id}/allocation`, {
                deskType: desk.desk_type || 'flexible',
                assignedUserName: desk.assigned_user_name,
                assignedDays: desk.assigned_days,
            });
        },
        onSuccess: () => {
            setFeedback('Desk layout & allocation saved!');
            onSaved();
            setTimeout(() => setFeedback(null), 2500);
        },
    });

    const toggleDay = (day: string) => {
        if (!selectedDesk) return;
        const currentDays = parseDays(selectedDesk.assigned_days);
        let updated: string[];
        if (currentDays.includes(day)) {
            updated = currentDays.filter((d) => d !== day);
        } else {
            updated = [...currentDays, day];
        }
        setSelectedDesk({
            ...selectedDesk,
            assigned_days: JSON.stringify(updated),
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 2D Canvas */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Compass className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Interactive Desk Layout Canvas
                        </h3>
                        <span className="text-xs text-slate-400 font-semibold">Click workstation node to edit allocation & position</span>
                    </div>

                    {blueprintUrl && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showBlueprint}
                                    onChange={(e) => setShowBlueprint(e.target.checked)}
                                    className="rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                                />
                                Architectural Drawing Overlay
                            </label>
                            {showBlueprint && (
                                <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700">
                                    <span className="text-[10px] text-slate-400 font-mono">{blueprintOpacity}%</span>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="10"
                                        value={blueprintOpacity}
                                        onChange={(e) => setBlueprintOpacity(Number(e.target.value))}
                                        className="w-16 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer accent-blue-600"
                                        title="Adjust drawing opacity"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div 
                    className="relative w-full h-[520px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-6 select-none"
                    role="region"
                    aria-label="Blueprint workstation positioning canvas"
                >
                    {/* Architectural Drawing Backdrop */}
                    {blueprintUrl && showBlueprint && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                            style={{ opacity: blueprintOpacity / 100 }}
                        >
                            <img
                                src={blueprintUrl}
                                alt="Floor Architectural Blueprint"
                                className="max-w-full max-h-full object-contain filter invert contrast-125"
                            />
                        </div>
                    )}

                    <div 
                        className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                    />

                    {floor?.desks?.map((d) => {
                        const isSelected = selectedDesk?.id === d.id;
                        const isPermanent = d.desk_type === 'permanent';
                        const leftPercent = ((d.x + 5) / 10) * 100;
                        const topPercent = ((d.y + 5) / 10) * 100;

                        return (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => setSelectedDesk(d)}
                                aria-label={`Select workstation ${d.code} (${d.label || 'Standard Desk'})`}
                                style={{ 
                                    left: `${Math.max(5, Math.min(95, leftPercent))}%`, 
                                    top: `${Math.max(5, Math.min(95, topPercent))}%` 
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl text-center border transition-all focus:outline-none focus:ring-4 focus:ring-blue-400 ${
                                    isSelected
                                        ? 'bg-blue-600 text-white border-amber-400 scale-110 ring-4 ring-blue-500/30 z-30'
                                        : isPermanent
                                        ? 'bg-indigo-950/95 text-cyan-300 border-cyan-500/60 hover:scale-105 z-10'
                                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-blue-400 hover:scale-105 z-10'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                    <Monitor className="w-3.5 h-3.5" />
                                    {isPermanent && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                                </div>
                                <span className="block text-[10px] font-mono font-bold">{d.code}</span>
                                {d.assigned_user_name && (
                                    <span className="block text-[8px] font-semibold text-cyan-300 truncate max-w-[60px]">
                                        {d.assigned_user_name.split(' ')[0]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Inspector Panel */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
                {selectedDesk ? (
                    <div className="space-y-4">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">Desk Inspector</span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedDesk.code}</h3>
                        </div>

                        {/* Question: Is it Permanent or Flexible? */}
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                Desk Allocation Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDesk({ ...selectedDesk, desk_type: 'flexible' })}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        selectedDesk.desk_type !== 'permanent'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <Unlock className="w-3.5 h-3.5" /> Flexible (Hot Desk)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDesk({ ...selectedDesk, desk_type: 'permanent' })}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        selectedDesk.desk_type === 'permanent'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <Lock className="w-3.5 h-3.5" /> Permanent
                                </button>
                            </div>
                        </div>

                        {/* If Permanent: Whose desk is it and on what days? */}
                        {selectedDesk.desk_type === 'permanent' && (
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" /> Whose desk is it? (Assigned Employee)
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedDesk.assigned_user_name || ''}
                                        onChange={(e) => setSelectedDesk({ ...selectedDesk, assigned_user_name: e.target.value })}
                                        placeholder="e.g. Rob Rathbone / Simon Smith"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1.5 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> In-Office Assigned Days
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        {ALL_WEEKDAYS.map((day) => {
                                            const activeDays = parseDays(selectedDesk.assigned_days);
                                            const isActive = activeDays.includes(day);

                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        isActive
                                                            ? 'bg-indigo-600 text-white shadow-sm'
                                                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-1 block">
                                        Frees as a hot desk on unscheduled days.
                                    </span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Friendly Label</label>
                            <input
                                type="text"
                                value={selectedDesk.label || ''}
                                onChange={(e) => setSelectedDesk({ ...selectedDesk, label: e.target.value })}
                                placeholder="e.g. Creative Pod 1"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Equipment Tags</label>
                            <input
                                type="text"
                                value={selectedDesk.equipment_tags || selectedDesk.equipmentTags || ''}
                                onChange={(e) => setSelectedDesk({ ...selectedDesk, equipment_tags: e.target.value, equipmentTags: e.target.value })}
                                placeholder="Dual 4K, Standing Desk, USB-C Dock"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Canvas X</label>
                                <input
                                    type="number"
                                    step="0.2"
                                    value={selectedDesk.x}
                                    onChange={(e) => setSelectedDesk({ ...selectedDesk, x: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Canvas Y</label>
                                <input
                                    type="number"
                                    step="0.2"
                                    value={selectedDesk.y}
                                    onChange={(e) => setSelectedDesk({ ...selectedDesk, y: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>{feedback}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-400">
                        <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Select any workstation on the canvas to configure allocation and coordinates.</p>
                    </div>
                )}

                <button
                    type="button"
                    disabled={!selectedDesk || saveMutation.isPending}
                    onClick={() => selectedDesk && saveMutation.mutate(selectedDesk)}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Desk Changes</span>
                </button>
            </div>
        </div>
    );
};

export default DeskLayoutCanvas;