'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Channel types
const channelTypes = ['Woocommerce', 'Shopify', 'Amazon'];

// Mock locations data
const mockLocations = [
  { id: '1', name: 'Location' },
  { id: '2', name: 'Location' },
  { id: '3', name: 'Location' },
  { id: '4', name: 'Location' },
  { id: '5', name: 'Location' },
  { id: '6', name: 'Location' },
  { id: '7', name: 'Location' },
  { id: '8', name: 'Location' },
];

// Mock warehouse shipping methods
const mockWarehouseMethods = [
  { id: '1', name: 'DHL' },
  { id: '2', name: 'DHL' },
  { id: '3', name: 'DHL' },
  { id: '4', name: 'DHL' },
];

// Mock channel shipping methods
const mockChannelMethods = [
  { id: '1', name: 'DHL Parcel' },
  { id: '2', name: 'DHL Letter' },
  { id: '3', name: 'UPS' },
  { id: '4', name: 'Pickup' },
  { id: '5', name: 'DHL' },
  { id: '6', name: 'Letter Standard' },
  { id: '7', name: 'Freight' },
  { id: '8', name: 'Air' },
];

interface ChannelSettingsProps {
  channelId: string;
  baseUrl: string;
  initialChannelType?: string;
  isNewChannel?: boolean;
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

// Download Icon Component
function DownloadIcon() {
  return (
    <svg
      width="clamp(15px, 1.47vw, 20px)"
      height="clamp(15px, 1.47vw, 20px)"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.33334 13.3333V14.1667C3.33334 14.8297 3.59673 15.4656 4.06558 15.9344C4.53442 16.4033 5.17029 16.6667 5.83334 16.6667H14.1667C14.8297 16.6667 15.4656 16.4033 15.9344 15.9344C16.4033 15.4656 16.6667 14.8297 16.6667 14.1667V13.3333M5.83334 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V3.33333"
        stroke="#003450"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Checkmark Icon for success modal
function CheckmarkIcon() {
  return (
    <svg
      width="clamp(32px, 3.14vw, 48px)"
      height="clamp(32px, 3.14vw, 48px)"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#D1FAE5" />
      <path
        d="M16 24L21 29L32 18"
        stroke="#059669"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'clamp(280px, 27.47vw, 373px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'clamp(8px, 0.78vw, 12px)',
          padding: 'clamp(32px, 3.14vw, 48px) clamp(24px, 2.36vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(16px, 1.57vw, 24px)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CheckmarkIcon />
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.33vw, 18px)',
            lineHeight: 'clamp(18px, 1.77vw, 24px)',
            color: '#111827',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Channel succesfully added
        </p>
      </div>
    </div>
  );
}

export function ChannelSettings({ channelId, baseUrl, initialChannelType = 'Woocommerce', isNewChannel = false }: ChannelSettingsProps) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tChannels = useTranslations('channels');
  
  // Channel Information State
  const [channelName, setChannelName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(initialChannelType);
  const [isChannelOn, setIsChannelOn] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // API Setup State
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  
  // Location Setup State
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  
  // Shipping Setup State
  const [selectedMethods, setSelectedMethods] = useState<{ [key: string]: string }>({
    '1': 'DHL Parcel',
    '2': 'DHL Parcel',
    '3': 'DHL Parcel',
    '4': 'DHL Parcel',
  });
  const [openShippingDropdown, setOpenShippingDropdown] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Suppress unused variable warning
  void channelId;
  void baseUrl;

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save all channel configuration
    console.log('Saving channel configuration:', {
      channelName,
      selectedChannel,
      clientId,
      clientSecret,
      storeUrl,
      selectedLocation,
      selectedMethods,
    });
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/client/channels');
  };

  const handleToggleChannel = () => {
    setIsChannelOn(!isChannelOn);
  };

  const handleDeleteChannel = () => {
    if (showDeleteConfirm) {
      // TODO: Actually delete the channel
      console.log('Deleting channel...');
      router.push('/client/channels');
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleReloadLocations = () => {
    // TODO: Reload locations from API
    console.log('Reloading locations...');
  };

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    setIsLocationDropdownOpen(false);
  };

  const handleReloadMethods = () => {
    // TODO: Reload methods from API
    console.log('Reloading methods...');
  };

  const handleMethodSelect = (warehouseId: string, methodName: string) => {
    setSelectedMethods((prev) => ({
      ...prev,
      [warehouseId]: methodName,
    }));
    setOpenShippingDropdown(null);
  };

  // Get channel-specific labels
  const getUrlLabel = () => {
    switch (selectedChannel) {
      case 'Shopify':
        return tChannels('shopifyStoreUrl');
      case 'Amazon':
        return tChannels('amazonMarketplaceUrl');
      default:
        return tChannels('woocommerceUrl');
    }
  };

  const getApiTitle = () => {
    switch (selectedChannel) {
      case 'Shopify':
        return tChannels('shopifyApi');
      case 'Amazon':
        return tChannels('amazonApi');
      default:
        return tChannels('woocommerceApi');
    }
  };

  const getChannelLabel = () => {
    switch (selectedChannel) {
      case 'Shopify':
        return 'Shopify';
      case 'Amazon':
        return 'Amazon';
      default:
        return 'Woocommerce';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#F9FAFB',
        padding: 'clamp(24px, 2.36vw, 32px) clamp(39px, 3.83vw, 52px)',
        paddingBottom: 'clamp(100px, 9.81vw, 150px)',
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
          {tCommon('back')}
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
        {tChannels('title')}
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

      {/* Channel Information Section */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(912px, 89.54vw, 1216px)',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(18px, 1.77vw, 24px)',
          marginBottom: 'clamp(48px, 4.71vw, 64px)',
        }}
      >
        {/* Left Side - Title and Description */}
        <div
          style={{
            width: 'clamp(292px, 28.65vw, 389px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(3px, 0.29vw, 4px)',
            flexShrink: 0,
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
            {tChannels('channelInformation')}
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
            {tChannels('channelInformationDescription')}
          </p>
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
          {/* Channel Name Field */}
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
              {tChannels('channelName')}
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
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

          {/* Channel Type Field */}
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
              {tChannels('channelLabel')}
            </label>
            <div className="relative" style={{ width: '100%', maxWidth: 'clamp(281px, 27.54vw, 374px)' }}>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="appearance-none cursor-pointer"
                style={{
                  width: '100%',
                  height: 'clamp(29px, 2.80vw, 38px)',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: 'clamp(7px, 0.66vw, 9px) clamp(30px, 2.94vw, 40px) clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: 'clamp(15px, 1.47vw, 20px)',
                  color: '#111827',
                  outline: 'none',
                }}
              >
                {channelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  right: 'clamp(10px, 0.96vw, 13px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <path
                  d="M6 8L10 12L14 8"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Section */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(912px, 89.54vw, 1216px)',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(18px, 1.77vw, 24px)',
          marginBottom: 'clamp(48px, 4.71vw, 64px)',
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
              {tChannels('enterCredentials')}
            </p>
          </div>

          {/* Warning Box - Only show for Woocommerce */}
          {selectedChannel === 'Woocommerce' && (
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
                  {tCommon('warning')}
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
                {tChannels('sslWarning')}
              </p>
            </div>
          )}
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
              {tChannels('clientId')}
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
              {tChannels('clientSecret')}
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
        </div>
      </div>

      {/* Location/Warehouse Section */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(912px, 89.54vw, 1216px)',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(18px, 1.77vw, 24px)',
          marginBottom: 'clamp(48px, 4.71vw, 64px)',
        }}
      >
        {/* Left Side - Title and Description */}
        <div
          style={{
            width: 'clamp(292px, 28.65vw, 389px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(3px, 0.29vw, 4px)',
            flexShrink: 0,
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
            {tChannels('chooseLocation')}
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
            {tChannels('chooseLocationDescription', { channel: selectedChannel.toLowerCase() })}
          </p>
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
          {/* Warehouse and Location Row */}
          <div
            style={{
              display: 'flex',
              gap: 'clamp(18px, 1.77vw, 24px)',
            }}
          >
            {/* Warehouse Column */}
            <div
              style={{
                flex: 1,
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
                  textAlign: 'center',
                }}
              >
                {tChannels('warehouse')}
              </label>
              <div
                style={{
                  width: '100%',
                  maxWidth: 'clamp(240px, 23.56vw, 320px)',
                  height: 'clamp(27px, 2.65vw, 36px)',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  padding: 'clamp(6px, 0.59vw, 8px) clamp(9px, 0.88vw, 12px)',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(11px, 1.03vw, 14px)',
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: '#6B7280',
                  }}
                >
                  JTL FFN Warehouse
                </span>
              </div>
            </div>

            {/* Location Column */}
            <div
              style={{
                flex: 1,
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
                  textAlign: 'center',
                }}
              >
                {getChannelLabel()}
              </label>
              
              {/* Custom Dropdown */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 'clamp(240px, 23.56vw, 320px)',
                }}
              >
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  style={{
                    width: '100%',
                    height: 'clamp(29px, 2.80vw, 38px)',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(11px, 1.03vw, 14px)',
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: selectedLocation ? '#111827' : '#9CA3AF',
                  }}
                >
                  <span>{selectedLocation || 'Location'}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: isLocationDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isLocationDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      maxHeight: 'clamp(180px, 17.67vw, 240px)',
                      overflowY: 'auto',
                      zIndex: 10,
                    }}
                  >
                    {mockLocations.map((location, index) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationSelect(location.name)}
                        style={{
                          width: '100%',
                          padding: 'clamp(8px, 0.78vw, 10px) clamp(10px, 0.96vw, 13px)',
                          backgroundColor: selectedLocation === location.name ? '#F9FAFB' : '#FFFFFF',
                          border: 'none',
                          borderBottom: index < mockLocations.length - 1 ? '1px solid #F3F4F6' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(11px, 1.03vw, 14px)',
                          lineHeight: 'clamp(15px, 1.47vw, 20px)',
                          color: '#111827',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedLocation === location.name ? '#F9FAFB' : '#FFFFFF';
                        }}
                      >
                        <span>{location.name}</span>
                        {selectedLocation === location.name && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 4L6 11.3333L2.66667 8"
                              stroke="#6366F1"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reload Locations Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <button
              onClick={handleReloadLocations}
              style={{
                height: 'clamp(30px, 2.94vw, 40px)',
                borderRadius: '100px',
                border: 'none',
                padding: 'clamp(8px, 0.78vw, 10px) clamp(12px, 1.18vw, 16px)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(6px, 0.59vw, 8px)',
                cursor: 'pointer',
              }}
            >
              <DownloadIcon />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: '1',
                  color: '#003450',
                }}
              >
                {tChannels('reloadLocations')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Shipping Methods Section */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(912px, 89.54vw, 1216px)',
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(18px, 1.77vw, 24px)',
          marginBottom: 'clamp(48px, 4.71vw, 64px)',
        }}
      >
        {/* Left Side - Title and Description */}
        <div
          style={{
            width: 'clamp(292px, 28.65vw, 389px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(3px, 0.29vw, 4px)',
            flexShrink: 0,
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
            Match Shipping Methods
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
            Here you will match your methods with our methods
          </p>
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
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              gap: 'clamp(18px, 1.77vw, 24px)',
            }}
          >
            <div
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#374151',
                textAlign: 'center',
              }}
            >
              Warehouse
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#374151',
                textAlign: 'center',
              }}
            >
              {getChannelLabel()}
            </div>
          </div>

          {/* Method Rows */}
          {mockWarehouseMethods.map((warehouseMethod) => (
            <div
              key={warehouseMethod.id}
              style={{
                display: 'flex',
                gap: 'clamp(18px, 1.77vw, 24px)',
                alignItems: 'center',
              }}
            >
              {/* Warehouse Method (Read-only) */}
              <div
                style={{
                  flex: 1,
                  height: 'clamp(36px, 3.53vw, 48px)',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  padding: 'clamp(8px, 0.78vw, 12px) clamp(12px, 1.18vw, 16px)',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(11px, 1.03vw, 14px)',
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: '#6B7280',
                  }}
                >
                  {warehouseMethod.name}
                </span>
              </div>

              {/* Channel Method Dropdown */}
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => setOpenShippingDropdown(openShippingDropdown === warehouseMethod.id ? null : warehouseMethod.id)}
                  style={{
                    width: '100%',
                    height: 'clamp(36px, 3.53vw, 48px)',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(8px, 0.78vw, 12px) clamp(12px, 1.18vw, 16px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(11px, 1.03vw, 14px)',
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: '#111827',
                  }}
                >
                  <span>{selectedMethods[warehouseMethod.id] || 'Select method'}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: openShippingDropdown === warehouseMethod.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {openShippingDropdown === warehouseMethod.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      maxHeight: 'clamp(160px, 15.69vw, 220px)',
                      overflowY: 'auto',
                      zIndex: 100,
                    }}
                  >
                    {mockChannelMethods.map((method, index) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(warehouseMethod.id, method.name)}
                        style={{
                          width: '100%',
                          padding: 'clamp(10px, 0.98vw, 14px) clamp(12px, 1.18vw, 16px)',
                          backgroundColor: selectedMethods[warehouseMethod.id] === method.name ? '#F9FAFB' : '#FFFFFF',
                          border: 'none',
                          borderBottom: index < mockChannelMethods.length - 1 ? '1px solid #F3F4F6' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: selectedMethods[warehouseMethod.id] === method.name ? 500 : 400,
                          fontSize: 'clamp(11px, 1.03vw, 14px)',
                          lineHeight: 'clamp(15px, 1.47vw, 20px)',
                          color: '#111827',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            selectedMethods[warehouseMethod.id] === method.name ? '#F9FAFB' : '#FFFFFF';
                        }}
                      >
                        <span>{method.name}</span>
                        {selectedMethods[warehouseMethod.id] === method.name && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 4L6 11.3333L2.66667 8"
                              stroke="#6366F1"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Action Buttons Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'clamp(12px, 1.18vw, 16px)',
            }}
          >
            {/* Reload Methods Button */}
            <button
              onClick={handleReloadMethods}
              style={{
                height: 'clamp(30px, 2.94vw, 40px)',
                borderRadius: '100px',
                border: 'none',
                padding: 'clamp(8px, 0.78vw, 10px) clamp(12px, 1.18vw, 16px)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(6px, 0.59vw, 8px)',
                cursor: 'pointer',
              }}
            >
              <DownloadIcon />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: '1',
                  color: '#003450',
                }}
              >
                Reload methods
              </span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
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
                {tCommon('save')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Manage Channel Section */}
      {!isNewChannel && (
        <div
          style={{
            width: '100%',
            maxWidth: 'clamp(912px, 89.54vw, 1216px)',
            display: 'flex',
            flexDirection: 'row',
            gap: 'clamp(18px, 1.77vw, 24px)',
          }}
        >
          {/* Left Side - Title and Description */}
          <div
            style={{
              width: 'clamp(292px, 28.65vw, 389px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(3px, 0.29vw, 4px)',
              flexShrink: 0,
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
              {tChannels('manageChannel')}
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
              {tChannels('manageChannelDescription')}
            </p>
          </div>

          {/* Right Side - Toggle and Delete Cards */}
          <div
            style={{
              flex: 1,
              maxWidth: 'clamp(602px, 59.13vw, 803px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(18px, 1.77vw, 24px)',
            }}
          >
            {/* Turn off Channel Card */}
            <div
              style={{
                width: '100%',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                padding: 'clamp(18px, 1.77vw, 24px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: 'clamp(15px, 1.47vw, 20px)',
                  color: '#111827',
                }}
              >
                {tChannels('turnOffChannel')}
              </span>
              
              {/* Toggle Switch */}
              <button
                onClick={handleToggleChannel}
                style={{
                  width: 'clamp(36px, 3.53vw, 48px)',
                  height: 'clamp(20px, 1.96vw, 26px)',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: isChannelOn ? '#003450' : '#E5E7EB',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 'clamp(16px, 1.57vw, 22px)',
                    height: 'clamp(16px, 1.57vw, 22px)',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: isChannelOn ? 'calc(100% - clamp(18px, 1.77vw, 24px))' : 'clamp(2px, 0.20vw, 2px)',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            </div>

            {/* Delete Channel Card */}
            <div
              style={{
                width: '100%',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                padding: 'clamp(18px, 1.77vw, 24px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(15px, 1.47vw, 20px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(6px, 0.59vw, 8px)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(11px, 1.03vw, 14px)',
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  {tChannels('deleteChannel')}
                </h3>
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
                  {tCommon('deleteWarning')}
                </p>
              </div>
              
              <button
                onClick={handleDeleteChannel}
                style={{
                  width: 'fit-content',
                  height: 'clamp(29px, 2.80vw, 38px)',
                  borderRadius: '6px',
                  border: 'none',
                  padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                  backgroundColor: '#FEE2E2',
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
                    lineHeight: 'clamp(15px, 1.47vw, 20px)',
                    color: '#991B1B',
                  }}
                >
                  {tChannels('deleteChannel')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
    </div>
  );
}
