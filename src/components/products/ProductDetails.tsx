'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';
import { dataApi, type Product as ApiProduct, type UpdateProductInput, type BundleItem, type BundleSearchResult } from '@/lib/data-api';
import { ProductDetailsSkeleton } from '@/components/ui';

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

// Transform API product to component format
const transformApiProduct = (apiProduct: ApiProduct): ProductDetailsData => ({
  id: apiProduct.id,
  productId: apiProduct.productId,
  productName: apiProduct.name,
  manufacturer: '-',
  imageUrl: apiProduct.imageUrl || '',
  totalStock: apiProduct.available + apiProduct.reserved + apiProduct.announced,
  available: apiProduct.available,
  reserved: apiProduct.reserved,
  announced: apiProduct.announced,
  heightInCm: '-',
  widthInCm: '-',
  lengthInCm: '-',
  weightInKg: apiProduct.weightInKg ? String(apiProduct.weightInKg) : '-',
  sku: apiProduct.sku,
  gtin: apiProduct.gtin || '-',
  amazonAsin: '-',
  amazonSku: '-',
  isbn: '-',
  han: '-',
  mhd: '-',
  charge: '-',
  zolltarifnummer: '-',
  ursprung: '-',
  nettoVerkaufspreis: '-',
  manufacture: '-',
  qtyMastercarton: '-',
  ordersCount: 0,
});

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
  const tProducts = useTranslations('products');
  const [activeTab, setActiveTab] = useState<ProductTab>('productData');
  const [editMode, setEditMode] = useState(false);
  const [barcodeType, setBarcodeType] = useState('GTIN');
  const [barcodeQuantity, setBarcodeQuantity] = useState('1');

  // API state
  const [productDetails, setProductDetails] = useState<ProductDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [jtlSyncStatus, setJtlSyncStatus] = useState<{ success: boolean; error?: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Raw API product (for bundle data)
  const [rawProduct, setRawProduct] = useState<ApiProduct | null>(null);

  // Bundle state
  const [bundleEnabled, setBundleEnabled] = useState(false);
  const [bundlePrice, setBundlePrice] = useState('');
  const [bundleComponents, setBundleComponents] = useState<Array<{
    childProductId: string;
    name: string;
    sku: string;
    gtin: string | null;
    imageUrl: string | null;
    available: number;
    quantity: number;
  }>>([]);
  const [isEditingBundle, setIsEditingBundle] = useState(false);
  const [bundleSearchQuery, setBundleSearchQuery] = useState('');
  const [bundleSearchResults, setBundleSearchResults] = useState<BundleSearchResult[]>([]);
  const [bundleSaving, setBundleSaving] = useState(false);
  const [bundleSaveMessage, setBundleSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteBundleConfirm, setShowDeleteBundleConfirm] = useState(false);
  const [bundleDeleting, setBundleDeleting] = useState(false);
  const bundleSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataApi.getProduct(productId);
        const transformed = transformApiProduct(data);
        setProductDetails(transformed);
        setRawProduct(data);

        // Initialize bundle state from API data
        setBundleEnabled(data.isBundle || false);
        setBundlePrice(data.bundlePrice != null ? String(data.bundlePrice) : '');
        setBundleComponents(
          (data.bundleItems || []).map((bi: BundleItem) => ({
            childProductId: bi.childProduct.id,
            name: bi.childProduct.name,
            sku: bi.childProduct.sku,
            gtin: bi.childProduct.gtin,
            imageUrl: bi.childProduct.imageUrl,
            available: bi.childProduct.available,
            quantity: bi.quantity,
          }))
        );
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Editable product state
  const [formData, setFormData] = useState({
    productName: productDetails?.productName || '',
    manufacturer: productDetails?.manufacturer || '',
    // Geodaten
    heightInCm: productDetails?.heightInCm || '',
    widthInCm: productDetails?.widthInCm || '',
    lengthInCm: productDetails?.lengthInCm || '',
    weightInKg: productDetails?.weightInKg || '',
    // Identifizierung
    sku: productDetails?.sku || '',
    gtin: productDetails?.gtin || '',
    amazonAsin: productDetails?.amazonAsin || '',
    amazonSku: productDetails?.amazonSku || '',
    isbn: productDetails?.isbn || '',
    han: productDetails?.han || '',
    // Eigenschaften
    mhd: productDetails?.mhd || '',
    charge: productDetails?.charge || '',
    zolltarifnummer: productDetails?.zolltarifnummer || '',
    ursprung: productDetails?.ursprung || '',
    nettoVerkaufspreis: productDetails?.nettoVerkaufspreis || '',
    manufacture: productDetails?.manufacture || '',
    qtyMastercarton: productDetails?.qtyMastercarton || '',
  });

  // Update formData when productDetails loads
  useEffect(() => {
    if (productDetails) {
      setFormData({
        productName: productDetails.productName,
        manufacturer: productDetails.manufacturer,
        heightInCm: productDetails.heightInCm,
        widthInCm: productDetails.widthInCm,
        lengthInCm: productDetails.lengthInCm,
        weightInKg: productDetails.weightInKg,
        sku: productDetails.sku,
        gtin: productDetails.gtin,
        amazonAsin: productDetails.amazonAsin,
        amazonSku: productDetails.amazonSku,
        isbn: productDetails.isbn,
        han: productDetails.han,
        mhd: productDetails.mhd,
        charge: productDetails.charge,
        zolltarifnummer: productDetails.zolltarifnummer,
        ursprung: productDetails.ursprung,
        nettoVerkaufspreis: productDetails.nettoVerkaufspreis,
        manufacture: productDetails.manufacture,
        qtyMastercarton: productDetails.qtyMastercarton,
      });
    }
  }, [productDetails]);

  // Product image state
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
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
      // Reset image error state
      setImageError(false);
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

  const handleBack = () => {
    router.push(backUrl);
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!productDetails?.id) {
      setSaveError('Product data not loaded');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setJtlSyncStatus(null);

    try {
      const updateData: UpdateProductInput = {
        name: formData.productName !== productDetails.productName ? formData.productName : undefined,
        manufacturer: formData.manufacturer !== productDetails.manufacturer && formData.manufacturer !== '-' ? formData.manufacturer : undefined,
        sku: formData.sku !== productDetails.sku ? formData.sku : undefined,
        gtin: formData.gtin !== productDetails.gtin && formData.gtin !== '-' ? formData.gtin : undefined,
        han: formData.han !== productDetails.han && formData.han !== '-' ? formData.han : undefined,
        heightInCm: formData.heightInCm !== productDetails.heightInCm && formData.heightInCm !== '-' ? formData.heightInCm : undefined,
        lengthInCm: formData.lengthInCm !== productDetails.lengthInCm && formData.lengthInCm !== '-' ? formData.lengthInCm : undefined,
        widthInCm: formData.widthInCm !== productDetails.widthInCm && formData.widthInCm !== '-' ? formData.widthInCm : undefined,
        weightInKg: formData.weightInKg !== productDetails.weightInKg && formData.weightInKg !== '-' ? formData.weightInKg : undefined,
        amazonAsin: formData.amazonAsin !== productDetails.amazonAsin && formData.amazonAsin !== '-' ? formData.amazonAsin : undefined,
        amazonSku: formData.amazonSku !== productDetails.amazonSku && formData.amazonSku !== '-' ? formData.amazonSku : undefined,
        isbn: formData.isbn !== productDetails.isbn && formData.isbn !== '-' ? formData.isbn : undefined,
        customsCode: formData.zolltarifnummer !== productDetails.zolltarifnummer && formData.zolltarifnummer !== '-' ? formData.zolltarifnummer : undefined,
        countryOfOrigin: formData.ursprung !== productDetails.ursprung && formData.ursprung !== '-' ? formData.ursprung : undefined,
        netSalesPrice: formData.nettoVerkaufspreis !== productDetails.nettoVerkaufspreis && formData.nettoVerkaufspreis !== '-' ? formData.nettoVerkaufspreis : undefined,
      };

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      ) as UpdateProductInput;

      if (Object.keys(cleanedData).length === 0) {
        // No changes to save
        setEditMode(false);
        return;
      }

      const result = await dataApi.updateProduct(productDetails.id, cleanedData);
      
      // Update local state with transformed data
      const updatedProduct = transformApiProduct(result.data);
      setProductDetails(updatedProduct);
      
      // Track JTL sync status
      if (result.jtlSync) {
        setJtlSyncStatus(result.jtlSync);
        if (!result.jtlSync.success) {
          console.warn('JTL sync failed:', result.jtlSync.error);
        }
      }

      setEditMode(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setSaveError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  // Bundle search with debounce
  const handleBundleSearch = (query: string) => {
    setBundleSearchQuery(query);
    if (bundleSearchTimeout.current) clearTimeout(bundleSearchTimeout.current);
    if (!query.trim()) {
      setBundleSearchResults([]);
      return;
    }
    bundleSearchTimeout.current = setTimeout(async () => {
      try {
        const results = await dataApi.searchBundleComponents(productDetails!.id, query);
        // Filter out already-added components
        const existingIds = new Set(bundleComponents.map(c => c.childProductId));
        setBundleSearchResults(results.filter(r => !existingIds.has(r.id)));
      } catch (err) {
        console.error('Bundle search error:', err);
        setBundleSearchResults([]);
      }
    }, 300);
  };

  const addBundleComponent = (result: BundleSearchResult) => {
    setBundleComponents(prev => [...prev, {
      childProductId: result.id,
      name: result.name,
      sku: result.sku,
      gtin: result.gtin,
      imageUrl: result.imageUrl,
      available: result.available,
      quantity: 1,
    }]);
    setBundleSearchQuery('');
    setBundleSearchResults([]);
  };

  const removeBundleComponent = (childProductId: string) => {
    setBundleComponents(prev => prev.filter(c => c.childProductId !== childProductId));
  };

  const updateComponentQuantity = (childProductId: string, quantity: number) => {
    if (quantity < 1) return;
    setBundleComponents(prev => prev.map(c =>
      c.childProductId === childProductId ? { ...c, quantity } : c
    ));
  };

  const handleSaveBundle = async () => {
    if (!productDetails?.id) return;
    setBundleSaving(true);
    setBundleSaveMessage(null);
    try {
      const result = await dataApi.updateBundle(productDetails.id, {
        isBundle: bundleEnabled,
        bundlePrice: bundleEnabled && bundlePrice ? parseFloat(bundlePrice) : null,
        items: bundleEnabled ? bundleComponents.map(c => ({
          childProductId: c.childProductId,
          quantity: c.quantity,
        })) : [],
      });

      // Update local state with response
      setBundleComponents(
        (result.bundleItems || []).map((bi: BundleItem) => ({
          childProductId: bi.childProduct.id,
          name: bi.childProduct.name,
          sku: bi.childProduct.sku,
          gtin: bi.childProduct.gtin,
          imageUrl: bi.childProduct.imageUrl,
          available: bi.childProduct.available,
          quantity: bi.quantity,
        }))
      );
      setIsEditingBundle(false); // Switch to view mode after save
      setBundleSaveMessage({ type: 'success', text: tProducts('bundleSaved') });
      setTimeout(() => setBundleSaveMessage(null), 3000);
    } catch (err: any) {
      setBundleSaveMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to save bundle',
      });
    } finally {
      setBundleSaving(false);
    }
  };

  const handleDeleteBundle = async () => {
    if (!productDetails?.id) return;
    setBundleDeleting(true);
    setBundleSaveMessage(null);
    try {
      await dataApi.updateBundle(productDetails.id, {
        isBundle: false,
        bundlePrice: null,
        items: [],
      });

      // Reset local state
      setBundleEnabled(false);
      setBundlePrice('');
      setBundleComponents([]);
      setShowDeleteBundleConfirm(false);
      setBundleSaveMessage({ type: 'success', text: tProducts('bundleDeleted') });
      setTimeout(() => setBundleSaveMessage(null), 3000);
    } catch (err: any) {
      setBundleSaveMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to delete bundle',
      });
    } finally {
      setBundleDeleting(false);
    }
  };

  // Loading state - show skeleton
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  // Error state
  if (error || !productDetails) {
    return (
      <div className="w-full flex flex-col items-center justify-center" style={{ padding: '40px', gap: '16px' }}>
        <div style={{ color: '#EF4444', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          {error || 'Product not found'}
        </div>
        <button
          onClick={() => router.push(backUrl)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#003450',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          {tCommon('back') || 'Go Back'}
        </button>
      </div>
    );
  }

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
            {tProducts('productData')}
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
            {tProducts('stockMovements')}
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
            {productDetails?.ordersCount ?? 0}
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
            {tProducts('bundle')}
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
              {(productImage || (productDetails?.imageUrl && productDetails.imageUrl.trim() !== '')) && !imageError ? (
                <img
                  src={productImage || productDetails?.imageUrl || ''}
                  alt={productDetails?.productName || 'Product'}
                  onError={() => setImageError(true)}
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
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 500 }}>{tCommon('upload')}</span>
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
                  {tProducts('manufacture')}: {formData.manufacturer} &nbsp;&nbsp;&nbsp;&nbsp;{' '}
                  {tProducts('productId')}: {productDetails?.productId}
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
                    {tProducts('totalStock')}
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
                    {productDetails?.totalStock ?? 0}
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
                    {tProducts('available')}
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
                    {productDetails?.available ?? 0}
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
                    {tProducts('reserved')}
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
                    {productDetails?.reserved ?? 0}
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
                    {tProducts('announced')}
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
                    {productDetails?.announced ?? 0}
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
                      {tProducts('geodata')}
                    </h3>
                    <Field label={tProducts('heightInCm')} value={formData.heightInCm} editMode={editMode} onChange={updateField('heightInCm')} />
                    <Field label={tProducts('widthInCm')} value={formData.widthInCm} editMode={editMode} onChange={updateField('widthInCm')} />
                    <Field label={tProducts('lengthInCm')} value={formData.lengthInCm} editMode={editMode} onChange={updateField('lengthInCm')} />
                    <Field label={tProducts('weightInKg')} value={formData.weightInKg} editMode={editMode} onChange={updateField('weightInKg')} />
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
                      {tProducts('identification')}
                    </h3>
                    <Field label={tProducts('sku')} value={formData.sku} editMode={editMode} onChange={updateField('sku')} />
                    <Field label={tProducts('gtin')} value={formData.gtin} editMode={editMode} onChange={updateField('gtin')} />
                    <Field label={tProducts('amazonAsin')} value={formData.amazonAsin} editMode={editMode} onChange={updateField('amazonAsin')} />
                    <Field label={tProducts('amazonSku')} value={formData.amazonSku} editMode={editMode} onChange={updateField('amazonSku')} />
                    <Field label={tProducts('isbn')} value={formData.isbn} editMode={editMode} onChange={updateField('isbn')} />
                    <Field label={tProducts('han')} value={formData.han} editMode={editMode} onChange={updateField('han')} />
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
                      {tProducts('properties')}
                    </h3>
                    <Field label={tProducts('mhd')} value={formData.mhd} editMode={editMode} onChange={updateField('mhd')} />
                    <Field label={tProducts('charge')} value={formData.charge} editMode={editMode} onChange={updateField('charge')} />
                    <Field label={tProducts('zolltarifnummer')} value={formData.zolltarifnummer} editMode={editMode} onChange={updateField('zolltarifnummer')} />
                    <Field label={tProducts('ursprung')} value={formData.ursprung} editMode={editMode} onChange={updateField('ursprung')} />
                    <Field label={tProducts('nettoVerkaufspreis')} value={formData.nettoVerkaufspreis} editMode={editMode} onChange={updateField('nettoVerkaufspreis')} />
                    <Field label={tProducts('manufacture')} value={formData.manufacture} editMode={editMode} onChange={updateField('manufacture')} />
                    <Field label={tProducts('qtyMastercarton')} value={formData.qtyMastercarton} editMode={editMode} onChange={updateField('qtyMastercarton')} />
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
                  {tProducts('editProduct')}
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
                  {tProducts('generateBarcodeLabel')}
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
                  {tProducts('barcodeLabelDescription')}
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
                  {tProducts('deleteProduct')}
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
                    {tProducts('deleteProduct')}
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
            {tProducts('stockMovementsComingSoon')}
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
            {tProducts('ordersComingSoon')}
          </p>
        </div>
      )}

      {activeTab === 'bundle' && (
        <div
          style={{
            borderRadius: '8px',
            padding: 'clamp(18px, 1.77vw, 24px)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Bundle Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px', color: '#111827' }}>
              {tProducts('markAsBundle')}
            </span>
            <button
              onClick={() => {
                const newEnabled = !bundleEnabled;
                setBundleEnabled(newEnabled);
                // When enabling bundle, enter edit mode
                if (newEnabled) {
                  setIsEditingBundle(true);
                }
              }}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                padding: '2px',
                backgroundColor: bundleEnabled ? '#003450' : '#E5E7EB',
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
                  left: bundleEnabled ? '22px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              />
            </button>
          </div>

          {bundleEnabled && (
            <>
              {!isEditingBundle && bundleComponents.length > 0 ? (
                /* VIEW MODE - Show completed bundle */
                <>
                  {/* Bundle Price Display */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px' }}>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                      {tProducts('bundlePrice')}
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#111827',
                    }}>
                      €{parseFloat(bundlePrice || '0').toFixed(2)}
                    </div>
                  </div>

                  {/* Components Display - Read Only */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                        {tProducts('bundleComponents')} ({bundleComponents.length})
                      </span>
                    </div>

                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                      {bundleComponents.map((comp, idx) => (
                        <div
                          key={comp.childProductId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderBottom: idx < bundleComponents.length - 1 ? '1px solid #E5E7EB' : 'none',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          }}
                        >
                          {/* Image */}
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#F3F4F6',
                            flexShrink: 0,
                          }}>
                            {comp.imageUrl ? (
                              <img src={comp.imageUrl} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                <Package size={24} strokeWidth={1.5} />
                              </div>
                            )}
                          </div>

                          {/* Name + SKU + Stock */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {comp.name}
                            </div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>
                              {comp.sku}
                            </div>
                            {comp.available > 0 && (
                              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                {comp.available} in stock
                              </div>
                            )}
                          </div>

                          {/* Quantity Display */}
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: '#F3F4F6',
                            borderRadius: '4px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#374151',
                          }}>
                            ×{comp.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Possible Quantity Display - View Mode */}
                  {bundleComponents.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      marginTop: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#1E40AF'
                        }}>
                          {tProducts('possibleQuantity')}:
                        </span>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '24px',
                          fontWeight: 600,
                          color: '#1E40AF'
                        }}>
                          {rawProduct?.possibleQuantity ?? 0}
                        </span>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}>
                          {tProducts('bundlesCanBeAssembled')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Edit Bundle Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => setIsEditingBundle(true)}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: '#FFFFFF',
                        color: '#003450',
                        borderRadius: '6px',
                        border: '1px solid #003450',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {tProducts('editBundle')}
                    </button>
                    {bundleSaveMessage && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: bundleSaveMessage.type === 'success' ? '#059669' : '#EF4444',
                      }}>
                        {bundleSaveMessage.text}
                      </span>
                    )}
                  </div>

                  {/* Delete Bundle Section */}
                  <div
                    style={{
                      marginTop: '24px',
                      borderRadius: '8px',
                      padding: 'clamp(18px, 1.77vw, 24px)',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#991B1B',
                        marginBottom: '8px',
                      }}
                    >
                      {tProducts('deleteBundle')}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        lineHeight: '18px',
                        color: '#7F1D1D',
                        marginBottom: '16px',
                      }}
                    >
                      {tProducts('deleteBundleWarning')}
                    </p>
                    <button
                      onClick={() => setShowDeleteBundleConfirm(true)}
                      disabled={bundleDeleting}
                      style={{
                        height: '38px',
                        padding: '9px 17px',
                        borderRadius: '6px',
                        backgroundColor: bundleDeleting ? '#FCA5A5' : '#DC2626',
                        border: 'none',
                        cursor: bundleDeleting ? 'not-allowed' : 'pointer',
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
                        {bundleDeleting ? tCommon('deleting') : tProducts('deleteBundle')}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* EDIT MODE - Show editing controls */
                <>
                  {/* Bundle Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px' }}>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                      {tProducts('bundlePrice')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bundlePrice}
                      onChange={(e) => setBundlePrice(e.target.value)}
                      placeholder="0.00"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#374151',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Components Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
                      {tProducts('bundleComponents')}
                    </span>

                    {bundleComponents.length === 0 ? (
                      <p style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: '14px', padding: '16px 0' }}>
                        {tProducts('noComponentsYet')}
                      </p>
                    ) : (
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                    {bundleComponents.map((comp, idx) => (
                      <div
                        key={comp.childProductId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: idx < bundleComponents.length - 1 ? '1px solid #E5E7EB' : 'none',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                        }}
                      >
                        {/* Image */}
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#F3F4F6',
                          flexShrink: 0,
                        }}>
                          {comp.imageUrl ? (
                            <img src={comp.imageUrl} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                              <Package size={24} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>

                        {/* Name + SKU */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>
                            {comp.sku}
                          </div>
                          {comp.available > 0 && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                              {comp.available} in stock
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280', marginRight: '4px' }}>
                            {tProducts('quantity')}:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={comp.quantity}
                            onChange={(e) => updateComponentQuantity(comp.childProductId, parseInt(e.target.value) || 1)}
                            style={{
                              width: '60px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #D1D5DB',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              textAlign: 'center',
                            }}
                          />
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeBundleComponent(comp.childProductId)}
                          title={tProducts('removeComponent')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #FCA5A5',
                            borderRadius: '4px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Search */}
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <input
                    type="text"
                    value={bundleSearchQuery}
                    onChange={(e) => handleBundleSearch(e.target.value)}
                    placeholder={tProducts('searchProducts')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#374151',
                      outline: 'none',
                    }}
                  />
                  {/* Search Results Dropdown */}
                  {bundleSearchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      marginTop: '4px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}>
                      {bundleSearchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => addBundleComponent(result)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderBottom: '1px solid #F3F4F6',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '4px',
                            overflow: 'hidden', backgroundColor: '#F3F4F6', flexShrink: 0,
                          }}>
                            {result.imageUrl ? (
                              <img src={result.imageUrl} alt={result.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                <Package size={20} strokeWidth={1.5} />
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {result.name}
                            </div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>
                              {result.sku} · {result.available} {tProducts('stock').toLowerCase()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button + Feedback */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleSaveBundle}
                  disabled={bundleSaving}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: bundleSaving ? '#9CA3AF' : '#003450',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    border: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: bundleSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {bundleSaving ? tProducts('savingBundle') : tProducts('saveBundle')}
                </button>
                {bundleSaveMessage && (
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: bundleSaveMessage.type === 'success' ? '#059669' : '#EF4444',
                  }}>
                    {bundleSaveMessage.text}
                  </span>
                )}
              </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Bundle Confirmation Modal */}
      {showDeleteBundleConfirm && (
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
          onClick={() => setShowDeleteBundleConfirm(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              {tProducts('deleteBundleConfirmTitle')}
            </h3>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                color: '#6B7280',
                marginBottom: '24px',
              }}
            >
              {tProducts('deleteBundleConfirmMessage')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteBundleConfirm(false)}
                disabled={bundleDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  cursor: bundleDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDeleteBundle}
                disabled={bundleDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: bundleDeleting ? '#FCA5A5' : '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  cursor: bundleDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {bundleDeleting ? tCommon('deleting') : tProducts('deleteBundle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
