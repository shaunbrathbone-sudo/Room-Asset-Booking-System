'use client';

import { useState } from 'react';
import { 
    X, Sparkles, Coffee, Droplets, Utensils, Bath, 
    Printer, Info, HelpCircle, CheckCircle, Flame, Shield 
} from 'lucide-react';

export interface FacilityHotspot {
    id: string;
    title: string;
    itemName?: string;
    description?: string;
    instructions?: string;
    posX: number;
    posY: number;
    icon?: string;
}

export interface FacilityArea {
    id: string;
    name: string;
    type: string;
    photoUrl: string;
    description?: string;
    hotspots: FacilityHotspot[];
}

interface FacilityHotspotModalProps {
    facility: FacilityArea | null;
    isOpen: boolean;
    onClose: () => void;
}

const getHotspotIcon = (iconName?: string) => {
    switch (iconName) {
        case 'Coffee': return Coffee;
        case 'Droplets': return Droplets;
        case 'Utensils': return Utensils;
        case 'Bath': return Bath;
        case 'Printer': return Printer;
        case 'Flame': return Flame;
        case 'Shield': return Shield;
        default: return Info;
    }
};

export const FacilityHotspotModal = ({ facility, isOpen, onClose }: FacilityHotspotModalProps) => {
    const [activeHotspot, setActiveHotspot] = useState<FacilityHotspot | null>(null);

    if (!isOpen || !facility) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 capitalize">
                                {facility.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                                {facility.hotspots?.length || 0} Interactive Hotspots
                            </span>
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                            {facility.name}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Interactive Photo Canvas & Hotspot Detail Split */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Left: Photo with Clickable / Hoverable Hotspots */}
                    <div className="lg:col-span-8 relative bg-slate-950 flex items-center justify-center min-h-[380px] p-2">
                        <div className="relative w-full h-full max-h-[480px] overflow-hidden rounded-2xl">
                            <img
                                src={facility.photoUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200'}
                                alt={facility.name}
                                className="w-full h-full object-cover rounded-2xl select-none"
                            />

                            {/* Hotspot Pins */}
                            {facility.hotspots?.map((hs) => {
                                const Icon = getHotspotIcon(hs.icon);
                                const isSelected = activeHotspot?.id === hs.id;

                                return (
                                    <div
                                        key={hs.id}
                                        style={{ left: `${hs.posX}%`, top: `${hs.posY}%` }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveHotspot(hs)}
                                            onMouseEnter={() => setActiveHotspot(hs)}
                                            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xl ${
                                                isSelected
                                                    ? 'bg-amber-400 text-slate-950 scale-125 ring-4 ring-amber-400/50'
                                                    : 'bg-blue-600 text-white hover:scale-110 hover:bg-blue-500 ring-2 ring-white/80'
                                            }`}
                                        >
                                            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-50 pointer-events-none" />
                                            <Icon className="w-4 h-4" />
                                        </button>

                                        {/* Hover Label Tag */}
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                                            <div className="px-2.5 py-1 rounded-lg bg-slate-950/95 text-white text-[11px] font-bold border border-white/20 shadow-xl backdrop-blur-md">
                                                {hs.title}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Selected Hotspot Details / Instructions */}
                    <div className="lg:col-span-4 p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                        {activeHotspot ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                                        {(() => {
                                            const Icon = getHotspotIcon(activeHotspot.icon);
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-amber-500">
                                            {activeHotspot.itemName || 'Amenity Feature'}
                                        </span>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            {activeHotspot.title}
                                        </h3>
                                    </div>
                                </div>

                                {activeHotspot.description && (
                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {activeHotspot.description}
                                    </div>
                                )}

                                {activeHotspot.instructions && (
                                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                                            <Sparkles className="w-3.5 h-3.5" /> Instructions & Usage
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {activeHotspot.instructions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Explore Hotspots
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                    Hover or click any glowing pulsating pin on the photo to see operating instructions, appliance details, and facility tips.
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                            >
                                Close Facility View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityHotspotModal;