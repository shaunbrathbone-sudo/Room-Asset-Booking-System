'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { EnterpriseSidebar } from './EnterpriseSidebar';
import { EnterpriseHeader } from './EnterpriseHeader';
import { FeedbackFAB } from '@/components/feedback/FeedbackFAB';

interface EnterpriseShellProps {
    children: React.ReactNode;
}

export const EnterpriseShell: React.FC<EnterpriseShellProps> = ({ children }) => {
    const pathname = usePathname();

    // Check if on floor page to display dynamic header title
    const isFloorPage = pathname.includes('/ground-floor') || pathname.includes('/first-floor') || pathname.includes('/floor-');
    const floorLabel = pathname.includes('ground-floor')
        ? 'Ground Floor'
        : pathname.includes('first-floor')
        ? 'First Floor'
        : undefined;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
            {/* Left Enterprise Navigation Sidebar */}
            <EnterpriseSidebar />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <EnterpriseHeader floorTitle={floorLabel} />
                <main className="flex-1 relative overflow-y-auto">
                    {children}
                </main>
                <FeedbackFAB />
            </div>
        </div>
    );
};
