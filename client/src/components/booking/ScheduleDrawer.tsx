'use client';

import { useState } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Monitor, Wifi, Users } from 'lucide-react';
import type { Desk, MeetingRoom } from '@/types/spatial';

interface ScheduleDrawerProps {
    resource: Desk | MeetingRoom | null;
    resourceType: 'desk' | 'meeting_room';
    isOpen: boolean;
    onClose: () => void;
}

/** Generate the next N days from today */
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

export const ScheduleDrawer = ({ resource, resourceType, isOpen, onClose }: ScheduleDrawerProps) => {
    const [viewDays, setViewDays] = useState<7 | 14>(7);
    const days = getNextDays(viewDays);

    if (!isOpen || !resource) return null;

    const title = resourceType === 'desk' ? (resource as Desk).code : (resource as MeetingRoom).name;
    const subtitle = resourceType === 'meeting_room'
        ? `Capacity: ${(resource as MeetingRoom).capacity}`
        : (resource as Desk).label || 'Hot Desk';

    return (
        <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 flex flex-col transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
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
            <div className="flex gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <Monitor className="w-3 h-3" /> Dual Monitor
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    <Wifi className="w-3 h-3" /> Ethernet
                </span>
                {resourceType === 'meeting_room' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                        <Users className="w-3 h-3" /> {(resource as MeetingRoom).capacity} seats
                    </span>
                )}
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between px-5 py-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewDays(7)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewDays === 7
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        7 Days
                    </button>
                    <button
                        onClick={() => setViewDays(14)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewDays === 14
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        14 Days
                    </button>
                </div>
            </div>

            {/* Schedule grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="space-y-2">
                    {days.map((day, i) => {
                        const isToday = i === 0;
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                            <div
                                key={i}
                                className={`rounded-xl border p-3 transition-colors ${
                                    isToday
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : isWeekend
                                          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50'
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`font-semibold text-sm ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                            {formatDayLabel(day)}
                                            {isToday && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Today</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDateUK(day)}</p>
                                    </div>
                                    {!isWeekend && (
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Time slots (scaffold) */}
                                {!isWeekend && (
                                    <div className="mt-2 flex gap-1">
                                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                                            <div
                                                key={time}
                                                className="flex-1 h-6 rounded bg-green-200/50 dark:bg-green-900/30 border border-green-300/50 dark:border-green-700/30 flex items-center justify-center"
                                                title={`${time} - Available`}
                                            >
                                                <span className="text-[9px] text-green-700 dark:text-green-400">{time.split(':')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700">
                <button
                    disabled
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed"
                    title="Booking engine coming in Phase 2"
                >
                    Book Now (Coming Soon)
                </button>
            </div>
        </div>
    );
};