'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const CancelBookingContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing cancellation token.');
            return;
        }

        const performCancel = async () => {
            try {
                const { data } = await api.get(`/bookings/cancel-by-token?token=${token}`);
                setStatus('success');
                setMessage(data.message || 'Booking cancelled successfully.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Invalid or expired cancellation link.');
            }
        };

        performCancel();
    }, [token]);

    return (
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            {status === 'loading' && (
                <div>
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cancelling Reservation...</h1>
                </div>
            )}

            {status === 'success' && (
                <div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reservation Cancelled</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                    <button
                        onClick={() => router.push('/explore')}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                        Book Another Space <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cancellation Failed</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                    <button
                        onClick={() => router.push('/explore')}
                        className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm"
                    >
                        Back to Globe
                    </button>
                </div>
            )}
        </div>
    );
};

const CancelBookingPage = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            }>
                <CancelBookingContent />
            </Suspense>
        </div>
    );
};

export default CancelBookingPage;