'use client';

import { useState } from 'react';
import { MessageSquarePlus, Bug, Sparkles, AlertCircle, X, CheckCircle2, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

export const FeedbackFAB = () => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'bug' | 'feature' | 'facility'>('bug');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (type === 'bug' || type === 'facility') {
                const telemetry = {
                    title: type === 'facility' ? `[Facility] ${title}` : title,
                    description,
                    routePath: typeof window !== 'undefined' ? window.location.pathname : '',
                    browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                    osInfo: typeof navigator !== 'undefined' ? navigator.platform : '',
                    viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
                };
                const { data } = await api.post('/bugs', telemetry);
                return data;
            } else {
                const { data } = await api.post('/feedback/features', {
                    title,
                    problemStatement: description,
                    businessImpact: 'Submitted via Quick FAB launcher',
                    category: 'Quick Proposal',
                });
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allBugs'] });
            queryClient.invalidateQueries({ queryKey: ['publicFeatures'] });
            setSuccessMsg(type === 'feature' ? 'Feature idea submitted for moderation!' : 'Issue logged with live telemetry.');
            setTitle('');
            setDescription('');
            setTimeout(() => {
                setSuccessMsg(null);
                setIsOpen(false);
            }, 2000);
        },
    });

    if (!isAuthenticated) return null;

    return (
        <>
            {/* Floating Action Button (Bottom-Right) */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Quick Feedback Dialog"
                    className="group relative flex items-center gap-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3.5 shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                >
                    <MessageSquarePlus className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs opacity-0 transition-all duration-300 group-hover:max-w-xs group-hover:opacity-100 font-bold">
                        Feedback / Bug Report
                    </span>
                </button>
            </div>

            {/* Quick Feedback Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquarePlus className="w-5 h-5 text-blue-500" /> Quick Feedback & Issue Reporter
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {successMsg ? (
                            <div className="p-6 text-center space-y-2">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Thank You!</h4>
                                <p className="text-xs text-slate-500">{successMsg}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Type Selector */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'bug', label: 'App Bug', icon: Bug },
                                        { id: 'feature', label: 'Idea', icon: Sparkles },
                                        { id: 'facility', label: 'Facility', icon: AlertCircle },
                                    ].map((t) => {
                                        const Icon = t.icon;
                                        const active = type === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id as any)}
                                                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                                    active
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                                                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {type === 'bug' ? 'Issue Summary' : type === 'feature' ? 'Feature Title' : 'Facility Problem'}
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={type === 'bug' ? 'e.g., Error on floor plan zoom' : type === 'feature' ? 'e.g., Dark mode calendar' : 'e.g., 1F Coffee machine refill'}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Details</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Add relevant context..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={() => submitMutation.mutate()}
                                    disabled={submitMutation.isPending || !title || !description}
                                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackFAB;