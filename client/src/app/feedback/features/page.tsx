'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Plus, Sparkles, CheckCircle2, Clock, X, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface FeatureItem {
    id: string;
    userId: string;
    authorName: string;
    title: string;
    problemStatement: string;
    businessImpact: string;
    category: string;
    status: string;
    moderationNotes: string | null;
    upvotesCount: number;
    hasUserUpvoted?: boolean;
    createdAt: string;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
    pending_moderation: { label: 'Pending Review', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300' },
    approved: { label: 'Community Idea', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300' },
    planned: { label: 'Planned', bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-300' },
    in_development: { label: 'In Development', bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-300' },
    completed: { label: 'Completed & Live', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300' },
    rejected: { label: 'Declined', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300' },
};

const FeaturesPage = () => {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';

    const [activeTab, setActiveTab] = useState<'board' | 'pending'>('board');
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newProblem, setNewProblem] = useState('');
    const [newImpact, setNewImpact] = useState('');
    const [newCategory, setNewCategory] = useState('general');

    const { data: publicFeatures = [], isLoading: publicLoading } = useQuery<FeatureItem[]>({
        queryKey: ['publicFeatures'],
        queryFn: async () => {
            const { data } = await api.get('/feedback/features');
            return data;
        },
    });

    const { data: pendingFeatures = [] } = useQuery<FeatureItem[]>({
        queryKey: ['pendingFeatures'],
        queryFn: async () => {
            const { data } = await api.get('/feedback/features/pending');
            return data;
        },
        enabled: isSuperAdmin,
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/feedback/features', {
                title: newTitle,
                problemStatement: newProblem,
                businessImpact: newImpact,
                category: newCategory,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publicFeatures'] });
            setSubmitModalOpen(false);
            setNewTitle('');
            setNewProblem('');
            setNewImpact('');
        },
    });

    const upvoteMutation = useMutation({
        mutationFn: async (featureId: string) => {
            const { data } = await api.post(`/feedback/features/${featureId}/upvote`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publicFeatures'] });
        },
    });

    const moderateMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
            const { data } = await api.put(`/feedback/features/${id}/moderate`, { status, notes });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publicFeatures'] });
            queryClient.invalidateQueries({ queryKey: ['pendingFeatures'] });
        },
    });

    const list = activeTab === 'board' ? publicFeatures : pendingFeatures;

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Product Roadmap & Community Ideas</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Suggest features, upvote team proposals, and track implementation status.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('board')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                    activeTab === 'board' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                Public Board
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                                    activeTab === 'pending' ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600' : 'text-slate-500'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5" /> Pending Moderation ({pendingFeatures.length})
                            </button>
                        </div>
                    )}

                    {isAuthenticated && (
                        <button
                            onClick={() => setSubmitModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Propose Feature
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            {publicLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : list.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">No feature requests</h2>
                    <p className="text-sm text-slate-500 mt-1">Be the first to submit a workspace idea for community review.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((item) => {
                        const badge = STATUS_BADGES[item.status] || STATUS_BADGES.approved;
                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm hover:border-blue-400 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Upvote Button */}
                                    {activeTab === 'board' && (
                                        <button
                                            onClick={() => isAuthenticated ? upvoteMutation.mutate(item.id) : null}
                                            disabled={!isAuthenticated || upvoteMutation.isPending}
                                            className={`p-3 rounded-2xl border flex flex-col items-center justify-center min-w-[60px] transition-all ${
                                                item.hasUserUpvoted
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                                            }`}
                                        >
                                            <ThumbsUp className={`w-5 h-5 ${item.hasUserUpvoted ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                                            <span className="text-xs font-bold mt-1">{item.upvotesCount}</span>
                                        </button>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                                                {badge.label}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </div>

                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h2>

                                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                            <div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200">Problem: </span>
                                                {item.problemStatement}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200">Business Impact: </span>
                                                {item.businessImpact}
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-3">
                                            Proposed by <span className="font-semibold text-slate-600 dark:text-slate-300">{item.authorName}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Admin Moderation Actions */}
                                {isSuperAdmin && activeTab === 'pending' && (
                                    <div className="flex items-center gap-2 self-end md:self-start">
                                        <button
                                            onClick={() => moderateMutation.mutate({ id: item.id, status: 'approved' })}
                                            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                                        >
                                            Approve & Publish
                                        </button>
                                        <button
                                            onClick={() => moderateMutation.mutate({ id: item.id, status: 'rejected', notes: 'Does not align with current roadmap' })}
                                            className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {isSuperAdmin && activeTab === 'board' && (
                                    <div className="self-end md:self-start flex items-center gap-2">
                                        <select
                                            value={item.status}
                                            onChange={(e) => moderateMutation.mutate({ id: item.id, status: e.target.value })}
                                            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                                        >
                                            <option value="approved">Community Idea</option>
                                            <option value="planned">Planned</option>
                                            <option value="in_development">In Development</option>
                                            <option value="completed">Completed</option>
                                            <option value="rejected">Declined</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Propose Modal */}
            {submitModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Propose Feature / Enhancement</h3>
                            <button onClick={() => setSubmitModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feature Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g., Weekly recurring desk reservation schedule"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Problem Statement</label>
                                <textarea
                                    value={newProblem}
                                    onChange={(e) => setNewProblem(e.target.value)}
                                    rows={3}
                                    placeholder="What pain point or inefficiency are you experiencing?"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Impact & Productivity Gain</label>
                                <textarea
                                    value={newImpact}
                                    onChange={(e) => setNewImpact(e.target.value)}
                                    rows={2}
                                    placeholder="How will this improve team collaboration or time saving?"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                >
                                    <option value="3D Floor Plan">3D Floor Plan & Navigation</option>
                                    <option value="Booking Engine">Booking Engine & Schedules</option>
                                    <option value="Fleet & Assets">Fleet & Corporate Assets</option>
                                    <option value="Hardware / Kiosk">Room Display Tablets & Kiosk</option>
                                    <option value="General">General Platform</option>
                                </select>
                            </div>

                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending || !newTitle || !newProblem || !newImpact}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                            >
                                {submitMutation.isPending ? 'Submitting...' : 'Submit to Moderation Queue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturesPage;