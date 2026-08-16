'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Users, Plus } from 'lucide-react';
import { api } from '@/lib/api';

const KioskRoomPage = () => {
    const params = useParams();
    const queryClient = useQueryClient();
    const roomId = params.id as string;
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: kioskData, isLoading } = useQuery({
        queryKey: ['kioskRoom', roomId],
        queryFn: async () => {
            const { data } = await api.get(`/kiosk/rooms/${roomId}`);
            return data;
        },
        refetchInterval: 10000,
    });

    const adhocBookMutation = useMutation({
        mutationFn: async (durationMins: number) => {
            const { data } = await api.post(`/kiosk/rooms/${roomId}/adhoc-book`, { durationMins });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kioskRoom', roomId] });
        },
    });

    if (isLoading || !kioskData) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { room, isOccupied, currentMeeting, upcomingMeetings } = kioskData;

    return (
        <div className={`min-h-screen flex flex-col justify-between p-8 sm:p-12 select-none ${
            isOccupied
                ? 'bg-gradient-to-br from-red-950 via-slate-950 to-black text-white'
                : 'bg-gradient-to-br from-green-950 via-slate-950 to-black text-white'
        }`}>
            {/* Header: Room Name & Live Clock */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{room.name}</h1>
                    <p className="text-base text-slate-400 mt-1 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Capacity: {room.capacity} seats • {room.officeName} ({room.floorName})
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
                        {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </div>

            {/* Centre State: Giant High-Contrast Status */}
            <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
                <div className={`inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-2xl sm:text-3xl font-black uppercase tracking-widest mb-6 shadow-2xl transition-all ${
                    isOccupied
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-red-500/30'
                        : 'bg-green-500/20 text-green-400 border-2 border-green-500 shadow-green-500/30 animate-pulse'
                }`}>
                    <span className={`w-4 h-4 rounded-full ${isOccupied ? 'bg-red-500' : 'bg-green-500'}`} />
                    {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                </div>

                {isOccupied && currentMeeting ? (
                    <div>
                        <h2 className="text-3xl font-bold">{currentMeeting.organizerName}'s Meeting</h2>
                        <p className="text-lg text-slate-400 mt-2 font-mono">
                            {new Date(currentMeeting.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {new Date(currentMeeting.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg text-slate-300 max-w-md">
                            This space is currently free. Touch below to start an instant ad-hoc session.
                        </p>
                        {/* 1-Touch Quick Book Buttons */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            {[15, 30, 60].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => adhocBookMutation.mutate(mins)}
                                    disabled={adhocBookMutation.isPending}
                                    className="px-6 py-4 rounded-2xl bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-lg shadow-xl shadow-green-500/30 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> +{mins} Min
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Upcoming Daily Schedule */}
            <div className="border-t border-white/10 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Upcoming Today
                </h3>
                {upcomingMeetings.length === 0 ? (
                    <p className="text-sm text-slate-500">No further bookings scheduled today.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {upcomingMeetings.slice(0, 3).map((m: any, i: number) => (
                            <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                                <p className="font-bold text-white truncate">{m.organizerName}</p>
                                <p className="text-slate-400 font-mono mt-1">
                                    {new Date(m.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} –{' '}
                                    {new Date(m.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KioskRoomPage;