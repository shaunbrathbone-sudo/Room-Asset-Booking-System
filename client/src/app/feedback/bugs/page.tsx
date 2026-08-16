'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bug, AlertCircle, CheckCircle2, Search, Plus, ThumbsUp, Sparkles, X, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface BugItem {
    id: string;
    userId: string;
    reporterName: string;
    officeName?: string;
    title: string;
    description: string;
    routePath: string | null;
    objectId: string | null;
    multiplierCount: number;
    status: string;
    resolutionNotes: string | null;
    createdAt: string;
}

const BugTrackerPage = () => {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duplicates, setDuplicates] = useState<BugItem[]>([]);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { data: bugs = [], isLoading } = useQuery<BugItem[]>({
        queryKey: ['allBugs'],
        queryFn: async () => {
            const { data } = await api.get('/bugs');
            return data;
        },
    });

    useEffect(() => {
        if (title.trim().length < 4) {
            setDuplicates([]);
            return;
        }

        const debounce = setTimeout(async () => {
            try {
                const { data } = await api.get('/bugs/check-duplicates', { params: { q: title } });
                setDuplicates(data);
            } catch {
                setDuplicates([]);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [title]);

    const meTooMutation = useMutation({
        mutationFn: async (bugId: string) => {
            const { data } = await api.post(`/bugs/${bugId}/me-too`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allBugs'] });
            setSuccessMsg('Subscribed to incident multiplier!');
            setTimeout(() => setSuccessMsg(null), 3000);
        },
    });

    const reportMutation = useMutation({
        mutationFn: async () => {
            const telemetry = {
                title,
                description,
                routePath: typeof window !== 'undefined' ? window.location.pathname : '',
                browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                osInfo: typeof navigator !== 'undefined' ? navigator.platform : '',
                viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
            };

            const { data } = await api.post('/bugs', telemetry);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allBugs'] });
            setReportModalOpen(false);
            setTitle('');
            setDescription('');
            setDuplicates([]);
            setSuccessMsg('Bug report logged with client telemetry.');
            setTimeout(() => setSuccessMsg(null), 3000);
        },
    });

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Issue Tracker & Bug Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Report platform bugs with telemetry, or boost active incidents with +1 Multipliers.
                    </p>
                </div>

                {isAuthenticated && (
                    <button
                        onClick={() => setReportModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-500/20 transition-all self-start"
                    >
                        <Bug className="w-4 h-4" /> Report an Issue
                    </button>
                )}
            </div>

            {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : bugs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">All systems operational</h2>
                    <p className="text-sm text-slate-500 mt-1">No open bugs reported.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bugs.map((bug) => (
                        <div
                            key={bug.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm hover:border-red-400 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex flex-col items-center justify-center min-w-[56px]">
                                    <Bug className="w-5 h-5" />
                                    <span className="text-[11px] font-bold mt-1">×{bug.multiplierCount}</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            bug.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/40 text-green-700' :
                                            bug.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700' :
                                            'bg-amber-100 dark:bg-amber-900/40 text-amber-700'
                                        }`}>
                                            {bug.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        {bug.officeName && (
                                            <span className="text-xs text-slate-500">📍 {bug.officeName}</span>
                                        )}
                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{bug.title}</h2>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{bug.description}</p>

                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                        <span>Reported by <strong>{bug.reporterName}</strong></span>
                                        {bug.routePath && <span>• Route: <code className="font-mono">{bug.routePath}</code></span>}
                                    </div>
                                </div>
                            </div>

                            {isAuthenticated && bug.status !== 'resolved' && (
                                <button
                                    onClick={() => meTooMutation.mutate(bug.id)}
                                    disabled={meTooMutation.isPending}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 self-end md:self-start whitespace-nowrap"
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" /> I Have This Issue Too
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Report Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bug className="w-5 h-5 text-red-500" /> Report Issue with Telemetry
                            </h3>
                            <button onClick={() => setReportModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Summary</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., 3D Floor plan camera stuck when zooming on Floor 1"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>

                            {duplicates.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" /> Existing Similar Issues Found:
                                    </p>
                                    <div className="space-y-2">
                                        {duplicates.map((d) => (
                                            <div key={d.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
                                                <div className="truncate">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{d.title}</span>
                                                    <span className="text-slate-400 ml-2">({d.multiplierCount} affected)</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        meTooMutation.mutate(d.id);
                                                        setReportModalOpen(false);
                                                    }}
                                                    className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-[10px] whitespace-nowrap"
                                                >
                                                    Boost (+1)
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Steps to Reproduce & Expected Behaviour</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Describe what happened..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>

                            <button
                                onClick={() => reportMutation.mutate()}
                                disabled={reportMutation.isPending || !title || !description}
                                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                            >
                                {reportMutation.isPending ? 'Submitting...' : 'Submit Bug Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BugTrackerPage;