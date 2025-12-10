'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

// Mock available products to add
const mockAvailableProducts = [
  { id: '1', name: 'Testproduct 1', sku: '#24234', gtin: '342345235324', qty: 1, merchant: 'Merchant 3' },
  { id: '2', name: 'Testproduct 2', sku: '#24076', gtin: '324343243242', qty: 1, merchant: 'Merchant 5' },
  { id: '3', name: 'Testproduct 3', sku: '#24235', gtin: '342345235325', qty: 1, merchant: 'Merchant 1' },
  { id: '4', name: 'Testproduct 4', sku: '#24236', gtin: '342345235326', qty: 1, merchant: 'Merchant 2' },
  { id: '5', name: 'Testproduct 5', sku: '#24237', gtin: '342345235327', qty: 1, merchant: 'Merchant 3' },
  { id: '6', name: 'Testproduct 6', sku: '#24238', gtin: '342345235328', qty: 1, merchant: 'Merchant 4' },
  { id: '7', name: 'Testproduct 7', sku: '#24239', gtin: '342345235329', qty: 1, merchant: 'Merchant 5' },
];

// Available delivery types
const deliveryTypes = [
  { id: 'freight', name: 'Freight forwarder' },
  { id: 'parcel', name: 'Parcel service' },
];

// Available freight forwarders
const freightForwarders = [
  { id: 'dhl', name: 'DHL Freight', logo: '/dhl.png' },
  { id: 'ups', name: 'UPS Freight', logo: '/ups.png' },
  { id: 'dpd', name: 'DPD', logo: '/DPD_logo(red)2015.png' },
  { id: 'hermes', name: 'Hermes', logo: '/hermes.png' },
];

