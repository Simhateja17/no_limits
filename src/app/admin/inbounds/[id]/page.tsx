'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock product data
interface Product {
  id: string;
  name: string;
  sku: string;
  gtin: string;
  qty: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Testproduct 1', sku: '#24234', gtin: '342345235324', qty: 3 },
  { id: '2', name: 'Testproduct 2', sku: '#24076', gtin: '324343243242', qty: 3 },
];

// Available products for adding
const availableProducts: Product[] = [
  { id: '3', name: 'Testproduct 3', sku: '#24235', gtin: '342345235325', qty: 1 },
  { id: '4', name: 'Testproduct 4', sku: '#24236', gtin: '342345235326', qty: 1 },
  { id: '5', name: 'Testproduct 5', sku: '#24237', gtin: '342345235327', qty: 1 },
  { id: '6', name: 'Testproduct 6', sku: '#24238', gtin: '342345235328', qty: 1 },
  { id: '7', name: 'Testproduct 7', sku: '#24234', gtin: '342345235324', qty: 1 },
  { id: '8', name: 'Product Alpha', sku: '#24239', gtin: '342345235329', qty: 1 },
  { id: '9', name: 'Product Beta', sku: '#24240', gtin: '342345235330', qty: 1 },
];

export default function AdminInboundDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const inboundId = params.id as string;

  const [editMode, setEditMode] = useState(false);
  const [presaleActive, setPresaleActive] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [eta, setEta] = useState('10.12.2025');
  const [freightForwarder, setFreightForwarder] = useState('10.12.2025');
  const [trackingNo, setTrackingNo] = useState('10.12.2025');
  const [qtyBoxes, setQtyBoxes] = useState('10');
  const [qtyPallets, setQtyPallets] = useState('10');
  const [totalCBM, setTotalCBM] = useState('10');
  const [extInorderId, setExtInorderId] = useState('DE3-3245');

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleAddProduct = (product: Product) => {
    if (!products.find(p => p.id === product.id)) {
      setProducts([...products, product]);
    }
  };

  const handleQuantityChange = (productId: string, newQty: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, qty: newQty } : p
    ));
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const filteredAvailableProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <span className="font-medium text-base">Inbound saved successfully!</span>
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
                    Inbound ID
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
                    {/* Status Dot */}
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
                  {inboundId}
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
                    External ID
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
                    {extInorderId}
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
                  Activate presale
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
                  By activating this function you can push all stocks of this inbound to your sales channels, this will allow you to sell before we set the stocks. After we set the stock it will reset this function.
                </p>
              
                {/* Toggle */}
                <button
                  onClick={() => setPresaleActive(!presaleActive)}
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: presaleActive ? '#003450' : '#D1D5DB',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
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
                    {editMode && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}></th>}
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>Product Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>SKU</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>GTIN</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                      {editMode && (
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      )}
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{product.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{product.sku}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{editMode ? product.gtin : `Merchant ${product.qty}`}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {editMode ? (
                          <input
                            type="number"
                            value={product.qty}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                            style={{
                              width: '60px',
                              padding: '6px 10px',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              fontSize: '14px',
                              textAlign: 'center'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '14px', color: '#111827' }}>{product.qty}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Products Section - Only in Edit Mode */}
            {editMode && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)'
              }}>
                <div style={{ marginBottom: searchQuery ? '16px' : 0 }}>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Add Products</label>
                  <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        paddingRight: searchQuery ? '36px' : '12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#E5E7EB',
                          color: '#6B7280',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          lineHeight: 1,
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {searchQuery && filteredAvailableProducts.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}></th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>Product Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>SKU</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>GTIN</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>QTY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAvailableProducts.map((product) => (
                        <tr key={product.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleAddProduct(product)}
                              style={{
                                padding: '5px 14px',
                                backgroundColor: '#003450',
                                color: 'white',
                                border: 'none',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Add
                            </button>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{product.name}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{product.sku}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{product.gtin}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <input
                              type="number"
                              value={product.qty}
                              readOnly
                              style={{
                                width: '60px',
                                padding: '6px 10px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '14px',
                                textAlign: 'center',
                                backgroundColor: 'white'
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

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
              }}>Delivery</h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.1vw, 15px)', 
                color: '#6B7280', 
                marginBottom: '16px' 
              }}>Use a permanent address where you can receive mail.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>ETA</label>
                  <input
                    type="text"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Freigt forwarder</label>
                  <input
                    type="text"
                    value={freightForwarder}
                    onChange={(e) => setFreightForwarder(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Tracking no</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Qty boxes</label>
                  <input
                    type="text"
                    value={qtyBoxes}
                    onChange={(e) => setQtyBoxes(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Qty pallets</label>
                  <input
                    type="text"
                    value={qtyPallets}
                    onChange={(e) => setQtyPallets(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Total CBM</label>
                  <input
                    type="text"
                    value={totalCBM}
                    onChange={(e) => setTotalCBM(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)', 
                    fontWeight: 500, 
                    color: '#374151', 
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>Ext. Inorder ID</label>
                  <input
                    type="text"
                    value={extInorderId}
                    onChange={(e) => setExtInorderId(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: 'clamp(13px, 1.1vw, 15px)',
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
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
              }}>Edit inorder</span>
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
              }}>Cancel inbound</h3>
              <p style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.1vw, 15px)', 
                color: '#6B7280', 
                marginBottom: '16px', 
                lineHeight: '1.5' 
              }}>
                Achtung, das Löschen des Artikels führt dazu, dass alle Warenbewegungen verloren gehen. Artikel können nur gelöscht werden wenn kein Bestand vorhanden ist und keine Reservierungen oder Anlieferungen anliegen.
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
                Cancel order
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
