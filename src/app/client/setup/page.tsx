'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { onboardingApi } from '@/lib/onboarding-api';
import { SyncProgressModal } from '@/components/channels/SyncProgressModal';

type SetupStep = 'platform' | 'credentials' | 'jtl' | 'complete';
type PlatformType = 'shopify' | 'woocommerce' | null;

export default function ClientSetupPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('setup');
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  
  // Sync modal state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncChannelId, setSyncChannelId] = useState<string | null>(null);

  // Shopify credentials
  const [shopDomain, setShopDomain] = useState('');
  const [shopifyClientId, setShopifyClientId] = useState('');
  const [shopifyClientSecret, setShopifyClientSecret] = useState('');

  // WooCommerce credentials
  const [wooStoreUrl, setWooStoreUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');

  // JTL credentials
  const [jtlClientId, setJtlClientId] = useState('');
  const [jtlClientSecret, setJtlClientSecret] = useState('');
  const [jtlFulfillerId, setJtlFulfillerId] = useState('');
  const [jtlWarehouseId, setJtlWarehouseId] = useState('');
  const [jtlEnvironment, setJtlEnvironment] = useState<'sandbox' | 'production'>('sandbox');

  // Connection test results
  const [platformTestSuccess, setPlatformTestSuccess] = useState<boolean | null>(null);

  // JTL OAuth status
  const [jtlOAuthStatus, setJtlOAuthStatus] = useState<'pending' | 'authorizing' | 'success' | 'error' | null>(null);
  const [jtlOAuthError, setJtlOAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
      return;
    }

    // Get client ID
    const fetchClientId = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setClientId(data.user?.client?.id);
        }
      } catch (err) {
        console.error('Error fetching client ID:', err);
      }
    };

    fetchClientId();
  }, [isAuthenticated, user, router]);

  const handlePlatformSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    setCurrentStep('credentials');
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    setPlatformTestSuccess(null);

    try {
      if (selectedPlatform === 'shopify') {
        const result = await onboardingApi.testShopifyConnection(shopDomain, shopifyClientId);
        setPlatformTestSuccess(result.success);
        if (!result.success) {
          setError(result.message);
        }
      } else if (selectedPlatform === 'woocommerce') {
        const result = await onboardingApi.testWooCommerceConnection(
          wooStoreUrl,
          wooConsumerKey,
          wooConsumerSecret
        );
        setPlatformTestSuccess(result.success);
        if (!result.success) {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      setPlatformTestSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async () => {
    if (!clientId) {
      setError('Client ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let channelId: string | null = null;
      
      if (selectedPlatform === 'shopify') {
        console.log('[Setup] 🛍️ Adding Shopify channel...');
        const result = await onboardingApi.addShopifyChannel({
          clientId,
          shopDomain,
          accessToken: shopifyClientId,
        });

        console.log('[Setup] 📦 Shopify channel result:', result);

        if (!result.success) {
          console.error('[Setup] ❌ Failed to add Shopify channel:', result.error);
          setError(result.error || 'Failed to add Shopify channel');
          return;
        }
        channelId = result.channelId || null;
      } else if (selectedPlatform === 'woocommerce') {
        console.log('[Setup] 🛒 Adding WooCommerce channel...');
        const result = await onboardingApi.addWooCommerceChannel({
          clientId,
          storeUrl: wooStoreUrl,
          consumerKey: wooConsumerKey,
          consumerSecret: wooConsumerSecret,
        });

        console.log('[Setup] 📦 WooCommerce channel result:', result);

        if (!result.success) {
          console.error('[Setup] ❌ Failed to add WooCommerce channel:', result.error);
          setError(result.error || 'Failed to add WooCommerce channel');
          return;
        }
        channelId = result.channelId || null;
      }

      // Save channel ID for sync modal
      if (channelId) {
        console.log('[Setup] 💾 Saved channel ID for sync:', channelId);
        setSyncChannelId(channelId);
      } else {
        console.warn('[Setup] ⚠️ No channel ID returned from platform setup');
      }

      console.log('[Setup] ➡️ Moving to JTL credentials step');
      setCurrentStep('jtl');
    } catch (err) {
      console.error('[Setup] ❌ Error submitting credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to save credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJTLOAuth = async () => {
    if (!clientId) {
      setJtlOAuthError('Client ID not found');
      return;
    }

    console.log('[Setup] 🔐 Starting JTL OAuth flow...');
    setJtlOAuthStatus('authorizing');
    setJtlOAuthError(null);

    try {
      // Get OAuth authorization URL
      const redirectUri = `${window.location.origin}/integrations/jtl/callback`;
      const authUrlResponse = await onboardingApi.getJTLAuthUrl(
        clientId,
        redirectUri,
        jtlEnvironment
      );

      console.log('[Setup] 🔗 Opening OAuth popup...');

      // Open popup with the complete auth URL (don't append anything)
      const popup = window.open(
        authUrlResponse.authUrl,
        'jtl-oauth',
        'width=500,height=700'
      );

      if (!popup) {
        setJtlOAuthStatus('error');
        setJtlOAuthError('Failed to open popup. Please allow popups for this site.');
        return;
      }

      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'jtl-oauth-success') {
          console.log('[Setup] ✅ JTL OAuth completed successfully');
          setJtlOAuthStatus('success');
          window.removeEventListener('message', handleMessage);

          // Show sync progress modal if we have a channel ID
          if (syncChannelId) {
            console.log('[Setup] 🔄 Opening sync modal for channel:', syncChannelId);
            setShowSyncModal(true);
          } else {
            console.log('[Setup] ⚠️ No channel ID, skipping sync modal');
            setCurrentStep('complete');
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completing
      const popupCheck = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheck);
          window.removeEventListener('message', handleMessage);
          if (jtlOAuthStatus !== 'success') {
            console.log('[Setup] ⚠️ OAuth popup closed without completion');
            setJtlOAuthStatus('error');
            setJtlOAuthError('Authorization cancelled');
          }
        }
      }, 500);
    } catch (err) {
      console.error('[Setup] ❌ Error starting OAuth flow:', err);
      setJtlOAuthStatus('error');
      setJtlOAuthError(err instanceof Error ? err.message : 'Failed to start OAuth flow');
    }
  };

  const handleJTLSubmit = async () => {
    if (!clientId) {
      setError('Client ID not found');
      return;
    }

    console.log('[Setup] 🔐 Submitting JTL credentials...');
    setIsLoading(true);
    setError(null);
    setJtlOAuthStatus('pending');

    try {
      const result = await onboardingApi.setupJTLCredentials({
        clientId,
        jtlClientId,
        jtlClientSecret,
        fulfillerId: jtlFulfillerId,
        warehouseId: jtlWarehouseId,
        environment: jtlEnvironment,
      });

      console.log('[Setup] 📦 JTL credentials result:', result);

      if (!result.success) {
        console.error('[Setup] ❌ Failed to setup JTL credentials:', result.error);
        setError(result.error || 'Failed to setup JTL credentials');
        return;
      }

      // Credentials saved, now trigger OAuth flow
      console.log('[Setup] 🔓 Credentials saved, starting OAuth...');
      setIsLoading(false);
      await handleJTLOAuth();
    } catch (err) {
      console.error('[Setup] ❌ Error saving JTL credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to save JTL credentials');
      setIsLoading(false);
    }
  };

  const handleSyncComplete = () => {
    console.log('[Setup] ✅ Sync completed, closing modal');
    setShowSyncModal(false);
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    console.log('[Setup] 🎉 Setup complete, redirecting to dashboard');
    router.push('/client/dashboard');
  };

  const handleSkipJTL = () => {
    console.log('[Setup] ⏭️ Skipping JTL setup');
    setCurrentStep('complete');
  };

  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return null;
  }

  return (
    <>
      {/* Sync Progress Modal */}
      {syncChannelId && (
        <SyncProgressModal
          channelId={syncChannelId}
          isOpen={showSyncModal}
          onComplete={handleSyncComplete}
        />
      )}

      <div
        style={{
          minHeight: '100vh',
          background: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
        }}
      >
      {/* Logo */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            color: '#003450',
          }}
        >
          NoLimits
        </h1>
      </div>

      {/* Progress Steps */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {['platform', 'credentials', 'jtl', 'complete'].map((step, index) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background:
                  currentStep === step
                    ? '#003450'
                    : ['platform', 'credentials', 'jtl', 'complete'].indexOf(currentStep) > index
                    ? '#10B981'
                    : '#E5E7EB',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              {['platform', 'credentials', 'jtl', 'complete'].indexOf(currentStep) > index ? '✓' : index + 1}
            </div>
            {index < 3 && (
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background:
                    ['platform', 'credentials', 'jtl', 'complete'].indexOf(currentStep) > index
                      ? '#10B981'
                      : '#E5E7EB',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Step 1: Platform Selection */}
        {currentStep === 'platform' && (
          <>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {t('selectPlatform') || 'Select Your E-Commerce Platform'}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '32px',
              }}
            >
              {t('selectPlatformDesc') || 'Choose the platform where your online store is hosted'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => handlePlatformSelect('shopify')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#003450')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: '#95BF47',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '20px',
                  }}
                >
                  S
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#111827',
                    }}
                  >
                    Shopify
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: '#6B7280',
                    }}
                  >
                    {t('shopifyDesc') || 'Connect your Shopify store'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePlatformSelect('woocommerce')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#003450')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: '#96588A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '20px',
                  }}
                >
                  W
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#111827',
                    }}
                  >
                    WooCommerce
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: '#6B7280',
                    }}
                  >
                    {t('woocommerceDesc') || 'Connect your WooCommerce store'}
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Platform Credentials */}
        {currentStep === 'credentials' && (
          <>
            <button
              onClick={() => setCurrentStep('platform')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                fontSize: '14px',
                marginBottom: '24px',
              }}
            >
              ← {t('back') || 'Back'}
            </button>

            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {selectedPlatform === 'shopify'
                ? t('shopifyCredentials') || 'Shopify API Credentials'
                : t('wooCredentials') || 'WooCommerce API Credentials'}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '32px',
              }}
            >
              {t('credentialsDesc') || 'Enter your API credentials to connect your store'}
            </p>

            {selectedPlatform === 'shopify' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Shop Domain
                  </label>
                  <input
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="mystore.myshopify.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={shopifyClientId}
                    onChange={(e) => setShopifyClientId(e.target.value)}
                    placeholder="Your Shopify Client ID"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={shopifyClientSecret}
                    onChange={(e) => setShopifyClientSecret(e.target.value)}
                    placeholder="Your Shopify Client Secret"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    {t('storeUrl') || 'Store URL'}
                  </label>
                  <input
                    type="text"
                    value={wooStoreUrl}
                    onChange={(e) => setWooStoreUrl(e.target.value)}
                    placeholder="https://mystore.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    {t('consumerKey') || 'Consumer Key'}
                  </label>
                  <input
                    type="text"
                    value={wooConsumerKey}
                    onChange={(e) => setWooConsumerKey(e.target.value)}
                    placeholder="ck_..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    {t('consumerSecret') || 'Consumer Secret'}
                  </label>
                  <input
                    type="password"
                    value={wooConsumerSecret}
                    onChange={(e) => setWooConsumerSecret(e.target.value)}
                    placeholder="cs_..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#FEF2F2',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {platformTestSuccess === true && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  color: '#16A34A',
                  fontSize: '14px',
                }}
              >
                ✓ {t('connectionSuccess') || 'Connection successful!'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={handleTestConnection}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? t('testing') || 'Testing...' : t('testConnection') || 'Test Connection'}
              </button>
              <button
                onClick={handleCredentialsSubmit}
                disabled={isLoading || platformTestSuccess !== true}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: platformTestSuccess === true ? '#003450' : '#9CA3AF',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: isLoading || platformTestSuccess !== true ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? t('saving') || 'Saving...' : t('continue') || 'Continue'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: JTL Credentials */}
        {currentStep === 'jtl' && (
          <>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {t('jtlCredentials') || 'JTL-FFN API Credentials'}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '32px',
              }}
            >
              {t('jtlDesc') || 'Enter your JTL-FFN Merchant API credentials for warehouse integration'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('jtlClientId') || 'JTL Client ID'}
                </label>
                <input
                  type="text"
                  value={jtlClientId}
                  onChange={(e) => setJtlClientId(e.target.value)}
                  placeholder="Your JTL OAuth Client ID"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('jtlClientSecret') || 'JTL Client Secret'}
                </label>
                <input
                  type="password"
                  value={jtlClientSecret}
                  onChange={(e) => setJtlClientSecret(e.target.value)}
                  placeholder="Your JTL OAuth Client Secret"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('fulfillerId') || 'Fulfiller ID'}
                </label>
                <input
                  type="text"
                  value={jtlFulfillerId}
                  onChange={(e) => setJtlFulfillerId(e.target.value)}
                  placeholder="Your Fulfiller ID"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('warehouseId') || 'Warehouse ID'}
                </label>
                <input
                  type="text"
                  value={jtlWarehouseId}
                  onChange={(e) => setJtlWarehouseId(e.target.value)}
                  placeholder="Your Warehouse ID"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('environment') || 'Environment'}
                </label>
                <select
                  value={jtlEnvironment}
                  onChange={(e) => setJtlEnvironment(e.target.value as 'sandbox' | 'production')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                  }}
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            {jtlOAuthStatus === 'authorizing' && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#EFF6FF',
                  borderRadius: '8px',
                  color: '#1E40AF',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #3B82F6',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Authorizing with JTL FFN... Please complete authorization in the popup window.
              </div>
            )}

            {jtlOAuthStatus === 'success' && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  color: '#16A34A',
                  fontSize: '14px',
                }}
              >
                ✓ Authorization successful! JTL FFN is now connected.
              </div>
            )}

            {jtlOAuthError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#FEF2F2',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '14px',
                }}
              >
                {jtlOAuthError}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#FEF2F2',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={handleSkipJTL}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {t('skipForNow') || 'Skip for Now'}
              </button>
              <button
                onClick={handleJTLSubmit}
                disabled={isLoading || jtlOAuthStatus === 'authorizing' || !jtlClientId || !jtlClientSecret || !jtlFulfillerId || !jtlWarehouseId}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background:
                    jtlClientId && jtlClientSecret && jtlFulfillerId && jtlWarehouseId && jtlOAuthStatus !== 'authorizing'
                      ? '#003450'
                      : '#9CA3AF',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor:
                    isLoading || jtlOAuthStatus === 'authorizing' || !jtlClientId || !jtlClientSecret || !jtlFulfillerId || !jtlWarehouseId
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {isLoading ? t('saving') || 'Saving...' : jtlOAuthStatus === 'authorizing' ? 'Authorizing...' : t('saveAndAuthorize') || 'Save & Authorize'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <span style={{ color: 'white', fontSize: '32px' }}>✓</span>
            </div>

            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {t('setupComplete') || 'Setup Complete!'}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '32px',
              }}
            >
              {t('setupCompleteDesc') ||
                'Your store is now connected. We will sync your products and orders automatically.'}
            </p>

            <button
              onClick={handleComplete}
              style={{
                padding: '12px 48px',
                borderRadius: '8px',
                border: 'none',
                background: '#003450',
                color: 'white',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('goToDashboard') || 'Go to Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
