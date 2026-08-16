'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Compass, Monitor, Move, Save, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export const DeskLayoutCanvas = ({ floor, onSaved }: { floor: any; onSaved: () => void }) => {
    const [selectedDesk, setSelectedDesk] = useState<any | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const saveMutation = useMutation({
        mutationFn: async (desk: any) => {
            await api.post(`/admin/desks/${desk.id}/layout`, {
                x: desk.x,
                y: desk.y,
                label: desk.label,
                equipmentTags: desk.equipment_tags || desk.equipmentTags,
                isBookable: desk.is_bookable !== 0,
            });
        },
        onSuccess: () => {
            setFeedback('Desk layout saved!');
            onSaved();
            setTimeout(() => setFeedback(null), 2500);
        },
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-600" /> Interactive Desk Layout Canvas
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">Click workstation node to edit properties</span>
                </div>

                <div className="relative w-full h-[450px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-6 select-none">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    {floor?.desks?.map((d: any) => {
                        const isSelected = selectedDesk?.id === d.id;
                        const leftPercent = ((d.x + 5) / 10) * 100;
                        const topPercent = ((d.y + 5) / 10) * 100;

                        return (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => setSelectedDesk(d)}
                                style={{ left: `${Math.max(5, Math.min(95, leftPercent))}%`, top: `${Math.max(5, Math.min(95, topPercent))}%` }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl text-center border transition-all ${
                                    isSelected
                                        ? 'bg-blue-600 text-white border-amber-400 scale-110 ring-4 ring-blue-500/30 z-30'
                                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-blue-400 hover:scale-105 z-10'
                                }`}
                            >
                                <Monitor className="w-4 h-4 mx-auto mb-0.5" />
                                <span className="block text-[10px] font-mono font-bold">{d.code}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
                {selectedDesk ? (
                    <div className="space-y-4">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">Desk Inspector</span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedDesk.code}</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Friendly Label</label>
                            <input
                                type="text"
                                value={selectedDesk.label || ''}
                                onChange={(e) => setSelectedDesk({ ...selectedDesk, label: e.target.value })}
                                placeholder="e.g. Creative Pod 1"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Equipment Tags</label>
                            <input
                                type="text"
                                value={selectedDesk.equipment_tags || selectedDesk.equipmentTags || ''}
                                onChange={(e) => setSelectedDesk({ ...selectedDesk, equipment_tags: e.target.value })}
                                placeholder="Dual 4K, Standing Desk, USB-C Dock"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Canvas X</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={selectedDesk.x}
                                    onChange={(e) => setSelectedDesk({ ...selectedDesk, x: Number(e.target.value) })}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Canvas Y</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={selectedDesk.y}
                                    onChange={(e) => setSelectedDesk({ ...selectedDesk, y: Number(e.target.value) })}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> {feedback}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => saveMutation.mutate(selectedDesk)}
                            disabled={saveMutation.isPending}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save Desk Configuration
                        </button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400">
                            <Move className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Select a Workstation</h4>
                        <p className="text-xs text-slate-400">Click any desk icon to inspect coordinates and tags.</p>
                    </div>
                )}
            </div>
        </div>
    );
};