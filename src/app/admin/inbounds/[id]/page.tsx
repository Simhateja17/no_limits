'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useInbound } from '@/lib/hooks';

// Inbound item interface
interface InboundItem {
  id: string;
  expectedQuantity: number;
  receivedQuantity: number | null;
  product: {
    name: string;
    sku: string;
  };
}

export default function AdminInboundDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const tOrders = useTranslations('orders');
  const tMessages = useTranslations('messages');
  const tInbounds = useTranslations('inbounds');
  const inboundId = params.id as string;

  // Fetch real inbound data
  const { inbound, loading, error, refetch } = useInbound(inboundId);

  const [editMode, setEditMode] = useState(false);
  const [presaleActive, setPresaleActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state - will be populated from API data
  const [eta, setEta] = useState('');
  const [freightForwarder, setFreightForwarder] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [qtyBoxes, setQtyBoxes] = useState('');
  const [qtyPallets, setQtyPallets] = useState('');
  const [totalCBM, setTotalCBM] = useState('');
  const [extInboundId, setExtInboundId] = useState('');

  // Update form state when inbound data loads
  useEffect(() => {
    if (inbound) {
      setEta(inbound.expectedDate ? new Date(inbound.expectedDate).toLocaleDateString('de-DE') : '');
      setFreightForwarder(inbound.deliveryType || '');
      setExtInboundId(inbound.externalInboundId || '');
      // These fields aren't in the current schema but could be added
      setTrackingNo('');
      setQtyBoxes('');
      setQtyPallets('');
      setTotalCBM('');
    }
  }, [inbound]);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_URL}/data/inbounds/${inboundId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryType: freightForwarder,
          expectedDate: eta ? new Date(eta).toISOString() : null,
          carrierName: freightForwarder,
          trackingNumber: trackingNo,
          externalInboundId: extInboundId,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
        // Refresh the data
        refetch();
      } else {
        const error = await response.json();
        console.error('Failed to save inbound:', error);
        alert('Failed to save changes: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving inbound:', error);
      alert('An error occurred while saving changes');
    }
  };

  // Map status to display format
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RECEIVED':
      case 'BOOKED_IN':
        return '#10B981'; // green
      case 'PARTIALLY_RECEIVED':
      case 'PARTIALLY_BOOKED_IN':
        return '#F59E0B'; // amber
      default:
        return '#F59E0B'; // amber for pending
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RECEIVED':
      case 'BOOKED_IN':
        return tInbounds('bookedIn');
      case 'PARTIALLY_RECEIVED':
      case 'PARTIALLY_BOOKED_IN':
        return tInbounds('partiallyBookedIn');
      default:
        return tInbounds('pending');
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003450] mx-auto"></div>
            <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !inbound) {
    return (
      <DashboardLayout>
        <div className="w-full min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || tMessages('inboundNotFound')}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#003450] text-white rounded-md hover:bg-[#002940]"
            >
              {tCommon('retry')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F9FAFB]">
        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-base">{tMessages('inboundSavedSuccessfully')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="px-[3.8%] py-6">
          {/* Back button */}
          <button
            onClick={() => router.push('/admin/inbounds')}
            style={{
              height: '38px',
              padding: '9px 17px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
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
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {tCommon('back')}
            </span>
          </button>

          {/* Main Content */}
          <div className="mt-6 flex gap-[2.5%] flex-wrap lg:flex-nowrap">
            {/* Left Sidebar */}
            <div className="flex flex-col gap-4 w-full lg:w-[20%] lg:min-w-[240px] lg:max-w-[280px]">
            {/* Inbound ID Card */}
              <div
                style={{
                  width: '100%',
                  minHeight: '104px',
                  gap: '4px',
                  padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                {locale === 'de' ? (
                  // German layout: Tag above ID
                  <>
                    <div className="flex items-center justify-start mb-2">
                      <div
                        style={{
                          height: '26px',
                          gap: '8px',
                          padding: '3px 13px',
                          borderRadius: '13px',
                          border: '1px solid #D1D5DB',
                          display: 'flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(inbound.status),
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '15px',
                            lineHeight: '20px',
                            color: '#000000',
                          }}
                        >
                          {getStatusLabel(inbound.status)}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(16px, 1.3vw, 18px)',
                        lineHeight: '24px',
                        color: '#111827',
                      }}
                    >
                      {tInbounds('inboundId')}
                    </span>
                  </>
                ) : (
                  // English layout: Tag inline with ID
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(16px, 1.3vw, 18px)',
                        lineHeight: '24px',
                        color: '#111827',
                      }}
                    >
                      {tInbounds('inboundId')}
                    </span>
                    <div
                      style={{
                        height: '26px',
                        gap: '8px',
                        padding: '3px 13px',
                        borderRadius: '13px',
                        border: '1px solid #D1D5DB',
                        display: 'flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(inbound.status),
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '15px',
                          lineHeight: '20px',
                          color: '#000000',
                        }}
                      >
                        {getStatusLabel(inbound.status)}
                      </span>
                    </div>
                  </div>
                )}
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: '#6B7280',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {inbound.inboundId}
                </span>

                <div style={{ marginTop: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(14px, 1.1vw, 16px)',
                      lineHeight: '24px',
                      color: '#111827',
                    }}
                  >
                    {tInbounds('extInboundId')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '15px',
                      lineHeight: '24px',
                      color: '#6B7280',
                      display: 'block',
                    }}
                  >
                    {extInboundId || 'N/A'}
                  </span>
                </div>
              </div>

            {/* Activate Presale Card */}
              <div
                style={{
                  width: '100%',
                  minHeight: '140px',
                  gap: '4px',
                  padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(16px, 1.3vw, 18px)',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  {tMessages('activatePresale')}
                </span>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1vw, 14px)',
                    lineHeight: '1.5',
                    color: '#6B7280',
                    marginTop: '8px',
                    marginBottom: '16px',
                  }}
                >
                  {tMessages('activatePresaleDescription')}
                </p>
              
                {/* Toggle */}
                <button
                  onClick={() => editMode && setPresaleActive(!presaleActive)}
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: presaleActive ? '#003450' : '#D1D5DB',
                    cursor: editMode ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                    opacity: editMode ? 1 : 0.6
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    left: presaleActive ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></span>
                </button>
              </div>
            </div>

          {/* Right Content */}
            <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ maxWidth: '927px' }}>
              {/* Products Table */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>{tOrders('productName')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>{tOrders('sku')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>{tInbounds('announcedQty')}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>{tInbounds('deliveredQty')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inbound.items && inbound.items.length > 0 ? (
                    inbound.items.map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.product.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{item.product.sku}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.expectedQuantity}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.receivedQuantity ?? 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280' }}>
                        {tMessages('noProductsFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Delivery Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
              padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)'
            }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                lineHeight: '24px',
                color: '#111827', 
                marginBottom: '4px' 
              }}>{tMessages('delivery')}</h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.1vw, 15px)', 
                color: '#6B7280', 
                marginBottom: '16px' 
              }}>{tMessages('deliveryDescription')}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('eta')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {eta}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('freightForwarder')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={freightForwarder}
                      onChange={(e) => setFreightForwarder(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {freightForwarder}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('trackingNo')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {trackingNo}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('qtyBoxes')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={qtyBoxes}
                      onChange={(e) => setQtyBoxes(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {qtyBoxes}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('qtyPallets')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={qtyPallets}
                      onChange={(e) => setQtyPallets(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {qtyPallets}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>{tMessages('totalCBM')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={totalCBM}
                      onChange={(e) => setTotalCBM(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {totalCBM}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    fontWeight: 500,
                    color: '#374151',
                    display: 'block',
                    marginBottom: '8px'
                  }}>{tInbounds('extInboundId')}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={extInboundId}
                      onChange={(e) => setExtInboundId(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: 'clamp(13px, 1.1vw, 15px)',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(13px, 1.1vw, 15px)',
                          color: '#6B7280',
                        }}
                      >
                        {extInboundId || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Inorder Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
              padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                lineHeight: '24px',
                color: '#111827' 
              }}>{tInbounds('editInbound')}</span>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: editMode ? '#003450' : '#D1D5DB',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: editMode ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}></span>
              </button>
            </div>

            {/* Cancel Inbound Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
              padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)'
            }}>
              <h3 style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                lineHeight: '24px',
                color: '#111827', 
                marginBottom: '8px' 
              }}>{tInbounds('cancelInbound')}</h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.1vw, 15px)', 
                color: '#6B7280', 
                marginBottom: '16px', 
                lineHeight: '1.5' 
              }}>
                {tCommon('deleteWarning')}
              </p>
              <button
                style={{
                  padding: '9px 17px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {tInbounds('cancelInbound')}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
