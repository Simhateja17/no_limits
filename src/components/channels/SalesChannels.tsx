'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Channel interface
interface Channel {
  id: string;
  name: string;
  type: 'Woocommerce' | 'Shopify' | 'Amazon';
  url: string;
  status: 'Active' | 'Inactive';
}

// Mock data
const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Woocommerce',
    type: 'Woocommerce',
    url: 'www.teststore.de',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Shopify',
    type: 'Shopify',
    url: 'www.testshopifystore.de',
    status: 'Inactive',
  },
];

// Status Badge Component
function StatusBadge({ status }: { status: 'Active' | 'Inactive' }) {
  const isActive = status === 'Active';
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'clamp(16px, 1.47vw, 20px)',
        borderRadius: '10px',
        padding: 'clamp(1.5px, 0.15vw, 2px) clamp(7.5px, 0.74vw, 10px)',
        backgroundColor: isActive ? '#F3F4F6' : '#FEE2E2',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 'clamp(10px, 0.88vw, 12px)',
        lineHeight: 'clamp(13px, 1.18vw, 16px)',
        textAlign: 'center',
        color: isActive ? '#003450' : '#991B1B',
      }}
    >
      {status}
    </span>
  );
}

// Adjustments Icon Component
function AdjustmentsIcon() {
  return (
    <svg
      width="clamp(13px, 1.18vw, 16px)"
      height="clamp(11px, 1.03vw, 14px)"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 3H5M5 3C5 4.10457 5.89543 5 7 5C8.10457 5 9 4.10457 9 3M5 3C5 1.89543 5.89543 1 7 1C8.10457 1 9 1.89543 9 3M9 3H15M1 11H9M9 11C9 12.1046 9.89543 13 11 13C12.1046 13 13 12.1046 13 11M9 11C9 9.89543 9.89543 9 11 9C12.1046 9 13 9.89543 13 11M13 11H15"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Channel Card Component
function ChannelCard({ channel, onSettingsClick, onNameClick }: { channel: Channel; onSettingsClick: (id: string) => void; onNameClick: (id: string) => void }) {
  return (
    <div
      style={{
        width: 'clamp(292px, 28.65vw, 389px)',
        height: 'clamp(110px, 10.75vw, 146px)',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Card Content */}
      <div
        style={{
          flex: 1,
          padding: 'clamp(12px, 1.18vw, 16px) clamp(18px, 1.77vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(3px, 0.29vw, 4px)',
        }}
      >
        {/* Name and Status Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 0.74vw, 10px)',
          }}
        >
          <span
            onClick={() => onNameClick(channel.id)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(11px, 1.03vw, 14px)',
              lineHeight: 'clamp(16px, 1.47vw, 20px)',
              color: '#111827',
              cursor: 'pointer',
            }}
          >
            {channel.name}
          </span>
          <StatusBadge status={channel.status} />
        </div>

        {/* URL */}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(11px, 1.03vw, 14px)',
            lineHeight: 'clamp(16px, 1.47vw, 20px)',
            color: '#6B7280',
          }}
        >
          {channel.url}
        </span>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => onSettingsClick(channel.id)}
        style={{
          width: '100%',
          height: 'clamp(40px, 3.90vw, 53px)',
          padding: 'clamp(13px, 1.25vw, 17px) 0 clamp(12px, 1.18vw, 16px) 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(9px, 0.88vw, 12px)',
          backgroundColor: '#FFFFFF',
          border: 'none',
          borderTop: '1px solid #E5E7EB',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <AdjustmentsIcon />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(11px, 1.03vw, 14px)',
            lineHeight: 'clamp(16px, 1.47vw, 20px)',
            color: '#374151',
          }}
        >
          Settings
        </span>
      </button>
    </div>
  );
}

