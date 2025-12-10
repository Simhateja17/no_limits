'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChannelApiSetupProps {
  channelId: string;
  channelType: string; // 'Woocommerce' | 'Shopify' | 'Amazon'
  baseUrl: string;
}

// Warning Icon Component
function WarningIcon() {
  return (
    <svg
      width="clamp(16px, 1.47vw, 20px)"
      height="clamp(16px, 1.47vw, 20px)"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.57465 3.21665L1.51632 14.1666C1.37079 14.4187 1.29379 14.7044 1.29298 14.9954C1.29216 15.2864 1.36756 15.5725 1.51167 15.8254C1.65579 16.0784 1.86359 16.2893 2.11441 16.4372C2.36523 16.585 2.65032 16.6647 2.94132 16.6683H17.058C17.349 16.6647 17.6341 16.585 17.8849 16.4372C18.1357 16.2893 18.3435 16.0784 18.4876 15.8254C18.6317 15.5725 18.7071 15.2864 18.7063 14.9954C18.7055 14.7044 18.6285 14.4187 18.483 14.1666L11.4247 3.21665C11.2761 2.97174 11.0669 2.76925 10.8173 2.62866C10.5677 2.48806 10.2861 2.41431 9.99965 2.41431C9.71321 2.41431 9.43159 2.48806 9.18199 2.62866C8.93238 2.76925 8.72321 2.97174 8.57465 3.21665Z"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7.5V10.8333"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.1667H10.0083"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChannelApiSetup({ channelId, channelType, baseUrl }: ChannelApiSetupProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [storeUrl, setStoreUrl] = useState('');

  // Suppress unused variable warning
  void channelId;

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    // TODO: Save API credentials and proceed to next step
    console.log('Saving API credentials:', { clientId, clientSecret, storeUrl, channelType });
    router.push(`${baseUrl}/location-setup?type=${encodeURIComponent(channelType)}`);
  };

  // Get channel-specific labels
  const getUrlLabel = () => {
    switch (channelType) {
      case 'Shopify':
        return 'Shopify Store URL';
      case 'Amazon':
        return 'Amazon Marketplace URL';
      default:
        return 'Woocommerce URL';
    }
  };

  const getApiTitle = () => {
    switch (channelType) {
      case 'Shopify':
        return 'Shopify API';
      case 'Amazon':
        return 'Amazon API';
      default:
        return 'Woocommerce API';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#F9FAFB',
        padding: 'clamp(24px, 2.36vw, 32px) clamp(39px, 3.83vw, 52px)',
      }}
    >
      {/* Back Button - No arrow */}
      <button
        onClick={handleBack}
        style={{
          height: 'clamp(29px, 2.80vw, 38px)',
          borderRadius: '6px',
          border: '1px solid #D1D5DB',
          padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: 'clamp(30px, 2.94vw, 40px)',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(11px, 1.03vw, 14px)',
            lineHeight: 'clamp(15px, 1.47vw, 20px)',
            color: '#374151',
          }}
        >
          Back
        </span>
      </button>

      {/* Sales-Channels Title */}
      <h1
        style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 'clamp(14px, 1.33vw, 18px)',
          lineHeight: 'clamp(18px, 1.77vw, 24px)',
          color: '#111827',
          margin: '0 0 clamp(15px, 1.47vw, 20px) 0',
        }}
      >
        Sales-Channels
      </h1>

      {/* Horizontal Line */}
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#E5E7EB',
          marginBottom: 'clamp(32px, 3.14vw, 48px)',
        }}
      />

      {/* API Configuration Section */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(912px, 89.54vw, 1216px)',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(18px, 1.77vw, 24px)',
        }}
      >
        {/* Left Side - Title, Description, and Warning */}
        <div
          style={{
            width: 'clamp(292px, 28.65vw, 389px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(18px, 1.77vw, 24px)',
            flexShrink: 0,
          }}
        >
          {/* Title and Description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(3px, 0.29vw, 4px)',
            }}
          >
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(14px, 1.33vw, 18px)',
                lineHeight: 'clamp(18px, 1.77vw, 24px)',
                color: '#111827',
                margin: 0,
              }}
            >
              {getApiTitle()}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
                margin: 0,
              }}
            >
              Add your API details. You&apos;ll need ID and Secret.
            </p>
          </div>

          {/* Warning Box */}
          <div
            style={{
              width: '100%',
              borderRadius: '8px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FEF3C7',
              padding: 'clamp(12px, 1.18vw, 16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(6px, 0.59vw, 8px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 0.59vw, 8px)',
              }}
            >
              <WarningIcon />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: 'clamp(15px, 1.47vw, 20px)',
                  color: '#D97706',
                }}
              >
                Attention needed
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#92400E',
                margin: 0,
                paddingLeft: 'clamp(22px, 2.16vw, 28px)',
              }}
            >
              Its nessessary to have an active SSL Certificate.
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div
          style={{
            flex: 1,
            maxWidth: 'clamp(602px, 59.13vw, 803px)',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            padding: 'clamp(18px, 1.77vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(18px, 1.77vw, 24px)',
          }}
        >
          {/* Client ID Field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(6px, 0.59vw, 8px)',
            }}
          >
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#374151',
              }}
            >
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder=""
              style={{
                width: '100%',
                maxWidth: 'clamp(371px, 36.45vw, 495px)',
                height: 'clamp(29px, 2.80vw, 38px)',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>

          {/* Client Secret Field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(6px, 0.59vw, 8px)',
            }}
          >
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#374151',
              }}
            >
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder=""
              style={{
                width: '100%',
                maxWidth: 'clamp(371px, 36.45vw, 495px)',
                height: 'clamp(29px, 2.80vw, 38px)',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>

          {/* Store URL Field */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(6px, 0.59vw, 8px)',
            }}
          >
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#374151',
              }}
            >
              {getUrlLabel()}
            </label>
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder=""
              style={{
                width: '100%',
                maxWidth: 'clamp(371px, 36.45vw, 495px)',
                height: 'clamp(29px, 2.80vw, 38px)',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>

          {/* Next Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 'clamp(12px, 1.18vw, 16px)',
            }}
          >
            <button
              onClick={handleNext}
              style={{
                height: 'clamp(29px, 2.80vw, 38px)',
                borderRadius: '6px',
                border: 'none',
                padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                backgroundColor: '#003450',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: '1',
                  color: '#FFFFFF',
                }}
              >
                Next
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
