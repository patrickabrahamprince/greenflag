'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';

interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
  onSuccess?: () => void;
}

const GOOGLE_WEB_CLIENT_ID = (
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  ''
).replace(/\\n/g, '').trim();

export function GoogleButton({ onClick, loading, onSuccess }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || !GOOGLE_WEB_CLIENT_ID) return;

    const initGis = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) return;
            try {
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
              });
              if (error) throw error;
              if (onSuccess) onSuccess();
              else window.location.href = '/trips';
            } catch (err) {
              console.error('GIS login error:', err);
            }
          },
          auto_select: false,
        });

        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: '320',
        });
        setGisReady(true);
      } catch (e) {
        console.warn('GIS initialization skipped:', e);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGis();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGis;
      document.head.appendChild(script);
    }
  }, [onSuccess]);

  if (!Capacitor.isNativePlatform() && GOOGLE_WEB_CLIENT_ID) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
        <div ref={containerRef} className={`w-full flex justify-center ${!gisReady ? 'hidden' : ''}`} />
        {!gisReady && (
          <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-stone-800 font-bold text-xs py-3.5 px-4 rounded-full border border-stone-200 shadow-xs hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white text-stone-800 font-bold text-xs py-3.5 px-4 rounded-full border border-stone-200 shadow-xs hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      <span>Continue with Google</span>
    </button>
  );
}
