'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Clock, Monitor, Wifi, Users, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { Desk, MeetingRoom } from '@/types/spatial';

interface ScheduleDrawerProps {
    resource: Desk | MeetingRoom | null;
    resourceType: 'desk' | 'meeting_room';
    isOpen: boolean;
    onClose: () => void;
}

const getNextDays = (count: number): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
};

const formatDateUK = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDayLabel = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30',
];

export const ScheduleDrawer = ({ resource, resourceType, isOpen, onClose }: ScheduleDrawerProps) => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();
    const [viewDays, setViewDays] = useState<7 | 14>(7);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const days = getNextDays(viewDays);

    const bookMutation = useMutation({
        mutationFn: async () => {
            if (!resource || selectedSlots.length === 0) return;

            const startHour = selectedSlots[0];
            const endSlot = selectedSlots[selectedSlots.length - 1];
            // Calculate end time (30 mins after endSlot)
            const [h, m] = endSlot.split(':').map(Number);
            let endH = h;
            let endM = m + 30;
            if (endM === 60) {
                endH += 1;
                endM = 0;
            }
            const endFormatted = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

            const dateStr = selectedDate.toISOString().split('T')[0];
            const startISO = `${dateStr}T${startHour}:00.000Z`;
            const endISO = `${dateStr}T${endFormatted}:00.000Z`;

            const { data } = await api.post('/bookings', {
                resourceType,
                resourceId: resource.id,
                startTime: startISO,
                endTime: endISO,
            });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['floorPlan'] });
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
            setBookingSuccess(data.status === 'pending_approval'
                ? 'Booking request submitted! Awaiting facility manager approval.'
                : 'Reservation confirmed! Your workspace is ready.');
            setBookingError(null);
            setTimeout(() => {
                setBookingSuccess(null);
                onClose();
            }, 2500);
        },
        onError: (err: any) => {
            setBookingError(err.response?.data?.error || 'Failed to complete booking.');
        },
    });

    if (!isOpen || !resource) return null;

    const title = resourceType === 'desk' ? (resource as Desk).code : (resource as MeetingRoom).name;
    const subtitle = resourceType === 'meeting_room'
        ? `Capacity: ${(resource as MeetingRoom).capacity} attendees`
        : (resource as Desk).label || 'Workstation';

    const handleSlotClick = (time: string) => {
        if (selectedSlots.includes(time)) {
            if (selectedSlots.length === 1) return;
            setSelectedSlots(selectedSlots.filter((s) => s !== time));
        } else {
            const newSlots = [...selectedSlots, time].sort();
            setSelectedSlots(newSlots);
        }
    };

    const applyPreset = (type: 'morning' | 'afternoon' | 'fullday') => {
        if (type === 'morning') {
            setSelectedSlots(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00']);
        } else if (type === 'afternoon') {
            setSelectedSlots(['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']);
        } else {
            setSelectedSlots(TIME_SLOTS.slice(2, 18));
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 flex flex-col transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                        {resourceType === 'meeting_room' && (resource as MeetingRoom).requiresApproval && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                Approval Required
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    aria-label="Close schedule drawer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Equipment badges */}
            <div className="flex gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                    <Monitor className="w-3 h-3" /> Dual 4K Monitors
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 whitespace-nowrap">
                    <Wifi className="w-3 h-3" /> Gigabit LAN
                </span>
                {resourceType === 'meeting_room' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 whitespace-nowrap">
                        <Users className="w-3 h-3" /> {(resource as MeetingRoom).capacity} seats
                    </span>
                )}
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewDays(7)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewDays === 7
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" /> 7 Days
                    </button>
                    <button
                        onClick={() => setViewDays(14)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewDays === 14
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" /> 14 Days
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Day selector pills */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Select Booking Date
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {days.slice(0, 8).map((d, i) => {
                            const isSelected = d.toDateString() === selectedDate.toDateString();
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(d)}
                                    className={`p-2.5 rounded-xl text-center border transition-all ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                    }`}
                                >
                                    <span className="block text-[11px] uppercase opacity-75">{formatDayLabel(d).split(' ')[0]}</span>
                                    <span className="block text-base font-bold">{d.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Presets */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Quick Duration Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => applyPreset('morning')}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-700"
                        >
                            ☀️ Morning (9-1)
                        </button>
                        <button
                            onClick={() => applyPreset('afternoon')}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-700"
                        >
                            🌤️ Afternoon (1-5)
                        </button>
                        <button
                            onClick={() => applyPreset('fullday')}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-slate-200 dark:border-slate-700"
                        >
                            ⚡ Full Day (9-5)
                        </button>
                    </div>
                </div>

                {/* Interactive Time Slots Grid */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Time Slots ({formatDateUK(selectedDate)})
                        </label>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {selectedSlots.length * 0.5} Hours Selected
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                        {TIME_SLOTS.map((time) => {
                            const isSelected = selectedSlots.includes(time);
                            return (
                                <button
                                    key={time}
                                    onClick={() => handleSlotClick(time)}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                                        isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                    }`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback Alerts */}
                {bookingSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-start gap-2.5 text-sm animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                        <div>
                            <p className="font-bold">Success!</p>
                            <p className="text-xs mt-0.5">{bookingSuccess}</p>
                        </div>
                    </div>
                )}

                {bookingError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2.5 text-sm animate-fade-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                        <div>
                            <p className="font-bold">Booking Issue</p>
                            <p className="text-xs mt-0.5">{bookingError}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                {isAuthenticated ? (
                    <button
                        onClick={() => bookMutation.mutate()}
                        disabled={bookMutation.isPending || selectedSlots.length === 0}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" />
                        {bookMutation.isPending ? 'Confirming Reservation...' : `Confirm Booking (${selectedSlots[0]} – ${selectedSlots[selectedSlots.length - 1]})`}
                    </button>
                ) : (
                    <a
                        href="/login"
                        className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all flex items-center justify-center gap-2"
                    >
                        Sign in to Book
                    </a>
                )}
            </div>
        </div>
    );
};