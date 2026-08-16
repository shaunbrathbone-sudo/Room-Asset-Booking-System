'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
    Navigation, Layers, Building, Wifi, Calendar, Coffee, 
    ArrowLeft, Edit3, MapPin, Sparkles, ShowerHead, Car, Printer, ShieldAlert, HeartHandshake
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const getSectionIcon = (iconName: string) => {
    switch (iconName) {
        case 'Navigation': return <Navigation className="w-5 h-5 text-blue-500" />;
        case 'Layers': return <Layers className="w-5 h-5 text-indigo-500" />;
        case 'Building': return <Building className="w-5 h-5 text-emerald-500" />;
        case 'Wifi': return <Wifi className="w-5 h-5 text-cyan-500" />;
        case 'Calendar': return <Calendar className="w-5 h-5 text-amber-500" />;
        case 'Coffee': return <Coffee className="w-5 h-5 text-rose-500" />;
        default: return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
};

const OfficeGuidePage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const countrySlug = params.countrySlug as string;
    const officeSlug = params.officeSlug as string;

    const isLocationAdminOrSuper = user?.role === 'location_admin' || user?.role === 'super_admin';

    const { data: guide, isLoading } = useQuery({
        queryKey: ['officeGuide', officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}/guide`);
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold">Office Guide Not Found</h1>
                <p className="text-slate-500 mt-2">No guide available for this office location yet.</p>
                <Link
                    href={`/explore/${countrySlug}/${officeSlug}`}
                    className="inline-block mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                    Back to Office
                </Link>
            </div>
        );
    }

    const { content } = guide;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Navy Hero Banner */}
            <div className="bg-slate-900 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link
                            href={`/explore/${countrySlug}/${officeSlug}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to 3D Office Stack
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
                            {content.title || guide.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
                            {content.subtitle || guide.subtitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isLocationAdminOrSuper && (
                            <Link
                                href={`/admin/offices/${officeSlug}/guide`}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 shadow-md transition-all"
                            >
                                <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Guide (Admin)
                            </Link>
                        )}
                        <Link
                            href={`/explore/${countrySlug}/${officeSlug}`}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            <Building className="w-4 h-4" /> Book Workstations & Rooms
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Guide Content Grid */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {content.sections?.map((section: any) => (
                        <div
                            key={section.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            {/* Blue Accent Top Border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                                    {getSectionIcon(section.icon)}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {section.title}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {section.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Banner */}
                {content.footerBanner && (
                    <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-6 sm:p-8 text-center shadow-xl">
                        <div className="inline-flex p-3 rounded-full bg-white/10 mb-3">
                            <HeartHandshake className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black">{content.footerBanner}</h3>
                        <p className="text-xs text-white/80 mt-1">
                            Questions or need assistance? Reach out to Facilities or use the Feedback button.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeGuidePage;