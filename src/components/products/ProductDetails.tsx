'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Tab type for product details
type ProductTab = 'productData' | 'stockMovements' | 'orders' | 'bundle';

// Product details interface
interface ProductDetailsData {
  id: string;
  productId: string;
  productName: string;
  manufacturer: string;
  imageUrl: string;
  totalStock: number;
  available: number;
  reserved: number;
  announced: number;
  // Geodaten
  heightInCm: string;
  widthInCm: string;
  lengthInCm: string;
  weightInKg: string;
  // Identifizierung
  sku: string;
  gtin: string;
  amazonAsin: string;
  amazonSku: string;
  isbn: string;
  han: string;
  // Eigenschaften
  mhd: string;
  charge: string;
  zolltarifnummer: string;
  ursprung: string;
  nettoVerkaufspreis: string;
  manufacture: string;
  qtyMastercarton: string;
  // Orders count
  ordersCount: number;
}

// Mock product data
const mockProductDetails: ProductDetailsData = {
  id: '1',
  productId: '23423',
  productName: 'Duschtuch 70×100cm',
  manufacturer: 'Herzbach Home',
  imageUrl: '/product-image.jpg',
  totalStock: 345,
  available: 340,
  reserved: 5,
  announced: 0,
  heightInCm: '10',
  widthInCm: '12,5',
  lengthInCm: '21,5',
  weightInKg: '0,85',
  sku: 'DT-70-100',
  gtin: '2394823842342',
  amazonAsin: '23YAC1328A',
  amazonSku: '-',
  isbn: '-',
  han: '-',
  mhd: 'Nein',
  charge: 'Nein',
  zolltarifnummer: '238539232',
  ursprung: '-',
  nettoVerkaufspreis: '12,5',
  manufacture: 'Herzbach Home',
  qtyMastercarton: '10',
  ordersCount: 6,
};

interface ProductDetailsProps {
  productId: string;
  backUrl: string;
}

// Reusable field component that switches between view and edit mode
interface FieldProps {
  label: string;
  value: string;
  editMode: boolean;
  onChange: (value: string) => void;
}

function Field({ label, value, editMode, onChange }: FieldProps) {
  return (
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
        {label}
      </label>
      {editMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#374151',
            outline: 'none',
          }}
        />
      ) : (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#F9FAFB',
            borderRadius: '4px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#6B7280',
            }}
          >
            {value}
          </span>
        </div>
      )}
    </div>
  );
}

