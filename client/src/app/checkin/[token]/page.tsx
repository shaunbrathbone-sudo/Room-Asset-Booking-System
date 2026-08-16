'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const CheckinPage = () => {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) return;

        const performCheckin = async () => {
            try {
                const { data } = await api.post('/bookings/checkin-by-token', { token });
                setStatus('success');
                setMessage(data.message || 'Check-in verified!');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Invalid or expired check-in token.');
            }
        };

        performCheckin();
    }, [token]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                {status === 'loading' && (
                    <div>
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Check-In...</h1>
                        <p className="text-xs text-slate-500 mt-1">Connecting to workspace gate controller</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-In Successful</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/bookings')}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                        >
                            View My Reservations <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-In Failed</h1>
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
        </div>
    );
};

export default CheckinPage;