'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Monitor, Tv, Car, Laptop, CheckCircle2, AlertCircle, Trash2, QrCode, ExternalLink, Heart, Star, Sparkles, Zap } from 'lucide-react';
import { useFavouriteDesks } from '@/hooks/useFavouriteDesks';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { BookingDetails } from '@/types/booking';

const formatDateUK = (isoStr: string) => {
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return isoStr;
    }
};

const formatTime = (isoStr: string) => {
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoStr;
    }
};

const BookingsPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
    const [qrModalBooking, setQrModalBooking] = useState<BookingDetails | null>(null);
    const { favourites, toggleFavourite, isLoading: favLoading } = useFavouriteDesks();

    const { data: bookings = [], isLoading } = useQuery<BookingDetails[]>({
        queryKey: ['userBookings'],
        queryFn: async () => {
            const { data } = await api.get('/bookings/my');
            return data;
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/bookings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
        },
    });

    const checkinMutation = useMutation({
        mutationFn: async (token: string) => {
            await api.post('/bookings/checkin-by-token', { token });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
        },
    });

    const now = new Date();
    const filtered = bookings.filter((b) => {
        const end = new Date(b.endTime);
        if (activeTab === 'upcoming') return end >= now && b.status !== 'cancelled';
        if (activeTab === 'past') return end < now || b.status === 'cancelled';
        return true;
    });

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* My Favourite Desks & 1-Click Repeat Booking */}
            {favourites.length > 0 && (
                <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 border border-amber-300/60 dark:border-amber-800/60 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-amber-800/40 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                                <Star className="w-5 h-5 fill-slate-950" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Quick Rebooking
                                </span>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    My Favourite Desks & Workstations
                                </h2>
                            </div>
                        </div>

                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                            {favourites.length} Saved {favourites.length === 1 ? 'Station' : 'Stations'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favourites.map((fav) => (
                            <div
                                key={fav.desk_id}
                                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                {fav.desk_code}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                                                {fav.desk_label || 'Dedicated Workstation'}
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleFavourite(fav.desk_id)}
                                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                            title="Remove from favourites"
                                            aria-label="Remove from favourites"
                                        >
                                            <Heart className="w-4 h-4 fill-rose-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                            <span className="truncate">{fav.office_name} • {fav.floor_name}</span>
                                        </div>
                                        {fav.equipment_tags && (
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                                                {fav.equipment_tags}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={`/explore/${fav.country_slug}/${fav.office_slug}/${fav.floor_slug}`}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                                >
                                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Repeat Booking for This Desk</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Reservations</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View active desk reservations, check into spaces, and manage equipment loans.
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
                    {(['upcoming', 'past', 'all'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                activeTab === tab
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">No bookings found</h2>
                    <p className="text-sm text-slate-500 mt-1">Explore our 3D interactive floor plans to reserve your first space.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((booking) => {
                        const isConfirmed = booking.status === 'confirmed';
                        const isCheckedIn = booking.status === 'checked_in' || booking.checkedIn;
                        const isPending = booking.status === 'pending_approval';
                        const isCancelled = booking.status === 'cancelled';

                        return (
                            <div
                                key={booking.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-blue-400 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        {booking.resourceType === 'desk' && <Monitor className="w-6 h-6" />}
                                        {booking.resourceType === 'meeting_room' && <Tv className="w-6 h-6" />}
                                        {booking.resourceType === 'asset' && <Car className="w-6 h-6" />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {booking.resourceName}
                                            </h2>
                                            {booking.resourceCode && (
                                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {booking.resourceCode}
                                                </span>
                                            )}
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                isCheckedIn ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                                isConfirmed ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                                isPending ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            }`}>
                                                {isCheckedIn ? 'Checked In' :
                                                 isConfirmed ? 'Confirmed' :
                                                 isPending ? 'Pending Approval' : 'Cancelled'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {booking.officeName || 'Leicester Hub'}
                                            {booking.floorName && ` • ${booking.floorName}`}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                {formatDateUK(booking.startTime)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-center">
                                    {booking.checkinToken && !isCheckedIn && !isCancelled && (
                                        <>
                                            <button
                                                onClick={() => checkinMutation.mutate(booking.checkinToken!)}
                                                disabled={checkinMutation.isPending}
                                                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-green-500/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Check In
                                            </button>
                                            <button
                                                onClick={() => setQrModalBooking(booking)}
                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                title="View QR Code"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {!isCancelled && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to cancel this reservation?')) {
                                                    cancelMutation.mutate(booking.id);
                                                }
                                            }}
                                            disabled={cancelMutation.isPending}
                                            className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Cancel Reservation"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QR Modal */}
            {qrModalBooking && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Check-in QR Code</h3>
                        <p className="text-xs text-slate-500 mb-6">{qrModalBooking.resourceName}</p>

                        <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 mb-6">
                            <QrCode className="w-28 h-28 text-blue-600" />
                        </div>

                        <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 mb-6">
                            Token: {qrModalBooking.checkinToken}
                        </p>

                        <button
                            onClick={() => setQrModalBooking(null)}
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;