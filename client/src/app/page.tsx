'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import type { UserPreferences } from '@/types/spatial';

/**
 * Smart Landing Page
 * Redirects based on user preferences:
 * - Has home floor -> /explore/{country}/{office}/{floor}
 * - Has home office -> /explore/{country}/{office}
 * - No preferences -> /explore (Globe)
 */
const HomePage = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const redirect = async () => {
            if (!isAuthenticated) {
                router.replace('/explore');
                return;
            }

            try {
                const { data } = await api.get<UserPreferences>('/users/preferences');

                if (data.defaultView === 'floor' && data.homeCountrySlug && data.homeOfficeSlug && data.homeFloorSlug) {
                    router.replace(`/explore/${data.homeCountrySlug}/${data.homeOfficeSlug}/${data.homeFloorSlug}`);
                } else if (data.defaultView === 'office' && data.homeCountrySlug && data.homeOfficeSlug) {
                    router.replace(`/explore/${data.homeCountrySlug}/${data.homeOfficeSlug}`);
                } else {
                    router.replace('/explore');
                }
            } catch {
                router.replace('/explore');
            }
        };

        redirect();
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading your workspace...</p>
            </div>
        </div>
    );
};

export default HomePage;