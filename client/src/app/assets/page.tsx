'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Tv, Laptop, Search, ShieldAlert, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { AssetBookingModal } from '@/components/booking/AssetBookingModal';
import type { Asset } from '@/types/spatial';

const AssetsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { data: assets = [], isLoading } = useQuery<Asset[]>({
        queryKey: ['assets', selectedCategory],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            const { data } = await api.get('/assets', { params });
            return data;
        },
    });

    const filtered = assets.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.identifierCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.model && a.model.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shared Corporate Assets</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Book pooled fleet vehicles, portable 4K laser projectors, and emergency loaner hardware.
                    </p>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'All Assets', icon: Sparkles },
                        { id: 'vehicle', label: 'Fleet & Pool Vehicles', icon: Car },
                        { id: 'av_equipment', label: 'High-Value AV Gear', icon: Tv },
                        { id: 'loaner_hardware', label: 'Loaner Hardware', icon: Laptop },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = selectedCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedCategory(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assets or license plates..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500">No assets found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((asset) => (
                        <div
                            key={asset.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                                        {asset.category === 'vehicle' && <Car className="w-6 h-6" />}
                                        {asset.category === 'av_equipment' && <Tv className="w-6 h-6" />}
                                        {asset.category === 'loaner_hardware' && <Laptop className="w-6 h-6" />}
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {asset.identifierCode}
                                    </span>
                                </div>

                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{asset.name}</h2>
                                {asset.model && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{asset.model}</p>
                                )}

                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                                    {asset.description}
                                </p>

                                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    {asset.fuelOrBattery && (
                                        <p className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                            <span className="text-slate-400">Status:</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{asset.fuelOrBattery}</span>
                                        </p>
                                    )}
                                    {asset.currentMileage && (
                                        <p className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                            <span className="text-slate-400">Odometer:</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{asset.currentMileage.toLocaleString()} mi</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                {asset.requiresLicense ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                        <ShieldAlert className="w-3.5 h-3.5" /> License Required
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Instant Booking
                                    </span>
                                )}
                                <button
                                    onClick={() => { setSelectedAsset(asset); setModalOpen(true); }}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                >
                                    Book Asset
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AssetBookingModal
                asset={selectedAsset}
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedAsset(null); }}
            />
        </div>
    );
};

export default AssetsPage;