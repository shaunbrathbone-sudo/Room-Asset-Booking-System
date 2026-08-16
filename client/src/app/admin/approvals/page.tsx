'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, X, Calendar, Clock, User, CheckCircle2, Car, Tv } from 'lucide-react';
import { api } from '@/lib/api';
import type { BookingDetails } from '@/types/booking';

const AdminApprovalsPage = () => {
    const queryClient = useQueryClient();
    const [rejectModalId, setRejectModalId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const { data: approvals = [], isLoading } = useQuery<BookingDetails[]>({
        queryKey: ['adminApprovals'],
        queryFn: async () => {
            const { data } = await api.get('/admin/approvals');
            return data;
        },
    });

    const decisionMutation = useMutation({
        mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) => {
            const { data } = await api.post(`/admin/approvals/${id}/decision`, { action, note });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminApprovals'] });
            setRejectModalId(null);
            setRejectNote('');
            setActionMsg(data.message || 'Action completed.');
            setTimeout(() => setActionMsg(null), 3000);
        },
    });

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-blue-600" /> Facility Approvals Queue
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Review and authorize reservation requests for executive boardrooms and company fleet pool vehicles.
                </p>
            </div>

            {actionMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : approvals.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Approvals Queue Clear</h2>
                    <p className="text-sm text-slate-500 mt-1">All resource requests have been processed.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {approvals.map((b) => (
                        <div
                            key={b.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
                                    {b.resourceType === 'meeting_room' ? <Tv className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{b.resourceName}</h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                            Pending Approval
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                            {b.userFullName} ({b.userEmail})
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            {new Date(b.startTime).toLocaleDateString('en-GB')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                                            {new Date(b.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} –{' '}
                                            {new Date(b.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button
                                    onClick={() => decisionMutation.mutate({ id: b.id, action: 'approve' })}
                                    disabled={decisionMutation.isPending}
                                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-green-500/20"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => setRejectModalId(b.id)}
                                    disabled={decisionMutation.isPending}
                                    className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reject Reservation Request</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Mandatory requirement: Please provide a justification note to explain why this request is declined.
                        </p>

                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            rows={3}
                            placeholder="e.g. Executive Boardroom is reserved for scheduled Board meeting."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectModalId(null)}
                                className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => decisionMutation.mutate({ id: rejectModalId, action: 'reject', note: rejectNote })}
                                disabled={!rejectNote.trim() || decisionMutation.isPending}
                                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApprovalsPage;