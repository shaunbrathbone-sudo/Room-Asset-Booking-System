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
import { OfficeCommuteGuide } from '@/components/spatial/OfficeCommuteGuide';
import { OfficeWeatherForecast } from '@/components/spatial/OfficeWeatherForecast';

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

    const { data: guide, isLoading: guideLoading } = useQuery({
        queryKey: ['officeGuide', officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}/guide`);
            return data;
        },
    });

    const { data: office, isLoading: officeLoading } = useQuery({
        queryKey: ['office', officeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/offices/${officeSlug}`);
            return data;
        },
    });

    if (guideLoading || officeLoading) {
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
    const officeLat = office?.latitude ?? (officeSlug.includes('india') ? 28.6280 : officeSlug.includes('london') ? 51.5235 : 52.6339);
    const officeLng = office?.longitude ?? (officeSlug.includes('india') ? 77.3649 : officeSlug.includes('london') ? -0.1054 : -1.1360);
    const officeCity = office?.city ?? (officeSlug.includes('india') ? 'Noida, Sector 62' : officeSlug.includes('london') ? 'London, Clerkenwell' : 'Leicester City Centre');
    const officeFullAddress = office?.addressLine1 ? `${office.addressLine1}, ${office.city}, ${office.postcode}` : (officeSlug.includes('india') ? 'The Iconic Corenthum Tower C, Sector 62, Noida' : officeSlug.includes('london') ? 'Clerkenwell, London EC1M 6BY' : '17 Friar Lane, Leicester LE1 5RB');

    const officePhoto = office?.photoUrl || office?.imageUrl || (officeSlug === 'leicester-hub' ? '/images/offices/leicester-hub.jpg' : null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Navy Hero Banner */}
            <div className="bg-slate-900 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
                <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <Link
                            href={`/explore/${countrySlug}/${officeSlug}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to 3D Office Stack
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
                            {content.title || guide.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-medium">
                            {content.subtitle || guide.subtitle}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            {isLocationAdminOrSuper && (
                                <Link
                                    href={`/admin/offices/${officeSlug}/guide`}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 shadow-md transition-all"
                                >
                                    <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Guide (Admin)
                                </Link>
                            )}
                            <Link
                                href={`/explore/${countrySlug}/${officeSlug}`}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                            >
                                <Building className="w-4 h-4" /> Book Workstations & Rooms
                            </Link>
                        </div>
                    </div>

                    {officePhoto && (
                        <div className="relative w-full lg:w-80 h-48 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group flex-shrink-0">
                            <img
                                src={officePhoto}
                                alt={`${office?.name || 'Office'} Building Front`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-white tracking-wide bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                                    🏢 {office?.name || 'Office Facade'}
                                </span>
                                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                                    Official Hub
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
                {/* 3-Day Live Weather Forecast */}
                <OfficeWeatherForecast
                    latitude={officeLat}
                    longitude={officeLng}
                    cityName={officeCity}
                />

                {/* Multi-Modal Commute & Transit Guide */}
                <OfficeCommuteGuide
                    officeSlug={officeSlug}
                    officeName={office?.name || guide.title}
                    address={officeFullAddress}
                />

                {/* Main Guide Content Grid */}
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">
                        Building Facilities & Workspace Policies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {content.sections?.map((section: any) => (
                            <div
                                key={section.id}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                                        {getSectionIcon(section.icon)}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {section.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                                                {item.label}
                                            </h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Banner */}
                {content.footerBanner && (
                    <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-800/60 p-6 text-center text-white shadow-xl">
                        <p className="text-sm sm:text-base font-bold">
                            {content.footerBanner}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeGuidePage;