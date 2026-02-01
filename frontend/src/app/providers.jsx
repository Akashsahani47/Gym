// app/providers.jsx
'use client';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            style: {
              background: '#065f46',
              border: '1px solid #047857',
            },
          },
          error: {
            style: {
              background: '#7f1d1d',
              border: '1px solid #991b1b',
            },
          },
        }}
      />
      {children}
    </>
  );
}