'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function JTLOAuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // The state parameter contains the clientId (set during auth URL generation)
        const clientId = state;

        if (!code) {
          setStatus('error');
          setMessage('Authorization code not found in callback');
          return;
        }

        if (!clientId) {
          setStatus('error');
          setMessage('Client ID not found in state parameter');
          return;
        }

        // Construct redirect URI (this same page)
        const redirectUri = `${window.location.origin}/integrations/jtl/callback`;

        // Exchange code for tokens
        const response = await fetch('/api/integrations/jtl/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            code,
            redirectUri,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('JTL FFN authentication successful!');

          // Notify parent window (if opened in popup)
          if (window.opener) {
            window.opener.postMessage({ type: 'jtl-oauth-success', clientId }, window.location.origin);
          }

          // Close popup after 2 seconds
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to complete authentication');
        }
      } catch (error) {
        console.error('Error exchanging token:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    exchangeToken();
  }, [searchParams]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Authenticating...
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Please wait while we complete your JTL FFN authentication
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Success!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {message}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
              This window will close automatically...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Authentication Failed
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              {message}
            </p>
            <button
              onClick={() => window.close()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
