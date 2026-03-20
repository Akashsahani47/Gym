'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gym-owner/verify-email?token=${token}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 animate-spin text-accent mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            <button
              onClick={() => router.push('/dashboard/gymOwner/profile')}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg transition-colors"
            >
              Go to Profile
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
            <button
              onClick={() => router.push('/dashboard/gymOwner/profile')}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg transition-colors"
            >
              Back to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
