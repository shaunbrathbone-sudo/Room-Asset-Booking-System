'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Zap, X, Clock, Users, Monitor, Tv, 
    Check, Sparkles, MapPin, AlertCircle, RefreshCw, 
    ChevronRight, Calendar, Building2 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface BookNowQuickModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AvailableRoom {
    id: string;
    name: string;
    capacity: number;
    equipment_tags?: string;
    zone_name: string;
    floor_name: string;
    office_name: string;
    office_city: string;
    country_slug: string;
    office_slug: string;
    floor_slug: string;
    isAvailableNow: boolean;
    availableForMinutes: number;
    nextFreeTime?: string;
}

interface AvailableDesk {
    id: string;
    code: string;
    label: string;
    equipment_tags?: string;
    desk_type: string;
    assigned_user_name?: string;
    zone_name: string;
    floor_name: string;
    office_name: string;
    country_slug: string;
    office_slug: string;
    floor_slug: string;
}

export const BookNowQuickModal = ({ isOpen, onClose }: BookNowQuickModalProps) => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState<'rooms' | 'desks'>('rooms');
    const [selectedDuration, setSelectedDuration] = useState<number>(60);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Query real-time availability
    const { data, isLoading, refetch, isFetching } = useQuery<{ rooms: AvailableRoom[]; desks: AvailableDesk[]; timestamp: string }>({
        queryKey: ['availableNow'],
        queryFn: async () => {
            const res = await api.get('/bookings/available-now');
            return res.data;
        },
        enabled: isOpen,
        refetchInterval: isOpen ? 30000 : false, // refresh every 30s
    });

    // Instant booking mutation
    const instantBookingMutation = useMutation({
        mutationFn: async ({ resourceType, resourceId, durationMinutes }: { resourceType: 'meeting_room' | 'desk'; resourceId: string; durationMinutes: number }) => {
            const res = await api.post('/bookings/instant', {
                resourceType,
                resourceId,
                durationMinutes,
            });
            return res.data;
        },
        onSuccess: (data) => {
            setSuccessMessage(data.message || 'Instant reservation confirmed!');
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
            queryClient.invalidateQueries({ queryKey: ['availableNow'] });
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 2000);
        },
        onError: (err: any) => {
            setErrorMessage(err.response?.data?.error || 'Failed to complete instant reservation.');
            setTimeout(() => setErrorMessage(null), 4000);
        },
    });

    if (!isOpen || !mounted) return null;

    const rooms = data?.rooms || [];
    const desks = data?.desks || [];

    const modal = (
        <div 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="book-now-title"
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg shadow-black/10">
                            <Zap className="w-6 h-6 fill-white" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-200 block">
                                Real-Time Instant Availability
                            </span>
                            <h2 id="book-now-title" className="text-xl font-black tracking-tight text-white">
                                Book Now — Next Few Hours
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Refresh real-time availability"
                            aria-label="Refresh availability"
                        >
                            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {successMessage && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Tabs Switcher */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 w-full sm:w-80">
                        <button
                            type="button"
                            onClick={() => setTab('rooms')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                tab === 'rooms'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <Tv className="w-4 h-4" />
                            <span>Meeting Rooms ({rooms.filter(r => r.isAvailableNow).length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('desks')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                tab === 'desks'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <Monitor className="w-4 h-4" />
                            <span>Desks Available ({desks.length})</span>
                        </button>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                        Instant reservation from now
                    </span>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : tab === 'rooms' ? (
                        rooms.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">
                                No meeting rooms found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {rooms.map((room) => {
                                    const isAvailable = room.isAvailableNow;
                                    const minutes = room.availableForMinutes;

                                    return (
                                        <div
                                            key={room.id}
                                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                                isAvailable
                                                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400'
                                                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {room.name}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                        isAvailable
                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                        {isAvailable ? `Available Now (${minutes >= 120 ? '2h+ free' : `${minutes}m free`})` : `In Use (Free at ${room.nextFreeTime || 'later'})`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" /> {room.capacity} seats
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 truncate max-w-xs">
                                                        <Building2 className="w-3.5 h-3.5" /> {room.office_name} ({room.floor_name})
                                                    </span>
                                                </div>

                                                {room.equipment_tags && (
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                                        {room.equipment_tags}
                                                    </p>
                                                )}
                                            </div>

                                            {isAvailable && (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {[30, 60, 120].map((mins) => (
                                                        <button
                                                            key={mins}
                                                            type="button"
                                                            disabled={instantBookingMutation.isPending || (minutes < mins && minutes > 0)}
                                                            onClick={() => instantBookingMutation.mutate({
                                                                resourceType: 'meeting_room',
                                                                resourceId: room.id,
                                                                durationMinutes: mins,
                                                            })}
                                                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all disabled:opacity-30"
                                                        >
                                                            {mins === 30 ? '30m' : mins === 60 ? '1 hr' : '2 hr'}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        desks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">
                                No hot-desks currently available.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {desks.map((desk) => (
                                    <div
                                        key={desk.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                    {desk.code}
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Free Today
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                                                {desk.label || 'Standard Workstation'}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {desk.office_name} • {desk.floor_name}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={instantBookingMutation.isPending}
                                            onClick={() => instantBookingMutation.mutate({
                                                resourceType: 'desk',
                                                resourceId: desk.id,
                                                durationMinutes: 480, // full day remaining
                                            })}
                                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                                        >
                                            <Zap className="w-3.5 h-3.5 fill-white" />
                                            <span>Claim This Desk for Today</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default BookNowQuickModal;