export default function CreateInboundPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [inboundProducts, setInboundProducts] = useState<typeof mockAvailableProducts>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [showProductList, setShowProductList] = useState(false);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(deliveryTypes[0]);
  const [showDeliveryTypeDropdown, setShowDeliveryTypeDropdown] = useState(false);
  const [selectedFreightForwarder, setSelectedFreightForwarder] = useState(freightForwarders[0]);
  const [showFreightForwarderDropdown, setShowFreightForwarderDropdown] = useState(false);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle removing product from inbound
  const handleRemoveProduct = (productId: string) => {
    setInboundProducts(inboundProducts.filter(p => p.id !== productId));
  };

  // Handle adding product to inbound
  const handleAddProduct = (product: typeof mockAvailableProducts[0]) => {
    const qty = productQuantities[product.id] || 1;
    const existingProduct = inboundProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setInboundProducts(inboundProducts.map(p => 
        p.id === product.id ? { ...p, qty: p.qty + qty } : p
      ));
    } else {
      setInboundProducts([...inboundProducts, { ...product, qty }]);
    }
  };

  // Handle closing the product search
  const handleCloseProductSearch = () => {
    setProductSearchQuery('');
    setShowProductList(false);
  };

  // Handle quantity change for available products
  const handleQuantityChange = (productId: string, qty: number) => {
    setProductQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  // Filter available products based on search
  const filteredAvailableProducts = mockAvailableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) &&
    !inboundProducts.find(op => op.id === p.id)
  );

  // Handle create inbound
  const handleCreateInbound = () => {
    console.log('Creating inbound...', {
      deliveryType: selectedDeliveryType,
      freightForwarder: selectedFreightForwarder,
      expectedDate,
      notes,
      tags,
      products: inboundProducts,
    });
    
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
      router.push('/employee/inbounds');
    }, 2000);
  };

  // Calculate total quantity
  const totalQuantity = inboundProducts.reduce((sum, p) => sum + p.qty, 0);

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F9FAFB]">
        <div className="px-[3.8%] py-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            style={{
              height: '38px',
              gap: '8px',
              padding: '9px 17px 9px 15px',
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Back
            </span>
          </button>

          {/* Main Content */}
          <div className="mt-6 flex gap-[2.5%] flex-wrap lg:flex-nowrap">
            {/* Left Column - Inbound Info Cards */}
            <div className="flex flex-col gap-4 w-full lg:w-[20%] lg:min-w-[240px] lg:max-w-[280px]">
              {/* Inbound Title Box */}
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
                    Create Inbound
                  </span>
                  {/* Status Pill */}
                  <div
                    style={{
                      height: '26px',
                      gap: '8px',
                      padding: '3px 13px',
                      borderRadius: '13px',
                      border: '1px solid #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
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
                      Pending
                    </span>
                  </div>
                </div>
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
                  New Inbound
                </span>
              </div>

              {/* Delivery Type Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '90px',
                  gap: '4px',
                  padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
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
                  Delivery Type
                </span>
                <div style={{ position: 'relative', marginTop: '12px' }}>
                  <button
                    onClick={() => setShowDeliveryTypeDropdown(!showDeliveryTypeDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#111827',
                      }}
                    >
                      {selectedDeliveryType.name}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform: showDeliveryTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {showDeliveryTypeDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 50,
                      }}
                    >
                      {deliveryTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedDeliveryType(type);
                            setShowDeliveryTypeDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: selectedDeliveryType.id === type.id ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textAlign: 'left',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: '#111827',
                            }}
                          >
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Freight Forwarder Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '90px',
                  gap: '4px',
                  padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
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
                  Freight Forwarder
                </span>
                <div style={{ position: 'relative', marginTop: '12px' }}>
                  <button
                    onClick={() => setShowFreightForwarderDropdown(!showFreightForwarderDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Image
                        src={selectedFreightForwarder.logo}
                        alt={selectedFreightForwarder.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: '12px' }}
                      />
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                        }}
                      >
                        {selectedFreightForwarder.name}
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform: showFreightForwarderDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {showFreightForwarderDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 50,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {freightForwarders.map((forwarder) => (
                        <button
                          key={forwarder.id}
                          onClick={() => {
                            setSelectedFreightForwarder(forwarder);
                            setShowFreightForwarderDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: selectedFreightForwarder.id === forwarder.id ? '#F3F4F6' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textAlign: 'left',
                          }}
                        >
                          <Image
                            src={forwarder.logo}
                            alt={forwarder.name}
                            width={24}
                            height={24}
                            style={{ borderRadius: '12px' }}
                          />
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: '#111827',
                            }}
                          >
                            {forwarder.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Date Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '90px',
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
                  Expected Date
                </span>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#111827',
                  }}
                />
              </div>

              {/* Total Quantity Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '90px',
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
                  Announced Quantity
                </span>
                <div
                  style={{
                    marginTop: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    lineHeight: '20px',
                    color: '#111827',
                  }}
                >
                  {totalQuantity} items
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(11px, 0.95vw, 13px)',
                    lineHeight: '18px',
                    color: '#9CA3AF',
                  }}
                >
                  {inboundProducts.length} products
                </div>
              </div>

              {/* Tags Box */}
              <div
                style={{
                  width: '100%',
                  minWidth: 'clamp(240px, 19.9%, 270px)',
                  minHeight: '150px',
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
                  Tags
                </span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
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
                        {tag}
                      </span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3L3 9M3 3L9 9" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div 
                  className="relative mt-4"
                  style={{
                    width: '100%',
                  }}
                >
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag"
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      padding: '10px 60px 10px 12px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#111827',
                    }}
                  />
                  <button
                    onClick={handleAddTag}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '28px',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Products and Actions */}
            <div className="flex flex-col gap-6" style={{ flex: 1, maxWidth: '927px' }}>
              {/* Products Table */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: '0.5fr 2fr 1fr 1.5fr 0.8fr',
                    padding: '12px 24px',
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <span></span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    Product Name
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    SKU
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    GTIN
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    QTY
                  </span>
                </div>

                {/* Table Body */}
                {inboundProducts.length === 0 ? (
                  <div
                    style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      color: '#6B7280',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    No products added yet. Use the search below to add products.
                  </div>
                ) : (
                  inboundProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="grid items-center"
                      style={{
                        gridTemplateColumns: '0.5fr 2fr 1fr 1.5fr 0.8fr',
                        padding: '16px 24px',
                        borderBottom: index < inboundProducts.length - 1 ? '1px solid #E5E7EB' : 'none',
                      }}
                    >
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 10px',
                          borderRadius: '10px',
                          backgroundColor: '#FEE2E2',
                          border: 'none',
                          cursor: 'pointer',
                          width: 'fit-content',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: '#DC2626',
                          }}
                        >
                          Remove
                        </span>
                      </button>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                        }}
                      >
                        {product.name}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                        }}
                      >
                        {product.sku}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#6B7280',
                        }}
                      >
                        {product.gtin}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={product.qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newQty = value === '' ? 0 : parseInt(value);
                          setInboundProducts(inboundProducts.map(p =>
                            p.id === product.id ? { ...p, qty: newQty } : p
                          ));
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!value || value < 1) {
                            setInboundProducts(inboundProducts.map(p =>
                              p.id === product.id ? { ...p, qty: 1 } : p
                            ));
                          }
                        }}
                        style={{
                          width: '60px',
                          height: '32px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Add Products Search Box */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 'clamp(280px, 23.5vw, 320px)',
                  minHeight: 'clamp(48px, 3.9vw, 54px)',
                  padding: 'clamp(10px, 1vw, 12px) clamp(10px, 1vw, 12px)',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#374151',
                    marginBottom: '4px',
                  }}
                >
                  Add Products
                </label>
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    if (e.target.value) {
                      setShowProductList(true);
                    }
                  }}
                  placeholder="Search products..."
                  style={{
                    width: 'calc(100% - 24px)',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    backgroundColor: 'transparent',
                  }}
                />
                {productSearchQuery && (
                  <button
                    onClick={handleCloseProductSearch}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '10px',
                      background: '#e5e7eb',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Available Products Table */}
              {showProductList && productSearchQuery && filteredAvailableProducts.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Table Header */}
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: '0.5fr 2fr 1fr 1.5fr 0.8fr',
                      padding: '12px 24px',
                      borderBottom: '1px solid #E5E7EB',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    <span></span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>Product Name</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>SKU</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>GTIN</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>QTY</span>
                  </div>

                  {/* Table Body */}
                  {filteredAvailableProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="grid items-center"
                      style={{
                        gridTemplateColumns: '0.5fr 2fr 1fr 1.5fr 0.8fr',
                        padding: '16px 24px',
                        borderBottom: index < filteredAvailableProducts.length - 1 ? '1px solid #E5E7EB' : 'none',
                      }}
                    >
                      <button
                        onClick={() => handleAddProduct(product)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 10px',
                          borderRadius: '10px',
                          backgroundColor: '#003450',
                          border: 'none',
                          cursor: 'pointer',
                          width: 'fit-content',
                        }}
                      >
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF' }}>Add</span>
                      </button>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#111827' }}>{product.name}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#111827' }}>{product.sku}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#6B7280' }}>{product.gtin}</span>
                      <input
                        type="number"
                        min="1"
                        value={productQuantities[product.id] ?? 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value === '' ? 0 : parseInt(e.target.value))}
                        onBlur={(e) => { if (!parseInt(e.target.value) || parseInt(e.target.value) < 1) handleQuantityChange(product.id, 1); }}
                        style={{ width: '60px', height: '32px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#111827', textAlign: 'center' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '150px',
                  gap: '12px',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(16px, 1.3vw, 18px)', lineHeight: '24px', color: '#111827', display: 'block' }}>Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this inbound..."
                  style={{ width: '100%', minHeight: '80px', marginTop: '12px', padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px', color: '#111827', resize: 'vertical' }}
                />
              </div>

              {/* Create Inbound Button Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '100px',
                  gap: '20px',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(16px, 1.3vw, 18px)', lineHeight: '24px', color: '#111827', display: 'block' }}>Save Inbound</span>
                <p style={{ marginTop: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#6B7280' }}>
                  Review your inbound details and click below to create the inbound. You can edit the inbound later if needed.
                </p>
                <button
                  onClick={handleCreateInbound}
                  disabled={inboundProducts.length === 0}
                  style={{
                    marginTop: '20px',
                    height: 'clamp(34px, 2.8vw, 38px)',
                    padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                    borderRadius: '6px',
                    backgroundColor: inboundProducts.length === 0 ? '#9CA3AF' : '#003450',
                    border: 'none',
                    cursor: inboundProducts.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(12px, 1.03vw, 14px)', lineHeight: '20px', color: '#FFFFFF', whiteSpace: 'nowrap', textAlign: 'center' }}>Create inbound</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ width: '512px', maxWidth: '90vw', gap: '24px', borderRadius: '8px', padding: '24px', backgroundColor: '#FFFFFF', boxShadow: '0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '18px', lineHeight: '24px', textAlign: 'center', color: '#111827' }}>Inbound created successfully</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
