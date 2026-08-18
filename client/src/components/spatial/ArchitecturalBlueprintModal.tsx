'use client';

import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Layers, Users, MapPin } from 'lucide-react';

interface ArchitecturalBlueprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    floorName: string;
    officeName: string;
    imageUrl: string;
    roomsSummary?: {
        name: string;
        roomCode?: string;
        team?: string;
        capacity?: string | number;
        color?: string;
        members?: string[];
    }[];
}

export const ArchitecturalBlueprintModal = ({
    isOpen,
    onClose,
    floorName,
    officeName,
    imageUrl,
    roomsSummary = [],
}: ArchitecturalBlueprintModalProps) => {
    const [zoom, setZoom] = useState(1);
    const [activeTab, setActiveTab] = useState<'blueprint' | 'teams'>('blueprint');

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
    const handleResetZoom = () => setZoom(1);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={`${floorName} Architectural Drawing`}
        >
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                                    Architectural Drawing & Team Layout
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                    {officeName}
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {floorName} — Official Layout Drawing
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Controls */}
                        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-mono font-bold px-2">{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <a
                            href={imageUrl}
                            download={`${officeName.toLowerCase().replace(/\s+/g, '-')}-${floorName.toLowerCase().replace(/\s+/g, '-')}-blueprint.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                            title="Download / Open Full Drawing"
                        >
                            <Download className="w-4 h-4" />
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition-colors"
                            aria-label="Close drawing viewer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[400px]">
                    <div 
                        className="transition-transform duration-200 origin-center max-w-full"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <img
                            src={imageUrl}
                            alt={`${floorName} architectural drawing`}
                            className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-xl border border-slate-300 dark:border-slate-800 bg-white"
                        />
                    </div>
                </div>

                {/* Footer Legend & Notes */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>Architectural Drawing Reference • 17 Friar Lane, Leicester LE1 5RB</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Layers:</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                            Projects Team
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                            Support Team
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                            Dev Team
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                            Meeting Suites
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
