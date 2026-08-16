'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
    Mail, Send, Eye, Code, Save, RefreshCw, 
    Check, Sparkles, Smartphone, Monitor, ArrowLeft, 
    Layers, Clock, Bell, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/auth/AdminGuard';

interface EmailTemplate {
    id: string;
    code: string;
    name: string;
    subject: string;
    preheader: string;
    body_html: string;
    category: string;
    is_active: number;
    updated_at: string;
}

const TEMPLATE_VARIABLES = [
    { tag: '{{userName}}', desc: 'Recipient Name' },
    { tag: '{{officeName}}', desc: 'Office Hub Name' },
    { tag: '{{resourceName}}', desc: 'Desk / Room Name' },
    { tag: '{{floorName}}', desc: 'Floor / Level' },
    { tag: '{{bookingTime}}', desc: 'Date & Time' },
    { tag: '{{wifiDetails}}', desc: 'Wi-Fi & Password' },
    { tag: '{{commuteLink}}', desc: 'Commute Guide URL' },
    { tag: '{{qrCodeUrl}}', desc: 'Check-in QR Code' },
];

export const EmailTemplatesStudioPage = () => {
    const queryClient = useQueryClient();
    const [selectedCode, setSelectedCode] = useState<string>('booking_confirmation');
    const [subject, setSubject] = useState('');
    const [preheader, setPreheader] = useState('');
    const [bodyHtml, setBodyHtml] = useState('');
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [testEmail, setTestEmail] = useState('shaunrathbone@msn.com');
    const [testStatus, setTestStatus] = useState<string | null>(null);

    const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
        queryKey: ['emailTemplates'],
        queryFn: async () => {
            const { data } = await api.get('/admin/email-templates');
            return data;
        },
    });

    const activeTemplate = templates.find((t) => t.code === selectedCode) || templates[0];

    useEffect(() => {
        if (activeTemplate) {
            setSubject(activeTemplate.subject);
            setPreheader(activeTemplate.preheader || '');
            setBodyHtml(activeTemplate.body_html);
            setTestStatus(null);
        }
    }, [activeTemplate]);

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!activeTemplate) return;
            await api.put(`/admin/email-templates/${activeTemplate.id}`, {
                subject,
                preheader,
                bodyHtml,
                isActive: activeTemplate.is_active,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
            setTestStatus('Template saved successfully!');
            setTimeout(() => setTestStatus(null), 3000);
        },
    });

    // Test Send Mutation
    const testSendMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/admin/email-templates/test-send', {
                templateCode: selectedCode,
                recipientEmail: testEmail,
            });
            return data;
        },
        onSuccess: (data) => {
            setTestStatus(data.message);
            setTimeout(() => setTestStatus(null), 5000);
        },
    });

    // Render Preview with dynamic sample replacements
    const getRenderedHtml = () => {
        let rendered = bodyHtml || '';
        const sampleVars: Record<string, string> = {
            userName: 'Shaun Rathbone',
            officeName: '17 Friar Lane, Leicester Hub',
            resourceName: 'Desk LEI-D04 (Creative Pod 1)',
            floorName: '1st Floor Flexible Suite',
            bookingTime: 'Tomorrow, 09:00 - 17:30 BST',
            wifiDetails: 'Cloudfy / WCL (Key: FriarLane2026)',
            commuteLink: 'http://localhost:3000/explore/united-kingdom/leicester-hub',
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BOOKING-17FRIAR-LEI-D04',
        };

        Object.entries(sampleVars).forEach(([k, v]) => {
            const reg = new RegExp(`{{${k}}}`, 'g');
            rendered = rendered.replace(reg, v);
        });

        return rendered;
    };

    const insertVariable = (tag: string) => {
        setBodyHtml((prev) => prev + ` ${tag} `);
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
                {/* Header Banner */}
                <div className="bg-slate-900 text-white border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 shadow-xl">
                    <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Admin Hub
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                                <Mail className="w-7 h-7 text-blue-400" />
                                <span>Email Template & Notification Studio</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                Customize automated booking confirmations, 24h pre-arrival reminders, and 15m meeting room alerts.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saveMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Save Template</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Status Alert */}
                    {testStatus && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{testStatus}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Template List (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" /> Notification Lifecycle Triggers
                            </h2>

                            <div className="space-y-2">
                                {templates.map((tmpl) => {
                                    const isSelected = tmpl.code === selectedCode;
                                    const isAlert = tmpl.category === 'alert';
                                    const isReminder = tmpl.category === 'reminder';

                                    return (
                                        <button
                                            key={tmpl.id}
                                            type="button"
                                            onClick={() => setSelectedCode(tmpl.code)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col space-y-1.5 ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-[1.01]'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold tracking-tight">
                                                    {tmpl.name}
                                                </span>
                                                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : isAlert
                                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                        : isReminder
                                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    {tmpl.category}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {tmpl.subject}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Variable Injection Chips */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Dynamic Variable Tags
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Click any tag to insert it into the email template:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {TEMPLATE_VARIABLES.map((v) => (
                                        <button
                                            key={v.tag}
                                            type="button"
                                            onClick={() => insertVariable(v.tag)}
                                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-colors"
                                            title={v.desc}
                                        >
                                            {v.tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Test Dispatch Box */}
                            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Send className="w-3.5 h-3.5 text-blue-400" /> Send Test Notification
                                </h3>
                                <div className="space-y-2">
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="Recipient email address"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => testSendMutation.mutate()}
                                        disabled={testSendMutation.isPending}
                                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                        {testSendMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        <span>Dispatch Test Email</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Code Editor & Live Preview (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Subject & Preheader Inputs */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Email Subject Line
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Inbox Pre-Header Text
                                    </label>
                                    <input
                                        type="text"
                                        value={preheader}
                                        onChange={(e) => setPreheader(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Viewport & Editor Tabs Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('preview')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            activeTab === 'preview'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Live Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('code')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            activeTab === 'code'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Code className="w-3.5 h-3.5" /> HTML Template Source
                                    </button>
                                </div>

                                {activeTab === 'preview' && (
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('desktop')}
                                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                                previewMode === 'desktop'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-500'
                                            }`}
                                            title="Desktop View"
                                        >
                                            <Monitor className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('mobile')}
                                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                                previewMode === 'mobile'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-500'
                                            }`}
                                            title="Mobile View"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Main Editor / Preview Body */}
                            {activeTab === 'code' ? (
                                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
                                    <textarea
                                        value={bodyHtml}
                                        onChange={(e) => setBodyHtml(e.target.value)}
                                        rows={22}
                                        className="w-full bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                                        spellCheck={false}
                                    />
                                </div>
                            ) : (
                                <div className="p-6 sm:p-10 rounded-3xl bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex justify-center min-h-[500px]">
                                    <div className={`transition-all bg-white rounded-2xl shadow-2xl overflow-hidden ${
                                        previewMode === 'mobile' ? 'w-full max-w-[375px]' : 'w-full max-w-[620px]'
                                    }`}>
                                        <div 
                                            dangerouslySetInnerHTML={{ __html: getRenderedHtml() }} 
                                            className="p-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
};

export default EmailTemplatesStudioPage;