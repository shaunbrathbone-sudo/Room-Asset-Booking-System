'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const AdminOfficeGuideEditorPage = () => {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const slug = params.slug as string;

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [footerBanner, setFooterBanner] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { data: guideData, isLoading } = useQuery({
        queryKey: ['officeGuideAdmin', slug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${slug}/guide`);
            return data;
        },
    });

    useEffect(() => {
        if (guideData?.content) {
            setTitle(guideData.content.title || guideData.title || '');
            setSubtitle(guideData.content.subtitle || guideData.subtitle || '');
            setSections(guideData.content.sections || []);
            setFooterBanner(guideData.content.footerBanner || '');
        }
    }, [guideData]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                title,
                subtitle,
                content: {
                    title,
                    subtitle,
                    sections,
                    footerBanner,
                },
            };
            const { data } = await api.put(`/offices/${slug}/guide`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['officeGuideAdmin', slug] });
            queryClient.invalidateQueries({ queryKey: ['officeGuide', slug] });
            setSuccessMsg('Office welcome guide saved and published successfully!');
            setTimeout(() => setSuccessMsg(null), 3500);
        },
    });

    const updateItem = (secIdx: number, itemIdx: number, field: 'label' | 'value', text: string) => {
        const next = [...sections];
        next[secIdx].items[itemIdx][field] = text;
        setSections(next);
    };

    const addItem = (secIdx: number) => {
        const next = [...sections];
        next[secIdx].items.push({ label: 'New Topic', value: 'Details...' });
        setSections(next);
    };

    const removeItem = (secIdx: number, itemIdx: number) => {
        const next = [...sections];
        next[secIdx].items.splice(itemIdx, 1);
        setSections(next);
    };

    const addSection = () => {
        setSections([
            ...sections,
            {
                id: `sec_${Date.now()}`,
                title: 'New Section',
                icon: 'Layers',
                items: [{ label: 'Key Information', value: 'Add details here...' }],
            },
        ]);
    };

    const removeSection = (secIdx: number) => {
        const next = [...sections];
        next.splice(secIdx, 1);
        setSections(next);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <Link
                        href={`/explore/united-kingdom/${slug}/guide`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Guide View
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <ShieldCheck className="w-7 h-7 text-blue-600" /> Office Guide Content Manager
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Editing induction booklet and arrival instructions for <strong className="text-slate-900 dark:text-white">{slug}</strong>.
                    </p>
                </div>

                <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all self-start sm:self-auto"
                >
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? 'Saving Changes...' : 'Publish Guide Updates'}
                </button>
            </div>

            {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Header Configuration Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-8 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Hero Header & Subtitle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guide Main Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subtitle / Tagline</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Section Cards List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guide Content Sections</h2>
                    <button
                        onClick={addSection}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Section
                    </button>
                </div>

                {sections.map((section, secIdx) => (
                    <div
                        key={section.id || secIdx}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => {
                                    const next = [...sections];
                                    next[secIdx].title = e.target.value;
                                    setSections(next);
                                }}
                                className="text-base font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:outline-none px-1"
                            />
                            <button
                                onClick={() => removeSection(secIdx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 pt-2">
                            {section.items?.map((item: any, itemIdx: number) => (
                                <div key={itemIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                                    <div className="w-1/3">
                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Topic / Field</label>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => updateItem(secIdx, itemIdx, 'label', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="w-2/3">
                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Description & Guidelines</label>
                                        <textarea
                                            value={item.value}
                                            rows={2}
                                            onChange={(e) => updateItem(secIdx, itemIdx, 'value', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeItem(secIdx, itemIdx)}
                                        className="p-1 text-slate-400 hover:text-red-500 mt-5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => addItem(secIdx)}
                                className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 text-xs font-semibold flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Topic Line
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Banner Editor */}
            <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Welcome Footer Banner Text</h2>
                <input
                    type="text"
                    value={footerBanner}
                    onChange={(e) => setFooterBanner(e.target.value)}
                    placeholder="Welcome to the team! Make yourself at home from Day One."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                />
            </div>
        </div>
    );
};

export default AdminOfficeGuideEditorPage;