export function ProductDetails({ productId, backUrl }: ProductDetailsProps) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const t = useTranslations('products');
  const [activeTab, setActiveTab] = useState<ProductTab>('productData');
  const [editMode, setEditMode] = useState(false);
  const [barcodeType, setBarcodeType] = useState('GTIN');
  const [barcodeQuantity, setBarcodeQuantity] = useState('1');

  // Editable product state
  const [formData, setFormData] = useState({
    productName: mockProductDetails.productName,
    manufacturer: mockProductDetails.manufacturer,
    // Geodaten
    heightInCm: mockProductDetails.heightInCm,
    widthInCm: mockProductDetails.widthInCm,
    lengthInCm: mockProductDetails.lengthInCm,
    weightInKg: mockProductDetails.weightInKg,
    // Identifizierung
    sku: mockProductDetails.sku,
    gtin: mockProductDetails.gtin,
    amazonAsin: mockProductDetails.amazonAsin,
    amazonSku: mockProductDetails.amazonSku,
    isbn: mockProductDetails.isbn,
    han: mockProductDetails.han,
    // Eigenschaften
    mhd: mockProductDetails.mhd,
    charge: mockProductDetails.charge,
    zolltarifnummer: mockProductDetails.zolltarifnummer,
    ursprung: mockProductDetails.ursprung,
    nettoVerkaufspreis: mockProductDetails.nettoVerkaufspreis,
    manufacture: mockProductDetails.manufacture,
    qtyMastercarton: mockProductDetails.qtyMastercarton,
  });

  // Product image state
  const [productImage, setProductImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // In a real app, fetch product by productId from the API
  console.log('Loading product:', productId);
  const product = mockProductDetails;

  const handleBack = () => {
    router.push(backUrl);
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, save the product data to the API
    console.log('Saving product:', formData);
    setEditMode(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Back Button */}
      <div>
        <button
          onClick={handleBack}
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
      </div>

      {/* Tabs - Only show Product Data tab in edit mode */}
      <div
        className="flex items-center"
        style={{
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        {/* Product Data Tab */}
        <button
          onClick={() => setActiveTab('productData')}
          style={{
            height: '38px',
            paddingLeft: '4px',
            paddingRight: '4px',
            paddingBottom: '16px',
            borderBottom: activeTab === 'productData' ? '2px solid #003450' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: activeTab === 'productData' ? '#003450' : '#6B7280',
            }}
          >
            {t('productData')}
          </span>
        </button>

        {/* Stock Movements Tab */}
        <button
          onClick={() => setActiveTab('stockMovements')}
          style={{
            height: '38px',
            paddingLeft: '4px',
            paddingRight: '4px',
            paddingBottom: '16px',
            marginLeft: '24px',
            borderBottom: activeTab === 'stockMovements' ? '2px solid #003450' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: activeTab === 'stockMovements' ? '#003450' : '#6B7280',
            }}
          >
            {t('stockMovements')}
          </span>
        </button>

        {/* Orders Tab */}
        <button
          onClick={() => setActiveTab('orders')}
          className="flex items-center gap-2"
          style={{
            height: '38px',
            paddingLeft: '4px',
            paddingRight: '4px',
            paddingBottom: '16px',
            marginLeft: '24px',
            borderBottom: activeTab === 'orders' ? '2px solid #003450' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: activeTab === 'orders' ? '#003450' : '#6B7280',
            }}
          >
            {tCommon('orders')}
          </span>
          <span
            style={{
              minWidth: '28px',
              height: '20px',
              borderRadius: '10px',
              padding: '2px 10px',
              backgroundColor: '#F3F4F6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              textAlign: 'center',
              color: '#1F2937',
            }}
          >
            {product.ordersCount}
          </span>
        </button>

        {/* Bundle Tab */}
        <button
          onClick={() => setActiveTab('bundle')}
          style={{
            height: '38px',
            paddingLeft: '4px',
            paddingRight: '4px',
            paddingBottom: '16px',
            marginLeft: '24px',
            borderBottom: activeTab === 'bundle' ? '2px solid #003450' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: activeTab === 'bundle' ? '#003450' : '#6B7280',
            }}
          >
            {t('bundle')}
          </span>
        </button>
      </div>

      {/* Product Data Content */}
      {activeTab === 'productData' && (
        <div className="flex flex-col gap-6">
          {/* Product Header Section - Image + (Product Name Box + Stock Stats) */}
          <div 
            className="flex flex-wrap lg:flex-nowrap"
            style={{
              gap: 'clamp(18px, 1.77vw, 24px)',
            }}
          >
            {/* Product Image */}
            <div
              onClick={handleImageClick}
              style={{
                width: 'clamp(160px, 14.1vw, 192px)',
                minWidth: 'clamp(160px, 14.1vw, 192px)',
                height: 'clamp(160px, 14.1vw, 192px)',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                boxShadow: '0px 0px 0px 4px #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                position: 'relative',
                cursor: editMode ? 'pointer' : 'default',
              }}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {/* Product image or placeholder */}
              {productImage ? (
                <img
                  src={productImage}
                  alt="Product"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#9CA3AF"/>
                    <path d="M21 15L16 10L8 18" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {/* Edit overlay */}
              {editMode && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17,8 12,3 7,8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 500 }}>Upload</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Product Name Box + Stock Stats (combined height = image height) */}
            <div
              className="flex flex-col"
              style={{
                width: 'clamp(800px, 72.5vw, 985px)',
                maxWidth: 'clamp(800px, 72.5vw, 985px)',
                height: 'clamp(160px, 14.1vw, 192px)',
                gap: 'clamp(9px, 0.88vw, 12px)',
              }}
            >
              {/* Product Name Box */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: 'clamp(12px, 1.1vw, 15px) clamp(18px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 'clamp(4px, 0.44vw, 6px)',
                }}
              >
                <h1
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(16px, 1.33vw, 18px)',
                    lineHeight: '1.2',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  {formData.productName}
                </h1>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.03vw, 14px)',
                    lineHeight: '1.4',
                    color: '#6B7280',
                    margin: 0,
                  }}
                >
                  Manufacture: {formData.manufacturer} &nbsp;&nbsp;&nbsp;&nbsp; Product ID: {product.productId}
                </p>
              </div>

              {/* Stock Stats Row */}
              <div 
                className="flex"
                style={{
                  flex: 1,
                  gap: 'clamp(12px, 1.1vw, 16px)',
                }}
              >
                {/* Total Stock */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(12px, 1.1vw, 16px) clamp(16px, 1.47vw, 20px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '1.4',
                      color: '#6B7280',
                    }}
                  >
                    {t('totalStock')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(16px, 1.33vw, 18px)',
                      lineHeight: '1.3',
                      color: '#111827',
                    }}
                  >
                    {product.totalStock}
                  </span>
                </div>

                {/* Available */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(12px, 1.1vw, 16px) clamp(16px, 1.47vw, 20px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '1.4',
                      color: '#6B7280',
                    }}
                  >
                    {t('available')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(16px, 1.33vw, 18px)',
                      lineHeight: '1.3',
                      color: '#111827',
                    }}
                  >
                    {product.available}
                  </span>
                </div>

                {/* Reserved */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(12px, 1.1vw, 16px) clamp(16px, 1.47vw, 20px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '1.4',
                      color: '#6B7280',
                    }}
                  >
                    {t('reserved')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(16px, 1.33vw, 18px)',
                      lineHeight: '1.3',
                      color: '#111827',
                    }}
                  >
                    {product.reserved}
                  </span>
                </div>

                {/* Announced */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    padding: 'clamp(12px, 1.1vw, 16px) clamp(16px, 1.47vw, 20px)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '1.4',
                      color: '#6B7280',
                    }}
                  >
                    {t('announced')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(16px, 1.33vw, 18px)',
                      lineHeight: '1.3',
                      color: '#111827',
                    }}
                  >
                    {product.announced}
                  </span>
                </div>
              </div>
            </div>
          </div>

              {/* Information Box - width: 985px, height: 640px at 1358px screen */}
              <div
                style={{
                  width: 'clamp(800px, 72.5vw, 985px)',
                  maxWidth: 'clamp(800px, 72.5vw, 985px)',
                  minHeight: 'clamp(520px, 47.13vw, 640px)',
                  borderRadius: '8px',
                  padding: 'clamp(18px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  marginLeft: 'clamp(184px, 16vw, 216px)',
                  gap: 'clamp(9px, 0.88vw, 12px)',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Geodaten Column */}
                  <div className="flex flex-col gap-4">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: '#111827',
                        marginBottom: '8px',
                      }}
                    >
                      {t('geodata')}
                    </h3>
                    <Field label={t('heightInCm')} value={formData.heightInCm} editMode={editMode} onChange={updateField('heightInCm')} />
                    <Field label={t('widthInCm')} value={formData.widthInCm} editMode={editMode} onChange={updateField('widthInCm')} />
                    <Field label={t('lengthInCm')} value={formData.lengthInCm} editMode={editMode} onChange={updateField('lengthInCm')} />
                    <Field label={t('weightInKg')} value={formData.weightInKg} editMode={editMode} onChange={updateField('weightInKg')} />
                  </div>

                  {/* Identifizierung Column */}
                  <div className="flex flex-col gap-4">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: '#111827',
                        marginBottom: '8px',
                      }}
                    >
                      {t('identification')}
                    </h3>
                    <Field label={t('sku')} value={formData.sku} editMode={editMode} onChange={updateField('sku')} />
                    <Field label={t('gtin')} value={formData.gtin} editMode={editMode} onChange={updateField('gtin')} />
                    <Field label={t('amazonAsin')} value={formData.amazonAsin} editMode={editMode} onChange={updateField('amazonAsin')} />
                    <Field label={t('amazonSku')} value={formData.amazonSku} editMode={editMode} onChange={updateField('amazonSku')} />
                    <Field label={t('isbn')} value={formData.isbn} editMode={editMode} onChange={updateField('isbn')} />
                    <Field label={t('han')} value={formData.han} editMode={editMode} onChange={updateField('han')} />
                  </div>

                  {/* Eigenschaften Column */}
                  <div className="flex flex-col gap-4">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: '#111827',
                        marginBottom: '8px',
                      }}
                    >
                      {t('properties')}
                    </h3>
                    <Field label={t('mhd')} value={formData.mhd} editMode={editMode} onChange={updateField('mhd')} />
                    <Field label={t('charge')} value={formData.charge} editMode={editMode} onChange={updateField('charge')} />
                    <Field label={t('zolltarifnummer')} value={formData.zolltarifnummer} editMode={editMode} onChange={updateField('zolltarifnummer')} />
                    <Field label={t('ursprung')} value={formData.ursprung} editMode={editMode} onChange={updateField('ursprung')} />
                    <Field label={t('nettoVerkaufspreis')} value={formData.nettoVerkaufspreis} editMode={editMode} onChange={updateField('nettoVerkaufspreis')} />
                    <Field label={t('manufacture')} value={formData.manufacture} editMode={editMode} onChange={updateField('manufacture')} />
                    <Field label={t('qtyMastercarton')} value={formData.qtyMastercarton} editMode={editMode} onChange={updateField('qtyMastercarton')} />
                  </div>
                </div>
              </div>

              {/* Edit Product Box - Right aligned with Product Name Box */}
              <div
                style={{
                  width: 'clamp(800px, 72.5vw, 985px)',
                  maxWidth: 'clamp(800px, 72.5vw, 985px)',
                  borderRadius: '8px',
                  padding: 'clamp(18px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginLeft: 'clamp(184px, 16vw, 216px)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  {t('editProduct')}
                </span>
                {/* Toggle Button */}
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    padding: '2px',
                    backgroundColor: editMode ? '#003450' : '#E5E7EB',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      position: 'absolute',
                      top: '2px',
                      left: editMode ? '22px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </button>
              </div>

              {/* Generate Barcode Label Box */}
              <div
                style={{
                  width: 'clamp(800px, 72.5vw, 985px)',
                  maxWidth: 'clamp(800px, 72.5vw, 985px)',
                  borderRadius: '8px',
                  padding: 'clamp(18px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  marginLeft: 'clamp(184px, 16vw, 216px)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  {t('generateBarcodeLabel')}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    marginBottom: '16px',
                  }}
                >
                  {t('barcodeLabelDescription')}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Barcode Type Select */}
                  <div className="relative">
                    <select
                      value={barcodeType}
                      onChange={(e) => setBarcodeType(e.target.value)}
                      style={{
                        width: '200px',
                        height: '38px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        padding: '9px 13px',
                        paddingRight: '32px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#374151',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="GTIN">GTIN</option>
                      <option value="SKU">SKU</option>
                      <option value="EAN">EAN</option>
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: '13px',
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

                  {/* Quantity Select */}
                  <div className="relative">
                    <select
                      value={barcodeQuantity}
                      onChange={(e) => setBarcodeQuantity(e.target.value)}
                      style={{
                        width: '80px',
                        height: '38px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        padding: '9px 13px',
                        paddingRight: '32px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#374151',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 10, 20, 50, 100].map((num) => (
                        <option key={num} value={num.toString()}>{num}</option>
                      ))}
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: '13px',
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

                  {/* Create Button */}
                  <button
                    style={{
                      minWidth: '79px',
                      height: '38px',
                      borderRadius: '6px',
                      padding: '9px 17px',
                      backgroundColor: '#003450',
                      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                      border: 'none',
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
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#FFFFFF',
                      }}
                    >
                      {tCommon('create')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Delete Product Box */}
              <div
                style={{
                  width: 'clamp(800px, 72.5vw, 985px)',
                  maxWidth: 'clamp(800px, 72.5vw, 985px)',
                  borderRadius: '8px',
                  padding: 'clamp(18px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  marginLeft: 'clamp(184px, 16vw, 216px)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  Delete product
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    marginBottom: '16px',
                  }}
                >
                  {tCommon('deleteWarning')}
                </p>
                <button
                  style={{
                    minWidth: '134px',
                    height: '38px',
                    borderRadius: '6px',
                    padding: '9px 17px',
                    backgroundColor: '#FEE2E2',
                    border: 'none',
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
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#DC2626',
                    }}
                  >
                    Delete product
                  </span>
                </button>
              </div>
        </div>
      )}

      {/* Other Tabs Content Placeholders */}
      {activeTab === 'stockMovements' && (
        <div
          style={{
            borderRadius: '8px',
            padding: '48px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Stock movements content coming soon...
          </p>
        </div>
      )}

      {activeTab === 'orders' && (
        <div
          style={{
            borderRadius: '8px',
            padding: '48px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Orders content coming soon...
          </p>
        </div>
      )}

      {activeTab === 'bundle' && (
        <div
          style={{
            borderRadius: '8px',
            padding: '48px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Bundle content coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
