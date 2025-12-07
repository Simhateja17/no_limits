'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

// Mock order data - in real app this would come from API
const mockOrderDetails = {
  orderId: '934242',
  status: 'Processing' as 'Processing' | 'On Hold' | 'Shipped' | 'Cancelled',
  deliveryMethod: {
    name: 'Max Mustermann',
    street: 'Musterstr. 10',
    city: '12345 Musterstadt',
    country: 'Deutschland',
  },
  shippingMethod: 'DHL Paket National',
  shipmentWeight: '0,58 kg',
  tags: ['b2b'],
  onHoldStatus: false,
  products: [
    { id: '1', name: 'Testproduct 1', sku: '#24234', gtin: '342345235324', qty: 3, merchant: 'Merchant 3' },
    { id: '2', name: 'Testproduct 2', sku: '#24076', gtin: '324343243242', qty: 1, merchant: 'Merchant 5' },
  ],
};

// Mock available products to add
const mockAvailableProducts = [
  { id: '3', name: 'Testproduct 3', sku: '#24235', gtin: '342345235325', qty: 1, merchant: 'Merchant 1' },
  { id: '4', name: 'Testproduct 4', sku: '#24236', gtin: '342345235326', qty: 1, merchant: 'Merchant 2' },
  { id: '5', name: 'Testproduct 5', sku: '#24237', gtin: '342345235327', qty: 1, merchant: 'Merchant 3' },
  { id: '6', name: 'Testproduct 6', sku: '#24238', gtin: '342345235328', qty: 1, merchant: 'Merchant 4' },
  { id: '7', name: 'Testproduct 7', sku: '#24234', gtin: '342345235324', qty: 1, merchant: 'Merchant 5' },
];

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processing':
      return '#6BAC4D';
    case 'On Hold':
      return '#F59E0B';
    case 'Shipped':
      return '#10B981';
    case 'Cancelled':
      return '#EF4444';
    default:
      return '#6BAC4D';
  }
};

