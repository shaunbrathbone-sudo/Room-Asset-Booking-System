'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    CheckCircle2,
    Sun,
    CloudRain,
    CloudSun,
    Coffee,
    Utensils,
    ShieldCheck,
    AlertCircle,
    X,
    CalendarCheck,
    Sparkles
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Desk, MeetingRoom } from '@/types/spatial';

interface ContextualBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Desk | MeetingRoom | null;
    resourceType?: 'desk' | 'meeting_room';
    officeName?: string;
    floorName?: string;
}

// Generate next 7 days for rolling week strip
const getNextDays = (count: number = 7): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
};

export const ContextualBookingModal: React.FC<ContextualBookingModalProps> = ({
    isOpen,
    onClose,
    resource,
    resourceType = 'desk',
    officeName = 'London HQ',
    floorName = 'Level 4'
}) => {
    const queryClient = useQueryClient();
    const days = getNextDays(7);
    const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingRef, setBookingRef] = useState<string | null>(null);

    const isDesk = resourceType === 'desk';
    const resourceCode = resource ? (resource as Desk).label || (resource as Desk).code || resource.id : 'D1';

    // Format date string in UK format (DD/MM/YYYY) per Rule 16
    const formattedUKDate = selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const dayName = selectedDate.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayNumber = selectedDate.getDate();

    // Booking mutation
    const bookingMutation = useMutation({
        mutationFn: async () => {
            const startISO = new Date(selectedDate);
            startISO.setHours(9, 0, 0, 0);
            const endISO = new Date(selectedDate);
            endISO.setHours(17, 0, 0, 0);

            const payload = {
                resourceId: resource?.id,
                resourceType: resourceType === 'desk' ? 'desk' : 'room',
                startTime: startISO.toISOString(),
                endTime: endISO.toISOString(),
                showAs: isDesk ? 'free' : 'busy',
                title: isDesk ? `Desk ${resourceCode} Reservation` : `Meeting Room Reservation`
            };

            const { data } = await api.post('/bookings', payload);
            return data;
        },
        onSuccess: (data) => {
            setIsSuccess(true);
            setBookingRef(data?.id || `BK-${Math.floor(100000 + Math.random() * 900000)}`);
            queryClient.invalidateQueries({ queryKey: ['floorPlan'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    const handleConfirm = () => {
        bookingMutation.mutate();
    };

    const handleClose = () => {
        setIsSuccess(false);
        bookingMutation.reset();
        onClose();
    };

    if (!resource) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
                {/* Header (Figure 3 Style) */}
                <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            FlexDesk — {formattedUKDate}
                        </DialogTitle>
                        <Badge
                            variant="outline"
                            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-0.5 font-bold"
                        >
                            Standard UK BST
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Review your workspace configuration, contextual meteorological forecast, and amenities.
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                            Reservation Confirmed!
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                            Your reservation for <strong className="text-slate-900 dark:text-white">Desk {resourceCode}</strong> has been secured for {formattedUKDate}.
                        </p>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl inline-block text-xs font-mono text-slate-600 dark:text-slate-300">
                            Reference: {bookingRef} · Calendar Synchronised
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleClose} className="px-6 font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                                Return to Floor Plan
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* 3-Column Layout (Figure 3 Spec) */
                    <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                        {/* Column 1: Week Calendar Strip & Synchronisation Status (3 cols) */}
                        <div className="md:col-span-4 p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/40">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Select Date (UK Format):
                            </span>

                            {/* Rolling 7-day strip */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-4 gap-1.5">
                                {days.map((d) => {
                                    const isSelected = d.toDateString() === selectedDate.toDateString();
                                    const dayStr = d.toLocaleDateString('en-GB', { weekday: 'short' });
                                    const dateNum = d.getDate();

                                    return (
                                        <button
                                            key={d.toISOString()}
                                            type="button"
                                            onClick={() => setSelectedDate(d)}
                                            className={cn(
                                                'p-2 rounded-xl text-center transition-all border flex flex-col items-center justify-center',
                                                isSelected
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-emerald-400'
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-semibold opacity-80">{dayStr}</span>
                                            <span className="text-sm font-extrabold">{dateNum}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Calendar Synchronization Status Pill (Section 3.3) */}
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Calendar Synchronisation
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Outlook / Google:</span>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'text-[10px] font-extrabold font-mono',
                                            isDesk
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                        )}
                                    >
                                        {isDesk ? 'Marked as: Free' : 'Marked as: Busy'}
                                    </Badge>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    {isDesk
                                        ? 'Desk booking will not block colleagues from scheduling meetings with you.'
                                        : 'Meeting room reserves your session and generates Microsoft Teams links.'}
                                </p>
                            </div>
                        </div>

                        {/* Column 2: Contextual Intelligence (Weather & Amenities) (5 cols) */}
                        <div className="md:col-span-5 p-6 space-y-5">
                            {/* Booking Location Details */}
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Booking Details
                                </span>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{officeName} — {floorName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                                        <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block text-center text-[9px] text-white font-mono">D</span>
                                        <span>Desk {resourceCode} (Sit/Stand Electric)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>09:00 - 17:00 BST (Standard Day)</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3-Day Weather Forecast Preview (Figure 3) */}
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Weather Forecast
                                </span>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
                                        <div className="text-[10px] font-bold text-slate-500">Today</div>
                                        <CloudSun className="w-5 h-5 text-amber-500 mx-auto" />
                                        <div className="text-xs font-black text-slate-900 dark:text-white">18°C / 12°C</div>
                                        <div className="text-[9px] text-slate-400 truncate">Sunny spells</div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
                                        <div className="text-[10px] font-bold text-slate-500">Tomorrow</div>
                                        <CloudRain className="w-5 h-5 text-blue-400 mx-auto" />
                                        <div className="text-xs font-black text-slate-900 dark:text-white">16°C / 10°C</div>
                                        <div className="text-[9px] text-slate-400 truncate">Light rain</div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
                                        <div className="text-[10px] font-bold text-slate-500">Thu</div>
                                        <Sun className="w-5 h-5 text-amber-400 mx-auto" />
                                        <div className="text-xs font-black text-slate-900 dark:text-white">20°C / 14°C</div>
                                        <div className="text-[9px] text-slate-400 truncate">Mostly sunny</div>
                                    </div>
                                </div>
                            </div>

                            {/* Office Amenities (Figure 3) */}
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Office Amenities
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">Kitchen Facilities</p>
                                            <p className="text-[10px] text-slate-500">Full kitchen access</p>
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                            <Coffee className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">On-site Cafe</p>
                                            <p className="text-[10px] text-slate-500">Open 08:00 - 16:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Confirmation Summary & CTA (3 cols) */}
                        <div className="md:col-span-3 p-6 flex flex-col justify-between space-y-6 bg-slate-50/30 dark:bg-slate-900/20">
                            <div className="space-y-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Confirm Desk Booking
                                </span>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs shadow-xs">
                                    <div className="font-extrabold text-slate-900 dark:text-white">
                                        {officeName}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300">
                                        {floorName} · Desk {resourceCode}
                                    </div>
                                    <div className="text-slate-500 text-[11px]">
                                        09:00 - 17:00 BST
                                    </div>
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Instant Auto-Confirmation</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                        <span>15-Minute Grace Period</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    onClick={handleConfirm}
                                    disabled={bookingMutation.isPending}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md h-10"
                                >
                                    {bookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={bookingMutation.isPending}
                                    className="w-full text-xs font-semibold h-10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
