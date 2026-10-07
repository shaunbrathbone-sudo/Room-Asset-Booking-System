import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GlobalConnect — Enterprise Workspace SAMS v1.2',
    description: 'Enterprise smart workspace, desk hoteling, meeting room and asset management system.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body 
                suppressHydrationWarning 
                className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white antialiased`}
            >
                <QueryProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <EnterpriseShell>
                                {children}
                            </EnterpriseShell>
                        </ThemeProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}