// Plus Icon Component
function PlusIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4V16M4 10H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Empty State Plus Icon (larger, with circle)
function EmptyStatePlusIcon() {
  return (
    <div
      style={{
        width: 'clamp(36px, 3.53vw, 48px)',
        height: 'clamp(36px, 3.53vw, 48px)',
        borderRadius: '50%',
        border: '2px solid #D1D5DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'clamp(12px, 1.18vw, 16px)',
      }}
    >
      <svg
        width="clamp(18px, 1.77vw, 24px)"
        height="clamp(18px, 1.77vw, 24px)"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface SalesChannelsProps {
  baseUrl: string;
}

// Channel Type Selection Modal
function ChannelTypeModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (type: 'Woocommerce' | 'Shopify' | 'Amazon') => void;
}) {
  if (!isOpen) return null;

  const channelTypes: { type: 'Woocommerce' | 'Shopify' | 'Amazon'; label: string; description: string }[] = [
    { type: 'Woocommerce', label: 'Woocommerce', description: 'Connect your WooCommerce store' },
    { type: 'Shopify', label: 'Shopify', description: 'Connect your Shopify store' },
    { type: 'Amazon', label: 'Amazon', description: 'Connect your Amazon marketplace' },
  ];

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
      onClick={onClose}
    >
      <div
        style={{
          width: 'clamp(320px, 31.42vw, 440px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'clamp(8px, 0.78vw, 12px)',
          padding: 'clamp(24px, 2.36vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(20px, 1.96vw, 28px)',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(16px, 1.57vw, 22px)',
              lineHeight: 'clamp(20px, 1.96vw, 28px)',
              color: '#111827',
              margin: 0,
            }}
          >
            Select Channel Type
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 'clamp(24px, 2.36vw, 32px)',
              height: 'clamp(24px, 2.36vw, 32px)',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Channel Type Options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 1.18vw, 16px)',
          }}
        >
          {channelTypes.map((channel) => (
            <button
              key={channel.type}
              onClick={() => onSelect(channel.type)}
              style={{
                width: '100%',
                padding: 'clamp(14px, 1.37vw, 20px) clamp(16px, 1.57vw, 22px)',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'clamp(4px, 0.39vw, 6px)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#003450';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(13px, 1.18vw, 16px)',
                  lineHeight: 'clamp(16px, 1.47vw, 20px)',
                  color: '#111827',
                }}
              >
                {channel.label}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(11px, 1.03vw, 14px)',
                  lineHeight: 'clamp(14px, 1.37vw, 18px)',
                  color: '#6B7280',
                }}
              >
                {channel.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SalesChannels({ baseUrl }: SalesChannelsProps) {
  const router = useRouter();
  const [showChannelTypeModal, setShowChannelTypeModal] = useState(false);

  // For demo purposes, you can toggle this to see empty state
  const channels = mockChannels;
  const hasChannels = channels.length > 0;

  const handleBack = () => {
    router.back();
  };

  const handleSettingsClick = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      router.push(`${baseUrl}/${channelId}/settings?type=${encodeURIComponent(channel.type)}`);
    }
  };

  const handleNameClick = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      router.push(`${baseUrl}/${channelId}/settings?type=${encodeURIComponent(channel.type)}`);
    }
  };

  const handleNewChannel = () => {
    setShowChannelTypeModal(true);
  };

  const handleChannelTypeSelect = (type: 'Woocommerce' | 'Shopify' | 'Amazon') => {
    setShowChannelTypeModal(false);
    // Generate a new channel ID (in real app, this would come from backend)
    const newChannelId = 'new';
    router.push(`${baseUrl}/${newChannelId}/settings?type=${encodeURIComponent(type)}&isNew=true`);
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
      {/* Header Row - Back Button and New Channel Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(30px, 2.94vw, 40px)',
        }}
      >
        {/* Back Button */}
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

        {/* New Channel Button */}
        <button
          onClick={handleNewChannel}
          style={{
            height: 'clamp(29px, 2.80vw, 38px)',
            borderRadius: '6px',
            border: 'none',
            padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
            gap: 'clamp(6px, 0.59vw, 8px)',
            backgroundColor: '#003450',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <PlusIcon />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(11px, 1.03vw, 14px)',
              lineHeight: 'clamp(15px, 1.47vw, 20px)',
              color: '#FFFFFF',
            }}
          >
            New Channel
          </span>
        </button>
      </div>

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
          marginBottom: 'clamp(24px, 2.36vw, 32px)',
        }}
      />

      {/* Content - Either Channel Cards or Empty State */}
      {hasChannels ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(18px, 1.77vw, 24px)',
          }}
        >
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSettingsClick={handleSettingsClick}
              onNameClick={handleNameClick}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 'clamp(80px, 7.86vw, 120px)',
            paddingBottom: 'clamp(80px, 7.86vw, 120px)',
          }}
        >
          <EmptyStatePlusIcon />
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1.03vw, 14px)',
              lineHeight: 'clamp(16px, 1.47vw, 20px)',
              color: '#111827',
              margin: '0 0 clamp(6px, 0.59vw, 8px) 0',
              textAlign: 'center',
            }}
          >
            No connected Sales-Channel
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(11px, 1.03vw, 14px)',
              lineHeight: 'clamp(16px, 1.47vw, 20px)',
              color: '#6B7280',
              margin: '0 0 clamp(18px, 1.77vw, 24px) 0',
              textAlign: 'center',
            }}
          >
            Get started by connect your first channel.
          </p>
          <button
            onClick={handleNewChannel}
            style={{
              height: 'clamp(29px, 2.80vw, 38px)',
              borderRadius: '6px',
              border: 'none',
              padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
              gap: 'clamp(6px, 0.59vw, 8px)',
              backgroundColor: '#003450',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <PlusIcon />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#FFFFFF',
              }}
            >
              New Channel
            </span>
          </button>
        </div>
      )}

      {/* Channel Type Selection Modal */}
      <ChannelTypeModal
        isOpen={showChannelTypeModal}
        onClose={() => setShowChannelTypeModal(false)}
        onSelect={handleChannelTypeSelect}
      />
    </div>
  );
}
