'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Channel types
const channelTypes = ['Woocommerce', 'Shopify', 'Amazon'];

interface ChannelSettingsProps {
  channelId: string;
  baseUrl: string;
  initialChannelType?: string;
  isNewChannel?: boolean;
}

export function ChannelSettings({ channelId, baseUrl, initialChannelType = 'Woocommerce', isNewChannel = false }: ChannelSettingsProps) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tChannels = useTranslations('channels');
  const [channelName, setChannelName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(initialChannelType);
  const [isChannelOn, setIsChannelOn] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    // Navigate to API setup page with channel type
    router.push(`${baseUrl}/${channelId}/api-setup?type=${encodeURIComponent(selectedChannel)}${isNewChannel ? '&isNew=true' : ''}`);
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
                {tCommon('next')}
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
    </div>
  );
}
