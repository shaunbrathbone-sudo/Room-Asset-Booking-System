import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { FeedbackFAB } from '@/components/feedback/FeedbackFAB';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'SpaceBook 3D — Global Workspace Booking',
    description: 'Book desks, meeting rooms, and shared assets across your global office portfolio with an immersive 3D spatial experience.',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}>
                <ThemeProvider>
                    <QueryProvider>
                        <AuthProvider>
                            <div className="flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1" id="main-content">
                                    {children}
                                </main>
                                <FeedbackFAB />
                            </div>
                        </AuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
};

export default RootLayout;