export default function ClientOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editOrderEnabled, setEditOrderEnabled] = useState(false);
  const [orderProducts, setOrderProducts] = useState(mockOrderDetails.products);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [showProductList, setShowProductList] = useState(false);

  // Form state for edit modal
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    addressLine2: '',
    streetAddress: '',
    city: '',
    zipPostal: '',
    country: 'United States',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return null;
  }

  const orderId = params.orderId as string;

  const handleBack = () => {
    router.back();
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSaveAddress = () => {
    setShowEditModal(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  };

  // Handle removing product from order
  const handleRemoveProduct = (productId: string) => {
    setOrderProducts(orderProducts.filter(p => p.id !== productId));
  };

  // Handle adding product to order
  const handleAddProduct = (product: typeof mockAvailableProducts[0]) => {
    const qty = productQuantities[product.id] || 1;
    const existingProduct = orderProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setOrderProducts(orderProducts.map(p => 
        p.id === product.id ? { ...p, qty: p.qty + qty } : p
      ));
    } else {
      setOrderProducts([...orderProducts, { ...product, qty }]);
    }
    // Don't close the list - keep it open for adding more products
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
    !orderProducts.find(op => op.id === p.id)
  );

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F9FAFB]">
        <div className="px-[52px] py-[84px]">
          {/* Back Button */}
          <button
            onClick={handleBack}
            style={{
              width: '65px',
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
          <div className="mt-[81px] flex gap-[34px]">
            {/* Left Column - Order Info Cards */}
            <div className="flex flex-col gap-6" style={{ width: '270px' }}>
              {/* Order ID Box */}
              <div
                style={{
                  width: '270px',
                  minHeight: '104px',
                  gap: '4px',
                  padding: '20px 16px',
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
                      fontSize: '18px',
                      lineHeight: '24px',
                      color: '#111827',
                    }}
                  >
                    Order ID
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
                    {/* Green Dot */}
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(mockOrderDetails.status),
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
                      {mockOrderDetails.status}
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
                  {orderId || mockOrderDetails.orderId}
                </span>
              </div>

              {/* Delivery Method Box */}
              <div
                style={{
                  width: '270px',
                  minHeight: '212px',
                  gap: '4px',
                  padding: '20px 16px',
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
                      fontSize: '18px',
                      lineHeight: '24px',
                      color: '#111827',
                    }}
                  >
                    Delivery method
                  </span>
                  {/* Edit Pill */}
                  <button
                    onClick={handleEditClick}
                    style={{
                      height: '20px',
                      padding: '2px 10px',
                      borderRadius: '10px',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#003450',
                        textAlign: 'center',
                      }}
                    >
                      Edit
                    </span>
                  </button>
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '15px',
                    lineHeight: '36px',
                    color: '#111827',
                  }}
                >
                  <div>{mockOrderDetails.deliveryMethod.name}</div>
                  <div>{mockOrderDetails.deliveryMethod.street}</div>
                  <div>{mockOrderDetails.deliveryMethod.city}</div>
                  <div>{mockOrderDetails.deliveryMethod.country}</div>
                </div>
              </div>

              {/* Shipping Method Box */}
              <div
                style={{
                  width: '270px',
                  minHeight: '104px',
                  gap: '4px',
                  padding: '20px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  Shipping method
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <Image
                    src="/dhl.png"
                    alt="DHL"
                    width={24}
                    height={24}
                    style={{ borderRadius: '12px' }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#111827',
                    }}
                  >
                    {mockOrderDetails.shippingMethod}
                  </span>
                </div>
              </div>

              {/* Shipment Weight Box */}
              <div
                style={{
                  width: '270px',
                  minHeight: '187px',
                  gap: '4px',
                  padding: '20px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  Shipment Weight
                </span>
                <div
                  style={{
                    marginTop: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '15px',
                    lineHeight: '20px',
                    color: '#111827',
                  }}
                >
                  {mockOrderDetails.shipmentWeight}
                </div>
                <div
                  style={{
                    marginTop: '24px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '13px',
                    lineHeight: '20px',
                    color: '#9CA3AF',
                  }}
                >
                  Shipment weight is total weight of all products in this order, to change weight of the order you have to edit the single product weight
                </div>
              </div>
            </div>

            {/* Right Column - Products Table */}
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
                    gridTemplateColumns: editOrderEnabled ? '0.5fr 2fr 1fr 1.5fr 0.8fr' : '2fr 1fr 1.5fr 0.8fr',
                    padding: '12px 24px',
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  {editOrderEnabled && <span></span>}
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
                {orderProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: editOrderEnabled ? '0.5fr 2fr 1fr 1.5fr 0.8fr' : '2fr 1fr 1.5fr 0.8fr',
                      padding: '16px 24px',
                      borderBottom: index < orderProducts.length - 1 ? '1px solid #E5E7EB' : 'none',
                    }}
                  >
                    {editOrderEnabled && (
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
                    )}
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
                    {editOrderEnabled ? (
                      <input
                        type="number"
                        min="1"
                        value={product.qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newQty = value === '' ? 0 : parseInt(value);
                          setOrderProducts(orderProducts.map(p =>
                            p.id === product.id ? { ...p, qty: newQty } : p
                          ));
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!value || value < 1) {
                            setOrderProducts(orderProducts.map(p =>
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
                    ) : (
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                        }}
                      >
                        {product.qty}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Products Section - Only visible when edit mode is enabled */}
              {editOrderEnabled && (
                <>
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
                            <span
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                fontSize: '12px',
                                lineHeight: '16px',
                                color: '#FFFFFF',
                              }}
                            >
                              Add
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
                            value={productQuantities[product.id] ?? 1}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleQuantityChange(product.id, value === '' ? 0 : parseInt(value));
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value);
                              if (!value || value < 1) {
                                handleQuantityChange(product.id, 1);
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
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Edit Order Box */}
              <div
                style={{
                  width: '100%',
                  height: '72px',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                  Edit order
                </span>
                {/* Toggle */}
                <button
                  onClick={() => setEditOrderEnabled(!editOrderEnabled)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    padding: '2px',
                    backgroundColor: editOrderEnabled ? '#003450' : '#E5E7EB',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                      transform: editOrderEnabled ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Address Modal */}
        {showEditModal && (
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
            onClick={() => setShowEditModal(false)}
          >
            <div
              style={{
                width: '803px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                padding: '24px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#111827',
                  marginBottom: '24px',
                }}
              >
                Edit order
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* Address Line 2 */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* Street Address - Full Width */}
                <div className="flex flex-col gap-2 col-span-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    Street address
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* ZIP / Postal */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    ZIP / Postal
                  </label>
                  <input
                    type="text"
                    value={formData.zipPostal}
                    onChange={(e) => setFormData({ ...formData, zipPostal: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '9px 13px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                    }}
                    placeholder=""
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-2 col-span-2">
                  <label
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#374151',
                    }}
                  >
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '366px',
                        height: '38px',
                        padding: '9px 13px',
                        paddingRight: '32px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="United States">United States</option>
                      <option value="Germany">Germany</option>
                      <option value="Austria">Austria</option>
                      <option value="Switzerland">Switzerland</option>
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: 'calc(100% - 366px + 13px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveAddress}
                  style={{
                    height: '38px',
                    padding: '9px 17px',
                    borderRadius: '6px',
                    backgroundColor: '#003450',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#FFFFFF',
                    }}
                  >
                    Save
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
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
                width: '512px',
                maxWidth: '90vw',
                gap: '24px',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Green Checkmark Circle */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '24px',
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '24px',
                  textAlign: 'center',
                  color: '#111827',
                }}
              >
                Shipping address changed
              </span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
