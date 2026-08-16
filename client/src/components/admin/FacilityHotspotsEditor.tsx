'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Coffee, Plus, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export const FacilityHotspotsEditor = ({ floor, onSaved }: { floor: any; onSaved: () => void }) => {
    const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
    const [isAddingHotspot, setIsAddingHotspot] = useState(false);
    const [newHotspotCoords, setNewHotspotCoords] = useState<{ x: number; y: number } | null>(null);
    const [hotspotForm, setHotspotForm] = useState({
        title: '',
        itemName: '',
        description: '',
        instructions: '',
        icon: 'Coffee',
    });
    const [newFacilityForm, setNewFacilityForm] = useState({
        name: '',
        type: 'kitchen',
        photoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200',
        description: '',
    });
    const [isCreatingFacility, setIsCreatingFacility] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const createFacilityMutation = useMutation({
        mutationFn: async () => {
            if (!floor) return;
            const { data } = await api.post(`/admin/floors/${floor.id}/facilities`, newFacilityForm);
            return data;
        },
        onSuccess: () => {
            setFeedback('Facility area created!');
            setIsCreatingFacility(false);
            setNewFacilityForm({ name: '', type: 'kitchen', photoUrl: '', description: '' });
            onSaved();
            setTimeout(() => setFeedback(null), 2500);
        },
    });

    const createHotspotMutation = useMutation({
        mutationFn: async () => {
            if (!selectedFacility || !newHotspotCoords) return;
            await api.post(`/admin/facilities/${selectedFacility.id}/hotspots`, {
                ...hotspotForm,
                posX: newHotspotCoords.x,
                posY: newHotspotCoords.y,
            });
        },
        onSuccess: () => {
            setFeedback('Hotspot pinned successfully!');
            setIsAddingHotspot(false);
            setNewHotspotCoords(null);
            setHotspotForm({ title: '', itemName: '', description: '', instructions: '', icon: 'Coffee' });
            onSaved();
            setTimeout(() => setFeedback(null), 2500);
        },
    });

    const deleteHotspotMutation = useMutation({
        mutationFn: async (hotspotId: string) => {
            await api.delete(`/admin/hotspots/${hotspotId}`);
        },
        onSuccess: () => {
            setFeedback('Hotspot removed.');
            onSaved();
            setTimeout(() => setFeedback(null), 2500);
        },
    });

    const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isAddingHotspot) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setNewHotspotCoords({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
    };

    const currentFac = selectedFacility || floor?.facilities?.[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-amber-500" /> On-Site Facilities & Photo Hotspots
                        </h3>
                        <p className="text-xs text-slate-400">Click photo to drop interactive hotspot pins.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreatingFacility(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Add Facility Area
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {floor?.facilities?.map((fac: any) => (
                        <button
                            key={fac.id}
                            type="button"
                            onClick={() => setSelectedFacility(fac)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                                currentFac?.id === fac.id
                                    ? 'bg-amber-500 text-slate-950 shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <span>{fac.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10">
                                {fac.hotspots?.length || 0} Hotspots
                            </span>
                        </button>
                    ))}
                </div>

                {currentFac ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isAddingHotspot ? '👉 Click on the photo to drop your hotspot pin' : 'Facility Photo Preview'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isAddingHotspot ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                }`}
                            >
                                {isAddingHotspot ? 'Cancel' : '+ Drop New Photo Hotspot'}
                            </button>
                        </div>

                        <div
                            onClick={handlePhotoClick}
                            className={`relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 ${
                                isAddingHotspot ? 'cursor-crosshair ring-4 ring-amber-400/40' : 'cursor-default'
                            }`}
                        >
                            <img
                                src={currentFac.photo_url || currentFac.photoUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200'}
                                alt={currentFac.name}
                                className="w-full h-full object-cover select-none"
                            />

                            {currentFac.hotspots?.map((hs: any) => (
                                <div
                                    key={hs.id}
                                    style={{ left: `${hs.pos_x || hs.posX}%`, top: `${hs.pos_y || hs.posY}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xl ring-2 ring-white hover:scale-125 transition-transform">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        <div className="px-2 py-0.5 rounded bg-slate-950 text-white text-[10px] font-bold border border-white/20 shadow-md">
                                            {hs.title}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {newHotspotCoords && (
                                <div
                                    style={{ left: `${newHotspotCoords.x}%`, top: `${newHotspotCoords.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center animate-bounce shadow-2xl ring-4 ring-amber-400/50"
                                >
                                    <Plus className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Coffee className="w-8 h-8 text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Facility Area Selected</h4>
                        <p className="text-xs text-slate-400">Add an on-site kitchen, lounge, or shower facility.</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                {newHotspotCoords ? (
                    <div className="space-y-4">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] uppercase font-bold text-amber-500">Configure Hotspot</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Item Details & Tips</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Title *</label>
                            <input
                                type="text"
                                value={hotspotForm.title}
                                onChange={(e) => setHotspotForm({ ...hotspotForm, title: e.target.value })}
                                placeholder="e.g. Sage Barista Touch Espresso"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category / Tag</label>
                            <input
                                type="text"
                                value={hotspotForm.itemName}
                                onChange={(e) => setHotspotForm({ ...hotspotForm, itemName: e.target.value })}
                                placeholder="e.g. Coffee Machine, Water Tap"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                rows={2}
                                value={hotspotForm.description}
                                onChange={(e) => setHotspotForm({ ...hotspotForm, description: e.target.value })}
                                placeholder="Fresh roasted arabica coffee..."
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Usage Instructions</label>
                            <textarea
                                rows={2}
                                value={hotspotForm.instructions}
                                onChange={(e) => setHotspotForm({ ...hotspotForm, instructions: e.target.value })}
                                placeholder="1. Place mug, 2. Tap drink option..."
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => createHotspotMutation.mutate()}
                            disabled={createHotspotMutation.isPending || !hotspotForm.title}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4" /> Save Photo Hotspot
                        </button>
                    </div>
                ) : isCreatingFacility ? (
                    <div className="space-y-4">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-[10px] uppercase font-bold text-blue-600">New Facility</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Add Facility Area</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Facility Name *</label>
                            <input
                                type="text"
                                value={newFacilityForm.name}
                                onChange={(e) => setNewFacilityForm({ ...newFacilityForm, name: e.target.value })}
                                placeholder="e.g. Ground Floor Kitchen & Espresso Bar"
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select
                                value={newFacilityForm.type}
                                onChange={(e) => setNewFacilityForm({ ...newFacilityForm, type: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                            >
                                <option value="kitchen">Kitchen / Refreshments</option>
                                <option value="restroom">Restrooms</option>
                                <option value="shower">Showers & Changing</option>
                                <option value="wellness">Wellness & Quiet Room</option>
                                <option value="print">Print & Office Hub</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Photo URL</label>
                            <input
                                type="text"
                                value={newFacilityForm.photoUrl}
                                onChange={(e) => setNewFacilityForm({ ...newFacilityForm, photoUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreatingFacility(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => createFacilityMutation.mutate()}
                                disabled={createFacilityMutation.isPending || !newFacilityForm.name}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white"
                            >
                                Create Area
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Hotspots in {currentFac?.name || 'Selected Facility'}
                        </h4>
                        <div className="space-y-2">
                            {currentFac?.hotspots?.map((hs: any) => (
                                <div key={hs.id} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{hs.title}</h5>
                                        <span className="text-[10px] text-slate-400">{hs.item_name || hs.itemName || 'Hotspot'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteHotspotMutation.mutate(hs.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};