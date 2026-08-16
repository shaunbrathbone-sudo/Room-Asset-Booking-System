'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Car, Tv, Laptop, Upload, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { Asset } from '@/types/spatial';

interface AssetBookingModalProps {
    asset: Asset | null;
    isOpen: boolean;
    onClose: () => void;
}

export const AssetBookingModal = ({ asset, isOpen, onClose }: AssetBookingModalProps) => {
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [endTime, setEndTime] = useState('17:00');
    const [licenseUploaded, setLicenseUploaded] = useState(false);
    const [startMileage, setStartMileage] = useState<number | undefined>(asset?.currentMileage || undefined);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const bookingMutation = useMutation({
        mutationFn: async () => {
            if (!asset) return;

            if (asset.requiresLicense && !licenseUploaded) {
                throw new Error('Please upload a copy of your valid Driving License before proceeding.');
            }

            const startISO = `${startDate}T${startTime}:00.000Z`;
            const endISO = `${endDate}T${endTime}:00.000Z`;

            const { data } = await api.post('/bookings', {
                resourceType: 'asset',
                resourceId: asset.id,
                startTime: startISO,
                endTime: endISO,
                licenseImageUrl: licenseUploaded ? 'https://storage.cloudfy.internal/licenses/mock-license.jpg' : undefined,
                startMileage,
                notes,
            });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
            setSuccess(data.status === 'pending_approval'
                ? 'Request placed! Fleet & facility management will review and approve shortly.'
                : 'Asset reserved successfully!');
            setError(null);
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2500);
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || err.message || 'Failed to book asset.');
        },
    });

    if (!isOpen || !asset) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                            {asset.category === 'vehicle' && <Car className="w-6 h-6" />}
                            {asset.category === 'av_equipment' && <Tv className="w-6 h-6" />}
                            {asset.category === 'loaner_hardware' && <Laptop className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{asset.name}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Code: {asset.identifierCode} • {asset.model}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Asset Quick Meta */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                        {asset.specifications && (
                            <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">Specs: </span>
                                <span className="text-slate-600 dark:text-slate-400">{asset.specifications}</span>
                            </div>
                        )}
                        {asset.currentMileage && (
                            <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">Current Odometer: </span>
                                <span className="text-slate-600 dark:text-slate-400">{asset.currentMileage.toLocaleString()} miles</span>
                            </div>
                        )}
                        {asset.fuelOrBattery && (
                            <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">Fuel / Charge: </span>
                                <span className="text-slate-600 dark:text-slate-400">{asset.fuelOrBattery}</span>
                            </div>
                        )}
                    </div>

                    {/* Date/Time Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date & Time</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm mb-2"
                            />
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Date & Time</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm mb-2"
                            />
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                            />
                        </div>
                    </div>

                    {/* Vehicle Mandatory License Upload */}
                    {asset.requiresLicense && (
                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                    Driver Verification Required
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                Fleet insurance compliance mandates a photo upload of your UK driving license before checkout.
                            </p>
                            <button
                                type="button"
                                onClick={() => setLicenseUploaded(!licenseUploaded)}
                                className={`w-full py-2.5 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                                    licenseUploaded
                                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                                }`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {licenseUploaded ? '✓ Driving License Verified' : 'Upload Photocard Driving License (.jpg, .png, .pdf)'}
                            </button>
                        </div>
                    )}

                    {/* Feedback */}
                    {success && (
                        <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => bookingMutation.mutate()}
                        disabled={bookingMutation.isPending}
                        className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" />
                        {bookingMutation.isPending ? 'Processing...' : 'Reserve Shared Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
};