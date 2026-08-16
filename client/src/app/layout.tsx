import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { FeedbackFAB } from '@/components/feedback/FeedbackFAB';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Cloudfy Workspaces — 3D Global Space & Asset Booking',
    description: 'Enterprise 3D spatial booking platform for desks, boardrooms, fleet vehicles, and shared equipment across global offices.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white antialiased`}>
                <QueryProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <Navbar />
                            <main>{children}</main>
                            <FeedbackFAB />
                        </ThemeProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}