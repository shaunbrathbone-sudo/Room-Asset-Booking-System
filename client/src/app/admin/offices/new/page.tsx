'use client';

import { AdminGuard } from '@/components/auth/AdminGuard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Building2, MapPin, Layers, Users, Sparkles, CheckCircle2, 
    AlertCircle, ArrowRight, ArrowLeft, Shield, Clock, Compass, Globe2, Plus, Trash2 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function NewOfficeWizardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [currentStep, setCurrentStep] = useState(1);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form State
    const [officeData, setOfficeData] = useState({
        name: '',
        slug: '',
        countryId: '44444444-4444-4444-4444-444444444444', // UK
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        latitude: 52.6339,
        longitude: -1.1360,
        photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
        operationalHours: 'Mon-Fri 08:30 - 18:00',
        floorCount: 2,
        tenants: ['11111111-1111-1111-1111-111111111111'], // Cloudfy default
        deskCountPerFloor: 16,
        meetingRoomCountPerFloor: 1,
        floorsList: [
            { floorNumber: 0, name: 'Ground Floor (Creative & Reception)', slug: 'ground-floor' },
            { floorNumber: 1, name: 'First Floor (Engineering & Strategy)', slug: 'first-floor' },
        ],
    });

    const createOfficeMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/admin/offices/wizard', officeData);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['countries'] });
            queryClient.invalidateQueries({ queryKey: ['offices'] });
            router.push(`/explore/united-kingdom/${data.slug}`);
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.error || 'Failed to onboard office through wizard.');
        },
    });

    const autoGeocode = () => {
        if (officeData.city.toLowerCase().includes('manchester')) {
            setOfficeData({ ...officeData, latitude: 53.4808, longitude: -2.2426 });
        } else if (officeData.city.toLowerCase().includes('birmingham')) {
            setOfficeData({ ...officeData, latitude: 52.4862, longitude: -1.8904 });
        } else if (officeData.city.toLowerCase().includes('bristol')) {
            setOfficeData({ ...officeData, latitude: 51.4545, longitude: -2.5879 });
        } else if (officeData.city.toLowerCase().includes('edinburgh')) {
            setOfficeData({ ...officeData, latitude: 55.9533, longitude: -3.1883 });
        } else {
            setOfficeData({ ...officeData, latitude: 51.5074, longitude: -0.1278 });
        }
    };

    const updateFloorsCount = (count: number) => {
        const validCount = Math.max(1, Math.min(10, count));
        const list = Array.from({ length: validCount }, (_, i) => {
            if (i === 0) return { floorNumber: 0, name: 'Ground Floor', slug: 'ground-floor' };
            return { floorNumber: i, name: `Floor ${i}`, slug: `floor-${i}` };
        });
        setOfficeData({
            ...officeData,
            floorCount: validCount,
            floorsList: list,
        });
    };

    const steps = [
        { num: 1, title: 'Location & Address' },
        { num: 2, title: 'Tenant Access' },
        { num: 3, title: 'Building Floors' },
        { num: 4, title: 'Desk & Room Capacity' },
        { num: 5, title: 'Review & Provision' },
    ];

    return (
        <AdminGuard>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Estate Management
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Onboard New Workplace Hub
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Complete the 5-step guided wizard to provision 3D exploded stacks, desks, meeting rooms, and induction guidelines.
                </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                {steps.map((s) => (
                    <button
                        key={s.num}
                        type="button"
                        onClick={() => setCurrentStep(s.num)}
                        className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                            currentStep === s.num
                                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                                : currentStep > s.num
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                        <span className="block text-[10px] uppercase font-bold opacity-75">Step {s.num}</span>
                        <span className="text-xs truncate block font-bold">{s.title}</span>
                    </button>
                ))}
            </div>

            {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Step 1: Location & Address */}
            {currentStep === 1 && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Office Identity & Geolocation</h2>
                            <p className="text-xs text-slate-400">Specify the location details and coordinates for 3D globe rendering.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Office Name *</label>
                            <input
                                type="text"
                                value={officeData.name}
                                onChange={(e) => setOfficeData({ ...officeData, name: e.target.value })}
                                placeholder="e.g. Manchester Innovation Hub"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Address Line 1 *</label>
                            <input
                                type="text"
                                value={officeData.addressLine1}
                                onChange={(e) => setOfficeData({ ...officeData, addressLine1: e.target.value })}
                                placeholder="e.g. 100 Peter Street"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">City *</label>
                            <input
                                type="text"
                                value={officeData.city}
                                onChange={(e) => setOfficeData({ ...officeData, city: e.target.value })}
                                placeholder="e.g. Manchester"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Postcode *</label>
                            <input
                                type="text"
                                value={officeData.postcode}
                                onChange={(e) => setOfficeData({ ...officeData, postcode: e.target.value })}
                                placeholder="e.g. M2 5PB"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Operating Hours</label>
                            <input
                                type="text"
                                value={officeData.operationalHours}
                                onChange={(e) => setOfficeData({ ...officeData, operationalHours: e.target.value })}
                                placeholder="Mon-Fri 08:30 - 18:00"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cover Image URL</label>
                            <input
                                type="text"
                                value={officeData.photoUrl}
                                onChange={(e) => setOfficeData({ ...officeData, photoUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Geolocation Coordinates */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Compass className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> 3D Globe Positioning Coordinates
                            </span>
                            <button
                                type="button"
                                onClick={autoGeocode}
                                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-500 transition-colors shadow-sm"
                            >
                                Auto-Fill from City
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Latitude (°N)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={officeData.latitude}
                                    onChange={(e) => setOfficeData({ ...officeData, latitude: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Longitude (°E/W)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={officeData.longitude}
                                    onChange={(e) => setOfficeData({ ...officeData, longitude: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Tenant & Brand Affiliation */}
            {currentStep === 2 && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Tenant & Corporate Access</h2>
                            <p className="text-xs text-slate-400">Select which corporate tenant entities have access to book desks in this hub.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Cloudfy UK Ltd', desc: 'Full engineering, product & support access' },
                            { id: '22222222-2222-2222-2222-222222222222', name: 'Williams Commerce Ltd', desc: 'Commerce solutions & digital agency' },
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Brandwidth', desc: 'Creative innovation & UX labs' },
                        ].map((t) => {
                            const isChecked = officeData.tenants.includes(t.id);
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => {
                                        if (isChecked) {
                                            if (officeData.tenants.length > 1) {
                                                setOfficeData({ ...officeData, tenants: officeData.tenants.filter((id) => id !== t.id) });
                                            }
                                        } else {
                                            setOfficeData({ ...officeData, tenants: [...officeData.tenants, t.id] });
                                        }
                                    }}
                                    className={`p-5 rounded-2xl border text-left transition-all ${
                                        isChecked
                                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/20'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{t.name}</h3>
                                        <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-300'}`} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step 3: Multi-Floor Architecture */}
            {currentStep === 3 && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Floor Stack Architecture</h2>
                            <p className="text-xs text-slate-400">Define the floors for the 3D exploded building stack.</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">Number of Floors:</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{officeData.floorCount} Floors</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="6"
                            value={officeData.floorCount}
                            onChange={(e) => updateFloorsCount(Number(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                    </div>

                    <div className="space-y-3">
                        {officeData.floorsList.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    {f.floorNumber}
                                </span>
                                <input
                                    type="text"
                                    value={f.name}
                                    onChange={(e) => {
                                        const updated = [...officeData.floorsList];
                                        updated[idx].name = e.target.value;
                                        setOfficeData({ ...officeData, floorsList: updated });
                                    }}
                                    placeholder="Floor Name"
                                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Desk & Room Defaults */}
            {currentStep === 4 && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Default Workstation & Meeting Room Capacity</h2>
                            <p className="text-xs text-slate-400">Set the initial count of auto-generated desks and meeting suites per floor.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                            <label className="block text-xs font-black text-slate-900 dark:text-white">Desks per Floor</label>
                            <input
                                type="number"
                                min="4"
                                max="48"
                                value={officeData.deskCountPerFloor}
                                onChange={(e) => setOfficeData({ ...officeData, deskCountPerFloor: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white"
                            />
                            <p className="text-[11px] text-slate-400">
                                Total desks generated: {officeData.deskCountPerFloor * officeData.floorCount}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                            <label className="block text-xs font-black text-slate-900 dark:text-white">Meeting Rooms per Floor</label>
                            <input
                                type="number"
                                min="1"
                                max="6"
                                value={officeData.meetingRoomCountPerFloor}
                                onChange={(e) => setOfficeData({ ...officeData, meetingRoomCountPerFloor: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white"
                            />
                            <p className="text-[11px] text-slate-400">
                                Total meeting suites: {officeData.meetingRoomCountPerFloor * officeData.floorCount}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Review & Provision */}
            {currentStep === 5 && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 rounded-2xl bg-blue-600 text-white">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Ready to Provision Workplace</h2>
                            <p className="text-xs text-slate-400">Review the configuration before launching the office into the 3D Explorer.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Office</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block truncate">
                                {officeData.name || 'New Hub'}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">City</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                                {officeData.city || 'United Kingdom'}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Floors</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                                {officeData.floorCount} Floors
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                            <span className="block text-[10px] uppercase font-bold">Total Desks</span>
                            <span className="text-sm font-black mt-1 block">
                                {officeData.deskCountPerFloor * officeData.floorCount} Desks
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {currentStep < 5 ? (
                    <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => createOfficeMutation.mutate()}
                        disabled={createOfficeMutation.isPending || !officeData.name || !officeData.addressLine1}
                        className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs text-white shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {createOfficeMutation.isPending ? 'Provisioning Hub...' : '🚀 Launch Workplace Hub'}
                    </button>
                )}
            </div>
        </div>
            </AdminGuard>
    );
}