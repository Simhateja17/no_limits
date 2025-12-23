'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { onboardingApi } from '@/lib/onboarding-api';

export default function ShopifyOAuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Shopify authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const shop = searchParams.get('shop');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for errors
        if (error) {
          console.error('[Shopify OAuth] ❌ OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error || 'Authorization failed');

          // Notify parent window of failure
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'shopify-oauth-error',
                error: errorDescription || error,
              },
              window.location.origin
            );
          }

          // Close window after 3 seconds
          setTimeout(() => window.close(), 3000);
          return;
        }

        // Validate required parameters
        if (!code || !state || !shop) {
          console.error('[Shopify OAuth] ❌ Missing required parameters');
          setStatus('error');
          setMessage('Missing required authorization parameters');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'shopify-oauth-error',
                error: 'Missing required parameters',
              },
              window.location.origin
            );
          }

          setTimeout(() => window.close(), 3000);
          return;
        }

        console.log('[Shopify OAuth] 📝 Received callback with code');
        setMessage('Exchanging authorization code for access token...');

        // Exchange code for access token
        // State contains the clientId
        const result = await onboardingApi.completeShopifyOAuth(
          state, // clientId is passed as state
          shop,
          code,
          state
        );

        if (result.success) {
          console.log('[Shopify OAuth] ✅ OAuth completed successfully');
          setStatus('success');
          setMessage('Authorization successful! Redirecting...');

          // Notify parent window of success
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'shopify-oauth-success',
                channelId: result.channelId,
              },
              window.location.origin
            );
          }

          // Close window after 1 second
          setTimeout(() => window.close(), 1000);
        } else {
          console.error('[Shopify OAuth] ❌ Failed to complete OAuth:', result.error);
          setStatus('error');
          setMessage(result.error || 'Failed to complete authorization');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'shopify-oauth-error',
                error: result.error,
              },
              window.location.origin
            );
          }

          setTimeout(() => window.close(), 3000);
        }
      } catch (err) {
        console.error('[Shopify OAuth] ❌ Error in callback:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Unknown error occurred');

        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'shopify-oauth-error',
              error: err instanceof Error ? err.message : 'Unknown error',
            },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 3000);
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              color: '#003450',
              margin: 0,
            }}
          >
            No Limits
          </h1>
        </div>

        {/* Status Icon */}
        <div style={{ marginBottom: '20px' }}>
          {status === 'processing' && (
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #E5E7EB',
                borderTop: '4px solid #003450',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
          {status === 'success' && (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: 'white',
                fontSize: '32px',
              }}
            >
              ✓
            </div>
          )}
          {status === 'error' && (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: 'white',
                fontSize: '32px',
              }}
            >
              ✕
            </div>
          )}
        </div>

        {/* Message */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {message}
        </p>

        {status === 'error' && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: '#6B7280',
              marginTop: '12px',
            }}
          >
            This window will close automatically in 3 seconds.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
