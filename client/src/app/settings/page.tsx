'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    User, Camera, Trash2, CheckCircle2, Shield, Building, 
    Save, Sparkles, Upload, Image as ImageIcon, MapPin, Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

const SettingsPage = () => {
    const { user, loginWithTokens } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
    const [homeOfficeId, setHomeOfficeId] = useState('55555555-5555-5555-5555-555555555555');
    const [defaultView, setDefaultView] = useState('globe');
    const [savedMsg, setSavedMsg] = useState<string | null>(null);

    // Fetch user profile from API
    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data;
        },
    });

    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName || '');
            setLastName(profile.lastName || '');
            setAvatarUrl(profile.avatarUrl || null);
            if (profile.homeOfficeId) setHomeOfficeId(profile.homeOfficeId);
            if (profile.defaultView) setDefaultView(profile.defaultView);
        }
    }, [profile]);

    // Handle File Upload from device
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Verify image size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Please select an image smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Mutation to update profile
    const updateProfileMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.put('/auth/me', {
                firstName,
                lastName,
                avatarUrl,
                homeOfficeId,
                defaultView,
            });
            return data;
        },
        onSuccess: (data) => {
            loginWithTokens(data.tokens, data.user);
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
            setSavedMsg('Profile and photo updated across the workspace.');
            setTimeout(() => setSavedMsg(null), 3500);
        },
    });

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-600" /> My Profile & Preferences
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage your personal profile photo, employee identity, and default workplace settings.
                </p>
            </div>

            {savedMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm font-semibold shadow-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{savedMsg}</span>
                </div>
            )}

            <div className="space-y-8">
                {/* 1. Profile Photo & Avatar Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        Profile Photo / Avatar
                    </h2>
                    <p className="text-xs text-slate-500 mb-6">
                        This photo will appear in the navigation bar, desk reservations, meeting room attendees, and colleague search.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar Display */}
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-blue-500/20 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-black">
                                        {firstName[0] || 'U'}{lastName[0] || ''}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
                                title="Upload Photo"
                                aria-label="Upload profile photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-4 text-center sm:text-left">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload from Computer
                                </button>

                                {avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl(null)}
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                                    </button>
                                )}
                            </div>

                            {/* Preset Options */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Or choose a corporate avatar preset:
                                </p>
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    {AVATAR_PRESETS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setAvatarUrl(preset)}
                                            className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                                                avatarUrl === preset
                                                    ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-500/30'
                                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Personal Information */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Personal Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ''}
                                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Tenant</label>
                            <input
                                type="text"
                                disabled
                                value={profile?.tenantName || 'Cloudfy UK Ltd'}
                                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Workplace & Navigation Preferences */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Workplace & Smart Landing Preferences
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Primary Home Office
                            </label>
                            <select
                                value={homeOfficeId}
                                onChange={(e) => setHomeOfficeId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            >
                                <option value="55555555-5555-5555-5555-555555555555">Leicester Hub (17 Friar Lane)</option>
                                <option value="66666666-6666-6666-6666-666666666666">London Office (Brandwidth HQ)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Default View Upon Sign-In
                            </label>
                            <select
                                value={defaultView}
                                onChange={(e) => setDefaultView(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            >
                                <option value="globe">3D Spatial Globe Explorer</option>
                                <option value="office">Direct Home Office Exploded Stack</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => updateProfileMutation.mutate()}
                        disabled={updateProfileMutation.isPending}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;