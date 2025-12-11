'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ChannelShippingSetupProps {
  channelId: string;
  channelType: string;
  baseUrl: string;
}

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

export function ChannelShippingSetup({ channelId, channelType, baseUrl }: ChannelShippingSetupProps) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tChannels = useTranslations('channels');
  const [selectedMethods, setSelectedMethods] = useState<{ [key: string]: string }>({
    '1': 'DHL Parcel',
    '2': 'DHL Parcel',
    '3': 'DHL Parcel',
    '4': 'DHL Parcel',
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Suppress unused variable warnings
  void channelId;
  void baseUrl;

  const handleBack = () => {
    router.back();
  };

  const handleFinish = () => {
    // TODO: Save shipping method mappings
    console.log('Saving shipping method mappings:', selectedMethods);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/client/channels');
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
    setOpenDropdown(null);
  };

  // Get channel-specific label
  const getChannelLabel = () => {
    switch (channelType) {
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
        paddingBottom: 'clamp(200px, 19.63vw, 300px)',
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
            lineHeight: '1',
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

      {/* Match Shipping Methods Section */}
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
                  onClick={() => setOpenDropdown(openDropdown === warehouseMethod.id ? null : warehouseMethod.id)}
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
                      transform: openDropdown === warehouseMethod.id ? 'rotate(180deg)' : 'rotate(0deg)',
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
                {openDropdown === warehouseMethod.id && (
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

            {/* Finish Button */}
            <button
              onClick={handleFinish}
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
                Finish
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
    </div>
  );
}
