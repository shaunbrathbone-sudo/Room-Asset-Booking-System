'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    X, Calendar, Clock, Monitor, Wifi, Users, CheckCircle2, 
    AlertCircle, Sparkles, Repeat, ChevronRight, Sun, Sunset 
} from 'lucide-react';
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

const WEEKDAYS = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
];

export const ScheduleDrawer = ({ resource, resourceType, isOpen, onClose }: ScheduleDrawerProps) => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const [isRecurringMode, setIsRecurringMode] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([2, 4]); // Tue & Thu default
    const [weeksCount, setWeeksCount] = useState(4);

    const [viewDays, setViewDays] = useState<7 | 14>(7);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
        '15:00', '15:30', '16:00', '16:30', '17:00'
    ]);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const days = getNextDays(viewDays);

    const singleBookingMutation = useMutation({
        mutationFn: async () => {
            if (!resource) throw new Error('No resource selected');
            if (selectedSlots.length === 0) throw new Error('Please select at least one time slot');

            const sortedSlots = [...selectedSlots].sort();
            const startHour = sortedSlots[0];
            const endHour = sortedSlots[sortedSlots.length - 1];

            const [startH, startM] = startHour.split(':').map(Number);
            const [endH, endM] = endHour.split(':').map(Number);

            const start = new Date(selectedDate);
            start.setHours(startH, startM, 0, 0);

            const end = new Date(selectedDate);
            end.setHours(endH, endM + 30, 0, 0);

            const { data } = await api.post('/bookings', {
                resourceType,
                resourceId: resource.id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                notes: 'Workstation reservation',
            });
            return data;
        },
        onSuccess: (data) => {
            setBookingSuccess(data.message || 'Workstation reserved successfully!');
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            queryClient.invalidateQueries({ queryKey: ['floorLayout'] });
            setTimeout(() => {
                setBookingSuccess(null);
                onClose();
            }, 2000);
        },
        onError: (err: any) => {
            setBookingError(err.response?.data?.error || 'Failed to complete reservation.');
        },
    });

    const recurringBookingMutation = useMutation({
        mutationFn: async () => {
            if (!resource) throw new Error('No resource selected');

            const { data } = await api.post('/bookings/recurring', {
                resourceType,
                resourceId: resource.id,
                startTimeHours: '09:00',
                endTimeHours: '17:30',
                repeatDays: selectedDays,
                weeksCount,
                notes: 'Recurring Hybrid Schedule',
            });
            return data;
        },
        onSuccess: (data) => {
            setBookingSuccess(`Scheduled ${data.totalCreated} recurring reservations across ${weeksCount} weeks!`);
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            queryClient.invalidateQueries({ queryKey: ['floorLayout'] });
            setTimeout(() => {
                setBookingSuccess(null);
                onClose();
            }, 2500);
        },
        onError: (err: any) => {
            setBookingError(err.response?.data?.error || 'Recurring schedule conflict.');
        },
    });

    if (!isOpen || !resource) return null;

    const title = resourceType === 'desk' ? (resource as Desk).code : (resource as MeetingRoom).name;
    const subtitle = resourceType === 'desk' 
        ? `${(resource as Desk).label || 'WORKSTATION'} • ${(resource as Desk).equipmentTags || 'Standard Setup'}`
        : `MEETING ROOM • ${(resource as MeetingRoom).capacity} Capacity`;

    const toggleSlot = (slot: string) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot].sort());
        }
    };

    const applyPreset = (preset: 'allDay' | 'morning' | 'afternoon') => {
        if (preset === 'morning') {
            setSelectedSlots(TIME_SLOTS.slice(2, 10)); // 09:00 - 13:00
        } else if (preset === 'afternoon') {
            setSelectedSlots(TIME_SLOTS.slice(10, 19)); // 13:00 - 17:30
        } else {
            setSelectedSlots(TIME_SLOTS.slice(2, 19)); // 09:00 - 17:30
        }
    };

    const toggleWeekday = (day: number) => {
        if (selectedDays.includes(day)) {
            if (selectedDays.length > 1) {
                setSelectedDays(selectedDays.filter((d) => d !== day));
            }
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                        {resourceType === 'meeting_room' && (resource as MeetingRoom).requiresApproval && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                Approval Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    aria-label="Close schedule drawer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60">
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setIsRecurringMode(false)}
                        className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            !isRecurringMode
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" /> Single Reservation
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRecurringMode(true)}
                        className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            isRecurringMode
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Repeat className="w-3.5 h-3.5" /> Recurring Hybrid
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Feedback Alerts */}
                {bookingSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{bookingSuccess}</span>
                    </div>
                )}
                {bookingError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{bookingError}</span>
                    </div>
                )}

                {/* Recurring Options */}
                {isRecurringMode ? (
                    <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                                Repeat Every Week on:
                            </label>
                            <div className="flex items-center gap-2">
                                {WEEKDAYS.map((day) => {
                                    const isSelected = selectedDays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleWeekday(day.value)}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">Repeat Duration:</span>
                                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{weeksCount} Weeks Series</span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="12"
                                step="2"
                                value={weeksCount}
                                onChange={(e) => setWeeksCount(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                                <span>2 wks</span>
                                <span>6 wks</span>
                                <span>12 wks</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-800/40 text-[11px] text-slate-600 dark:text-slate-300">
                            ✨ Automatically books this workstation from <strong>09:00 to 17:30</strong> on your selected weekdays for the next {weeksCount} weeks.
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Day selector pills */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Select Booking Date (UK Format: {formatDateUK(selectedDate)})
                                </label>
                                <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
                                    {formatDateUK(selectedDate)}
                                </span>
                            </div>
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
                                            <span className="block text-[10px] uppercase opacity-75">{formatDayLabel(d).split(' ')[0]}</span>
                                            <span className="block text-base font-bold">{d.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Quick Interval Presets
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => applyPreset('allDay')}
                                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Full Day (9-5)
                                </button>
                                <button
                                    onClick={() => applyPreset('morning')}
                                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning (9-1)
                                </button>
                                <button
                                    onClick={() => applyPreset('afternoon')}
                                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Sunset className="w-3.5 h-3.5 text-indigo-500" /> Afternoon (1-5:30)
                                </button>
                            </div>
                        </div>

                        {/* Interactive Timeline Slots */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Custom 30-Minute Time Slots ({selectedSlots.length} selected)
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {TIME_SLOTS.map((slot) => {
                                    const isSelected = selectedSlots.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => toggleSlot(slot)}
                                            className={`py-2 px-1 rounded-lg text-xs font-mono font-medium transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <button
                    type="button"
                    onClick={() => {
                        if (isRecurringMode) {
                            recurringBookingMutation.mutate();
                        } else {
                            singleBookingMutation.mutate();
                        }
                    }}
                    disabled={singleBookingMutation.isPending || recurringBookingMutation.isPending}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isRecurringMode
                        ? recurringBookingMutation.isPending ? 'Scheduling Recurring Series...' : `Confirm ${weeksCount}-Week Hybrid Schedule`
                        : singleBookingMutation.isPending ? 'Reserving...' : `Confirm Reservation (${formatDateUK(selectedDate)})`}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ScheduleDrawer;