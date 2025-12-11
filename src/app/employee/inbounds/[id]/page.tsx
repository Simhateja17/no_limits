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

export default function EmployeeInboundDetailPage() {
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
  const [extInorderId, setExtInorderId] = useState('10');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
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

  // Responsive styles based on 1358px reference width
  // Using clamp() for proportional scaling across desktop sizes
  const styles = {
    // Sidebar width: 220px at 1358px = 16.2% -> clamp(180px, 16.2vw, 250px)
    sidebarWidth: 'clamp(180px, 16.2vw, 250px)',
    // Gap: 24px at 1358px = 1.77% -> clamp(16px, 1.77vw, 32px)
    mainGap: 'clamp(16px, 1.77vw, 32px)',
    // Padding: 32px (px-8) at 1358px = 2.36% -> clamp(20px, 2.36vw, 40px)
    containerPadding: 'clamp(20px, 2.36vw, 40px)',
    // Card padding: 20px at 1358px = 1.47% -> clamp(16px, 1.47vw, 24px)
    cardPadding: 'clamp(16px, 1.47vw, 24px)',
    // Section padding: 24px at 1358px = 1.77% -> clamp(18px, 1.77vw, 28px)
    sectionPadding: 'clamp(18px, 1.77vw, 28px)',
    // Grid gap: 16px at 1358px = 1.18% -> clamp(12px, 1.18vw, 20px)
    gridGap: 'clamp(12px, 1.18vw, 20px)',
    // Input height: 38px at 1358px = 2.8% -> clamp(34px, 2.8vw, 42px)
    inputHeight: 'clamp(34px, 2.8vw, 42px)',
    // Table cell padding: 12px 16px -> clamp values
    cellPaddingY: 'clamp(10px, 0.88vw, 14px)',
    cellPaddingX: 'clamp(12px, 1.18vw, 20px)',
    // Search input width: 200px at 1358px = 14.7% -> clamp(160px, 14.7vw, 240px)
    searchInputWidth: 'clamp(160px, 14.7vw, 240px)',
    // QTY input width: 60px at 1358px = 4.4% -> clamp(50px, 4.4vw, 70px)
    qtyInputWidth: 'clamp(50px, 4.4vw, 70px)',
    // Font sizes with clamp
    fontSizeXs: 'clamp(11px, 0.88vw, 13px)',
    fontSizeSm: 'clamp(12px, 1.03vw, 14px)',
    fontSizeBase: 'clamp(13px, 1.03vw, 15px)',
    fontSizeLg: 'clamp(14px, 1.18vw, 18px)',
  };

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
                <span style={{ fontSize: styles.fontSizeLg }} className="font-medium">Inbound saved successfully!</span>
              </div>
            </div>
          </div>
        )}

        {/* Back button (no header) */}
        <div style={{ padding: `clamp(12px, 1.18vw, 16px) ${styles.containerPadding}` }}>
          <button
            onClick={() => router.push('/employee/inbounds')}
            style={{
              padding: 'clamp(6px, 0.59vw, 10px) clamp(12px, 1.18vw, 20px)',
              border: '1px solid #D1D5DB',
              borderRadius: 'clamp(4px, 0.44vw, 8px)',
              backgroundColor: 'transparent',
              fontSize: styles.fontSizeBase,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>

        {/* Main Content */}
        <div 
          className="flex"
          style={{ 
            gap: styles.mainGap, 
            padding: `${styles.mainGap} ${styles.containerPadding}` 
          }}
        >
          {/* Left Sidebar */}
          <div 
            className="flex flex-col"
            style={{ 
              width: styles.sidebarWidth, 
              flexShrink: 0,
              gap: styles.gridGap
            }}
          >
            {/* Inbound ID Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              padding: styles.cardPadding,
              border: '1px solid #E5E7EB'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: styles.fontSizeBase, fontWeight: 600, color: '#111827' }}>Inbound ID</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 0.59vw, 10px)',
                  padding: 'clamp(4px, 0.44vw, 8px) clamp(12px, 1.18vw, 16px)',
                  backgroundColor: 'transparent',
                  border: '1px solid #E5E7EB',
                  borderRadius: '9999px',
                  fontSize: styles.fontSizeBase,
                  color: '#111827',
                  fontWeight: 500
                }}>
                  <span style={{ width: 'clamp(8px, 0.74vw, 12px)', height: 'clamp(8px, 0.74vw, 12px)', backgroundColor: '#F59E0B', borderRadius: '50%' }}></span>
                  Pending
                </span>
              </div>
              <div style={{ fontSize: styles.fontSizeBase, color: '#6B7280', marginBottom: styles.gridGap }}>{inboundId}</div>
              
              <div style={{ fontSize: styles.fontSizeBase, fontWeight: 600, color: '#111827' }}>External ID</div>
              <div style={{ fontSize: styles.fontSizeBase, color: '#6B7280' }}>DE3-3245</div>
            </div>

            {/* Activate Presale Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              padding: styles.cardPadding,
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: styles.fontSizeBase, fontWeight: 600, color: '#111827', marginBottom: 'clamp(6px, 0.59vw, 10px)' }}>Activate presale</div>
              <p style={{ fontSize: styles.fontSizeXs, color: '#6B7280', marginBottom: styles.gridGap, lineHeight: '1.5' }}>
                By activating this function you can push all stocks of this inbound to your sales channels, this will allow you to sell before we set the stocks. After we set the stock it will reset this function.
              </p>
              
              {/* Toggle */}
              <button
                onClick={() => setPresaleActive(!presaleActive)}
                style={{
                  position: 'relative',
                  width: 'clamp(40px, 3.24vw, 48px)',
                  height: 'clamp(22px, 1.77vw, 26px)',
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
                  left: presaleActive ? 'calc(100% - 22px)' : '2px',
                  width: 'clamp(18px, 1.47vw, 22px)',
                  height: 'clamp(18px, 1.47vw, 22px)',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}></span>
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col" style={{ gap: styles.mainGap }}>
            {/* Products Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              border: '1px solid #E5E7EB',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>Product Name</th>
                    <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>SKU</th>
                    <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>GTIN</th>
                    <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                      <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#111827' }}>{product.name}</td>
                      <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#6B7280' }}>{product.sku}</td>
                      <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#6B7280' }}>{`Merchant ${product.qty}`}</td>
                      <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}` }}>
                        <span style={{ fontSize: styles.fontSizeBase, color: '#111827' }}>{product.qty}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Products Section - Hidden */}
            {false && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: 'clamp(6px, 0.59vw, 10px)',
                border: '1px solid #E5E7EB',
                padding: styles.cardPadding
              }}>
                <div style={{ marginBottom: searchQuery ? styles.gridGap : 0 }}>
                  <label style={{ fontSize: styles.fontSizeXs, color: '#6B7280', display: 'block', marginBottom: 'clamp(3px, 0.29vw, 5px)' }}>Add Products</label>
                  <div style={{ position: 'relative', width: 'clamp(280px, 30vw, 400px)' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      style={{
                        width: '100%',
                        padding: 'clamp(8px, 0.74vw, 12px) clamp(12px, 1.18vw, 16px)',
                        paddingRight: searchQuery ? 'clamp(36px, 3vw, 44px)' : 'clamp(12px, 1.18vw, 16px)',
                        border: '1px solid #D1D5DB',
                        borderRadius: 'clamp(6px, 0.59vw, 10px)',
                        fontSize: styles.fontSizeBase,
                        backgroundColor: 'white'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: 'clamp(10px, 0.88vw, 14px)',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 'clamp(18px, 1.47vw, 22px)',
                          height: 'clamp(18px, 1.47vw, 22px)',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#E5E7EB',
                          color: '#6B7280',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'clamp(12px, 1.03vw, 16px)',
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
                        <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}></th>
                        <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>Product Name</th>
                        <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>SKU</th>
                        <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>GTIN</th>
                        <th style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, textAlign: 'left', fontSize: styles.fontSizeXs, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>QTY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAvailableProducts.map((product) => (
                        <tr key={product.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}` }}>
                            <button
                              onClick={() => handleAddProduct(product)}
                              style={{
                                padding: 'clamp(4px, 0.44vw, 6px) clamp(12px, 1.18vw, 18px)',
                                backgroundColor: '#003450',
                                color: 'white',
                                border: 'none',
                                borderRadius: '9999px',
                                fontSize: styles.fontSizeXs,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Add
                            </button>
                          </td>
                          <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#111827' }}>{product.name}</td>
                          <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#6B7280' }}>{product.sku}</td>
                          <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}`, fontSize: styles.fontSizeBase, color: '#6B7280' }}>{product.gtin}</td>
                          <td style={{ padding: `${styles.cellPaddingY} ${styles.cellPaddingX}` }}>
                            <input
                              type="number"
                              value={product.qty}
                              readOnly
                              style={{
                                width: styles.qtyInputWidth,
                                padding: 'clamp(4px, 0.44vw, 8px) clamp(8px, 0.74vw, 12px)',
                                border: '1px solid #D1D5DB',
                                borderRadius: 'clamp(4px, 0.44vw, 8px)',
                                fontSize: styles.fontSizeBase,
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
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              border: '1px solid #E5E7EB',
              padding: styles.sectionPadding
            }}>
              <h3 style={{ fontSize: styles.fontSizeLg, fontWeight: 600, color: '#111827', marginBottom: 'clamp(3px, 0.29vw, 5px)' }}>Delivery</h3>
              <p style={{ fontSize: styles.fontSizeBase, color: '#6B7280', marginBottom: styles.cardPadding }}>Use a permanent address where you can receive mail.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: styles.gridGap }}>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>ETA</label>
                  <input
                    type="text"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Freigt forwarder</label>
                  <input
                    type="text"
                    value={freightForwarder}
                    onChange={(e) => setFreightForwarder(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Tracking no</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Qty boxes</label>
                  <input
                    type="text"
                    value={qtyBoxes}
                    onChange={(e) => setQtyBoxes(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Qty pallets</label>
                  <input
                    type="text"
                    value={qtyPallets}
                    onChange={(e) => setQtyPallets(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Total CBM</label>
                  <input
                    type="text"
                    value={totalCBM}
                    onChange={(e) => setTotalCBM(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: styles.fontSizeBase, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 'clamp(4px, 0.44vw, 8px)' }}>Ext. Inorder ID</label>
                  <input
                    type="text"
                    value={extInorderId}
                    onChange={(e) => setExtInorderId(e.target.value)}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      height: styles.inputHeight,
                      padding: '0 clamp(10px, 0.88vw, 14px)',
                      border: '1px solid #D1D5DB',
                      borderRadius: 'clamp(4px, 0.44vw, 8px)',
                      fontSize: styles.fontSizeBase,
                      backgroundColor: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Edit Inorder Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              border: '1px solid #E5E7EB',
              padding: styles.cardPadding,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: styles.fontSizeLg, fontWeight: 600, color: '#111827' }}>Edit inorder</span>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  position: 'relative',
                  width: 'clamp(40px, 3.24vw, 48px)',
                  height: 'clamp(22px, 1.77vw, 26px)',
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
                  left: editMode ? 'calc(100% - 22px)' : '2px',
                  width: 'clamp(18px, 1.47vw, 22px)',
                  height: 'clamp(18px, 1.47vw, 22px)',
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
              borderRadius: 'clamp(6px, 0.59vw, 10px)',
              border: '1px solid #E5E7EB',
              padding: styles.cardPadding
            }}>
              <h3 style={{ fontSize: styles.fontSizeLg, fontWeight: 600, color: '#111827', marginBottom: 'clamp(6px, 0.59vw, 10px)' }}>Cancel inbound</h3>
              <p style={{ fontSize: styles.fontSizeBase, color: '#6B7280', marginBottom: styles.gridGap, lineHeight: '1.5' }}>
                Achtung, das Löschen des Artikels führt dazu, dass alle Warenbewegungen verloren gehen. Artikel können nur gelöscht werden wenn kein Bestand vorhanden ist und keine Reservierungen oder Anlieferungen anliegen.
              </p>
              <button
                style={{
                  padding: 'clamp(6px, 0.59vw, 10px) clamp(12px, 1.18vw, 20px)',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: 'clamp(4px, 0.44vw, 8px)',
                  fontSize: styles.fontSizeBase,
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
    </DashboardLayout>
  );
}
