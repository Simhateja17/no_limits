'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { dataApi, type Order as ApiOrder, type UpdateOrderInput } from '@/lib/data-api';
import { fulfillmentApi } from '@/lib/fulfillment-api';
import { Skeleton, GenericTableSkeleton } from '@/components/ui';
import { COUNTRIES, getCountryName } from '@/constants/countries';
import { StatusHistory } from '@/components/orders/StatusHistory';

// Payment Status Badge Component
const PaymentStatusBadge = ({
  paymentStatus,
  t,
}: {
  paymentStatus: string | null;
  t: (key: string) => string;
}) => {
  const getPaymentConfig = () => {
    switch (paymentStatus) {
      case 'paid':
        return {
          label: t('paid'),
          dotColor: '#22C55E',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          textColor: '#059669'
        };
      case 'refunded':
        return {
          label: t('refunded'),
          dotColor: '#8B5CF6',
          bgColor: '#F3E8FF',
          borderColor: '#DDD6FE',
          textColor: '#7C3AED'
        };
      case 'pending':
      case null:
      default:
        return {
          label: t('unpaid'),
          dotColor: '#F59E0B',
          bgColor: '#FEF3C7',
          borderColor: '#FCD34D',
          textColor: '#D97706'
        };
    }
  };

  const config = getPaymentConfig();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      color: config.textColor,
      whiteSpace: 'nowrap',
      fontSize: 14,
      padding: '6px 14px',
      height: 26
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: config.dotColor,
        flexShrink: 0
      }} />
      {config.label}
    </div>
  );
};

// Type for transformed order details
interface OrderDetails {
  orderId: string;
  status: string; // Now uses fulfillmentState for more detailed display
  statusColor: string; // Color for the status badge
  deliveryMethod: {
    name: string;
    street: string;
    zip: string;
    city: string;
    country: string;
  };
  shippingMethod: string;
  trackingNumber: string;
  trackingUrl: string | null;
  shipmentWeight: string;
  tags: string[];
  onHoldStatus: boolean;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    gtin: string;
    qty: number;
    merchant: string;
  }>;
}

// Transform API order to component format
const transformApiOrderToDetails = (apiOrder: ApiOrder): OrderDetails => {
  // Get status translation key based on fulfillmentState (if available) or status
  const getDisplayStatus = (status: string, fulfillmentState: string | null): string => {
    if (fulfillmentState) {
      switch (fulfillmentState) {
        case 'PENDING': return 'processing';
        case 'PREPARATION': return 'preparation';
        case 'ACKNOWLEDGED': return 'acknowledged';
        case 'LOCKED': return 'locked';
        case 'PICKPROCESS': return 'pickprocess';
        case 'AWAITING_STOCK': return 'awaiting_stock';
        case 'READY_FOR_PICKING': return 'ready_for_picking';
        case 'PICKING': return 'picking';
        case 'PICKED': return 'picked';
        case 'PACKING': return 'packing';
        case 'PACKED': return 'packed';
        case 'LABEL_CREATED': return 'label_created';
        case 'SHIPPED': return 'shipped';
        case 'PARTIALLY_SHIPPED': return 'partially_shipped';
        case 'IN_TRANSIT': return 'in_transit';
        case 'OUT_FOR_DELIVERY': return 'out_for_delivery';
        case 'DELIVERED': return 'delivered';
        case 'FAILED_DELIVERY': return 'failed_delivery';
        case 'RETURNED_TO_SENDER': return 'returned_to_sender';
        case 'CANCELED': return 'canceled';
        case 'PARTIALLY_CANCELED': return 'partially_canceled';
      }
    }

    // Fall back to order status
    switch (status) {
      case 'SHIPPED': return 'shipped';
      case 'DELIVERED': return 'delivered';
      case 'ON_HOLD': return 'on_hold';
      case 'CANCELLED': return 'cancelled';
      case 'ERROR': return 'error';
      default: return 'processing';
    }
  };
  
  // Get color based on status
  const getStatusColor = (status: string, fulfillmentState: string | null): string => {
    if (fulfillmentState) {
      switch (fulfillmentState) {
        case 'PREPARATION':
        case 'ACKNOWLEDGED':
        case 'LOCKED':
        case 'PICKPROCESS':
          return '#3B82F6'; // Blue for processing
        case 'SHIPPED':
        case 'IN_TRANSIT':
        case 'OUT_FOR_DELIVERY':
        case 'PARTIALLY_SHIPPED':
          return '#8B5CF6'; // Purple for shipped
        case 'DELIVERED':
          return '#10B981'; // Green for delivered
        case 'PICKING':
        case 'PICKED':
          return '#3B82F6'; // Blue for picking
        case 'PACKING':
        case 'PACKED':
        case 'LABEL_CREATED':
          return '#06B6D4'; // Cyan for packing
        case 'FAILED_DELIVERY':
        case 'RETURNED_TO_SENDER':
          return '#EF4444'; // Red for failed
        case 'CANCELED':
        case 'PARTIALLY_CANCELED':
          return '#EF4444'; // Red for canceled
        case 'AWAITING_STOCK':
          return '#F59E0B'; // Amber for awaiting
      }
    }
    
    switch (status) {
      case 'SHIPPED':
        return '#8B5CF6';
      case 'DELIVERED':
        return '#10B981';
      case 'ON_HOLD':
        return '#F59E0B';
      case 'CANCELLED':
      case 'ERROR':
        return '#EF4444';
      default:
        return '#6BAC4D'; // Green for processing
    }
  };

  return {
    orderId: apiOrder.orderNumber || apiOrder.externalOrderId || apiOrder.orderId,
    status: getDisplayStatus(apiOrder.status, apiOrder.fulfillmentState || null),
    statusColor: getStatusColor(apiOrder.status, apiOrder.fulfillmentState || null),
    // Use actual shipping address from order
    deliveryMethod: {
      name: `${apiOrder.shippingFirstName || ''} ${apiOrder.shippingLastName || ''}`.trim() ||
        apiOrder.customerName ||
        (apiOrder.client?.name || apiOrder.client?.companyName || '').trim() ||
        'N/A',
      street: apiOrder.shippingAddress1 || 'N/A',
      zip: apiOrder.shippingZip || '',
      city: apiOrder.shippingCity || 'N/A',
      country: apiOrder.shippingCountryCode
        ? getCountryName(apiOrder.shippingCountryCode)
        : (apiOrder.shippingCountry || 'N/A'),
    },
    shippingMethod: apiOrder.shippingMethod?.trim() || 'Standard',
    trackingNumber: apiOrder.trackingNumber || 'N/A',
    trackingUrl: apiOrder.trackingUrl || null,
    shipmentWeight: apiOrder.totalWeight ? `${apiOrder.totalWeight} kg` : '0 kg',
    tags: apiOrder.tags || [],
    onHoldStatus: apiOrder.status === 'ON_HOLD',
    products: apiOrder.items.map(item => ({
      id: item.id,
      name: item.product?.name || item.productName || 'Unknown Product',
      sku: item.product?.sku || item.sku || 'N/A',
      gtin: item.product?.gtin || 'N/A',
      qty: item.quantity,
      merchant: apiOrder.client?.companyName || apiOrder.client?.name || 'N/A',
    })),
  };
};

const getCountryCode = (countryCode?: string | null, countryName?: string | null): string => {
  if (countryCode) return countryCode;
  if (!countryName) return '';
  const country = COUNTRIES.find((c) => c.en === countryName || c.de === countryName);
  return country?.code || '';
};

// Mock available products to add
const mockAvailableProducts = [
  { id: '3', name: 'Testproduct 3', sku: '#24235', gtin: '342345235325', qty: 1, merchant: 'Merchant 1' },
  { id: '4', name: 'Testproduct 4', sku: '#24236', gtin: '342345235326', qty: 1, merchant: 'Merchant 2' },
  { id: '5', name: 'Testproduct 5', sku: '#24237', gtin: '342345235327', qty: 1, merchant: 'Merchant 3' },
  { id: '6', name: 'Testproduct 6', sku: '#24238', gtin: '342345235328', qty: 1, merchant: 'Merchant 4' },
  { id: '7', name: 'Testproduct 7', sku: '#24234', gtin: '342345235324', qty: 1, merchant: 'Merchant 5' },
];

// Status color mapping - uses translation keys
const getStatusColor = (status: string) => {
  switch (status) {
    case 'processing':
      return '#6BAC4D';
    case 'on_hold':
    case 'awaiting_stock':
      return '#F59E0B';
    case 'shipped':
    case 'in_transit':
    case 'out_for_delivery':
    case 'partially_shipped':
      return '#8B5CF6';
    case 'delivered':
      return '#10B981';
    case 'picking':
    case 'picked':
    case 'ready_for_picking':
      return '#3B82F6';
    case 'preparation':
    case 'acknowledged':
    case 'locked':
    case 'pickprocess':
      return '#3B82F6';
    case 'packing':
    case 'packed':
    case 'label_created':
      return '#06B6D4';
    case 'cancelled':
    case 'canceled':
    case 'error':
    case 'failed_delivery':
    case 'returned_to_sender':
    case 'partially_canceled':
      return '#EF4444';
    default:
      return '#6BAC4D';
  }
};

export default function ClientOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const tOrders = useTranslations('orders');
  const tCountries = useTranslations('countries');
  const tStatus = useTranslations('status');
  const tMessages = useTranslations('messages');
  const tErrors = useTranslations('errors');

  // API state
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [rawOrder, setRawOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingReplacement, setIsCreatingReplacement] = useState(false);

  const [editOrderEnabled, setEditOrderEnabled] = useState(false);

  // Lock editing once fulfillment has reached warehouse picking (PICKPROCESS and beyond)
  const CLIENT_EDITABLE_FULFILLMENT_STATES = ['PENDING', 'PREPARATION', 'ACKNOWLEDGED', 'LOCKED'];
  const isEditLocked = !!rawOrder?.jtlOutboundId ||
    (!!rawOrder?.fulfillmentState && !CLIENT_EDITABLE_FULFILLMENT_STATES.includes(rawOrder.fulfillmentState));

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [onHoldStatus, setOnHoldStatus] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [replacementCount, setReplacementCount] = useState(0);
  const [orderProducts, setOrderProducts] = useState<OrderDetails['products']>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [showProductList, setShowProductList] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [jtlSyncStatus, setJtlSyncStatus] = useState<{ success: boolean; error?: string } | null>(null);
  const [isSyncingToJTL, setIsSyncingToJTL] = useState(false);
  const [jtlSyncResult, setJtlSyncResult] = useState<{ success: boolean; message: string; alreadyExisted?: boolean } | null>(null);

  // Hold release state
  const [showReleaseConfirmation, setShowReleaseConfirmation] = useState(false);
  const [isReleasingHold, setIsReleasingHold] = useState(false);

  // Form state for edit modal
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    addressLine2: '',
    streetAddress: '',
    city: '',
    zipPostal: '',
    country: 'US',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Auto-disable edit mode if order progresses past editable states
  useEffect(() => {
    if (isEditLocked && editOrderEnabled) {
      setEditOrderEnabled(false);
    }
  }, [isEditLocked]);

  // Fetch order details from API
  useEffect(() => {
    const orderId = params.orderId as string;
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataApi.getOrder(orderId);
        setRawOrder(data as any);
        const transformed = transformApiOrderToDetails(data as any);
        setOrderDetails(transformed);
        setOnHoldStatus(transformed.onHoldStatus);
        setTags(transformed.tags);
        setOrderProducts(transformed.products);
        // Initialize form data from raw order
        setFormData({
          firstName: (data as any).shippingFirstName || '',
          lastName: (data as any).shippingLastName || '',
          company: (data as any).shippingCompany || '',
          addressLine2: (data as any).shippingAddress2 || '',
          streetAddress: (data as any).shippingAddress1 || '',
          city: (data as any).shippingCity || '',
          zipPostal: (data as any).shippingZip || '',
          country: getCountryCode((data as any).shippingCountryCode, (data as any).shippingCountry),
        });
        // Initialize order notes
        setOrderNotes((data as any).warehouseNotes || '');
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return null;
  }

  // Loading state - skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full min-h-screen" style={{ backgroundColor: '#F9FAFB', padding: '32px 5.2%' }}>
          {/* Back button skeleton */}
          <Skeleton width="80px" height="38px" borderRadius="6px" style={{ marginBottom: '24px' }} />

          {/* Order header skeleton */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Skeleton width="200px" height="32px" />
            <Skeleton width="100px" height="28px" borderRadius="14px" />
          </div>

          {/* Order details skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06)' }}>
              <Skeleton width="120px" height="20px" style={{ marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton width="80px" height="14px" />
                    <Skeleton width="120px" height="14px" />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06)' }}>
              <Skeleton width="120px" height="20px" style={{ marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height="14px" />
                ))}
              </div>
            </div>
          </div>

          {/* Order items table skeleton */}
          <GenericTableSkeleton rows={3} columns={4} />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !orderDetails) {
    return (
      <DashboardLayout>
        <div className="w-full flex flex-col items-center justify-center" style={{ padding: '40px', gap: '16px' }}>
          <div style={{ color: '#EF4444', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            {error || tErrors('orderNotFound')}
          </div>
          <button
            onClick={() => router.back()}
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
      </DashboardLayout>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  // Save all order changes to DB and sync to JTL
  const handleSaveOrder = async (): Promise<boolean> => {
    if (!rawOrder?.id) {
      setSaveError('Order data not loaded');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    setJtlSyncStatus(null);

    try {
      // Build update data - send all current values, backend will determine what changed
      const updateData: UpdateOrderInput = {
        warehouseNotes: orderNotes || undefined,
        isOnHold: onHoldStatus,
        tags: tags,
        shippingFirstName: formData.firstName || undefined,
        shippingLastName: formData.lastName || undefined,
        shippingCompany: formData.company || undefined,
        shippingAddress1: formData.streetAddress || undefined,
        shippingAddress2: formData.addressLine2 || undefined,
        shippingCity: formData.city || undefined,
        shippingZip: formData.zipPostal || undefined,
        shippingCountryCode: formData.country || undefined,
        items: orderProducts.map(p => ({
          id: p.id,
          sku: p.sku,
          productName: p.name,
          quantity: p.qty,
        })),
      };

      console.log('[Order Save] Saving order:', rawOrder.id, updateData);

      const result = await dataApi.updateOrder(rawOrder.id, updateData);

      console.log('[Order Save] Save result:', result);

      // Update local state with new data
      setRawOrder(result.data as any);
      const transformed = transformApiOrderToDetails(result.data as any);
      setOrderDetails(transformed);

      // Track JTL sync status
      if (result.jtlSync) {
        setJtlSyncStatus(result.jtlSync);
        if (!result.jtlSync.success) {
          console.warn('JTL sync failed:', result.jtlSync.error);
        }
      }

      setEditOrderEnabled(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
      return true;
    } catch (err: any) {
      console.error('Error updating order:', err);
      setSaveError(err.response?.data?.error || 'Failed to update order');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Save address from modal
  const handleSaveAddress = async () => {
    const saved = await handleSaveOrder();
    if (saved) {
      setShowEditModal(false);
    }
  };

  // Handle delete order
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  // Get the base order ID (without replacement suffix)
  const getBaseOrderId = (id: string) => {
    const match = id.match(/^(.+?)-\d+$/);
    return match ? match[1] : id;
  };

  // Get current replacement number from order ID
  const getCurrentReplacementNumber = (id: string) => {
    const match = id.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Handle create replacement order
  const handleCreateReplacementOrder = async () => {
    if (!rawOrder?.id) {
      setError('Cannot create replacement: Order data not loaded');
      return;
    }

    setIsCreatingReplacement(true);
    setError(null);

    try {
      // Call the API to create the replacement order
      const result = await dataApi.createReplacementOrder(rawOrder.id, {
        reason: 'Customer requested replacement',
        items: orderProducts.map(p => ({
          sku: p.sku,
          productName: p.name,
          quantity: p.qty,
        })),
        notes: orderNotes || undefined,
      });

      // Show success modal
      setShowReplacementModal(true);

      // Navigate to the new replacement order after a delay
      setTimeout(() => {
        setShowReplacementModal(false);
        router.push(`/client/orders/${result.replacementOrderId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating replacement order:', err);
      setError(err.response?.data?.error || 'Failed to create replacement order');
    } finally {
      setIsCreatingReplacement(false);
    }
  };

  // Handle release payment hold
  const handleReleaseHold = async () => {
    if (!rawOrder?.id) return;

    setIsReleasingHold(true);
    try {
      const result = await fulfillmentApi.releaseHold(rawOrder.id);
      if (result.success) {
        // Refresh order data
        const updatedOrder = await dataApi.getOrder(rawOrder.id);
        setRawOrder(updatedOrder as any);
        const transformed = transformApiOrderToDetails(updatedOrder as any);
        setOrderDetails(transformed);
        setOnHoldStatus(transformed.onHoldStatus);
      } else {
        setError(result.message || 'Failed to release hold');
      }
    } catch (err: any) {
      console.error('Error releasing hold:', err);
      setError(err.response?.data?.error || 'An error occurred while releasing the hold');
    } finally {
      setIsReleasingHold(false);
      setShowReleaseConfirmation(false);
    }
  };

  // Handle sync to JTL FFN
  const handleSyncToJTL = async () => {
    if (!rawOrder?.id) {
      setJtlSyncResult({ success: false, message: 'Order data not loaded' });
      return;
    }

    setIsSyncingToJTL(true);
    setJtlSyncResult(null);

    try {
      const result = await dataApi.syncOrderToJTL(rawOrder.id);
      setJtlSyncResult({
        success: result.success,
        message: result.message,
        alreadyExisted: result.data?.alreadyExisted,
      });
      // Refresh order data to get updated jtlOutboundId
      const updatedOrder = await dataApi.getOrder(rawOrder.id);
      setRawOrder(updatedOrder);
    } catch (err: any) {
      console.error('Error syncing to JTL:', err);
      setJtlSyncResult({
        success: false,
        message: err.response?.data?.error || 'Failed to sync order to JTL FFN',
      });
    } finally {
      setIsSyncingToJTL(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F9FAFB]">
        <div className="px-[clamp(24px,4vw,52px)] py-6">
          {/* Back Button */}
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

          {/* Payment Hold Banner */}
          {rawOrder?.isOnHold && rawOrder?.holdReason === 'AWAITING_PAYMENT' && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                borderRadius: '8px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="#D97706">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#92400E',
                  }}>
                    Order On Hold: Awaiting Payment
                  </span>
                </div>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#B45309',
                  marginTop: '6px',
                  marginLeft: '28px',
                }}>
                  Payment not yet confirmed. You can release this hold to proceed with fulfillment.
                </p>
              </div>
              <button
                onClick={() => setShowReleaseConfirmation(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Release Hold
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="mt-8 flex flex-col lg:flex-row gap-[clamp(20px,2.5vw,34px)]">
            {/* Left Column - Order Info Cards */}
            <div className="flex flex-col gap-4 w-full lg:w-[20%] lg:min-w-[240px] lg:max-w-[280px]">
              {/* Order ID Box */}
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
                  // German layout: Pill above Label
                  <>
                    {/* Status Pill */}
                    <div
                      style={{
                        height: '26px',
                        gap: '8px',
                        padding: '3px 13px',
                        borderRadius: '13px',
                        border: '1px solid #D1D5DB',
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                        width: 'fit-content'
                      }}
                    >
                      {/* Status Dot */}
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: onHoldStatus
                            ? '#F59E0B'
                            : getStatusColor(orderDetails?.status || 'processing'),
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
                        {onHoldStatus
                          ? tOrders('onHold')
                          : tOrders(orderDetails?.status || 'processing')}
                      </span>
                    </div>

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
                        {tOrders('orderId')}
                      </span>
                    </div>
                  </>
                ) : (
                  // English/Other layout: Pill inline/right
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
                      {tOrders('orderId')}
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
                          backgroundColor: onHoldStatus
                            ? '#F59E0B'
                            : getStatusColor(orderDetails?.status || 'processing'),
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
                        {onHoldStatus
                          ? tOrders('onHold')
                          : tOrders(orderDetails?.status || 'processing')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Status Badge */}
                {rawOrder?.paymentStatus && (
                  <div style={{ marginTop: 8 }}>
                    <PaymentStatusBadge
                      paymentStatus={rawOrder.paymentStatus}
                      t={tOrders}
                    />
                  </div>
                )}

                {/* Fulfilled Badge */}
                {rawOrder?.shopifyFulfillmentGid && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 13,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 13,
                      padding: '2px 10px 2px 8px',
                      color: '#059669',
                    }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#22C55E',
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      {tOrders('fulfilled')}
                    </div>
                  </div>
                )}

                {/* Tracking Number Badge */}
                {rawOrder?.trackingNumber && (
                  <div style={{ marginTop: 8 }}>
                    {rawOrder.trackingUrl ? (
                      <a
                        href={rawOrder.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: 13,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: 13,
                          padding: '2px 10px 2px 8px',
                          color: '#2563EB',
                          cursor: 'pointer',
                        }}>
                          <span style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6',
                            display: 'inline-block',
                            flexShrink: 0,
                          }} />
                          {rawOrder.trackingNumber}
                        </div>
                      </a>
                    ) : (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 13,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 13,
                        padding: '2px 10px 2px 8px',
                        color: '#2563EB',
                      }}>
                        <span style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#3B82F6',
                          display: 'inline-block',
                          flexShrink: 0,
                        }} />
                        {rawOrder.trackingNumber}
                      </div>
                    )}
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
                  {orderDetails?.orderId}
                </span>
              </div>

              {/* Delivery Method Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '180px',
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
                    {tOrders('deliveryMethod')}
                  </span>
                  {/* Edit Pill - Only show when edit mode is enabled */}
                  {editOrderEnabled && (
                    <button
                      onClick={handleEditClick}
                      style={{
                        height: 'clamp(18px, 1.5vw, 20px)',
                        padding: 'clamp(1px, 0.15vw, 2px) clamp(8px, 0.74vw, 10px)',
                        borderRadius: '10px',
                        backgroundColor: '#F3F4F6',
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
                          fontSize: 'clamp(10px, 0.88vw, 12px)',
                          lineHeight: '16px',
                          color: '#003450',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tCommon('edit')}
                      </span>
                    </button>
                  )}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    lineHeight: '32px',
                    color: '#111827',
                  }}
                >
                  <div>{orderDetails?.deliveryMethod.name}</div>
                  <div>{orderDetails?.deliveryMethod.street}</div>
                  <div>{orderDetails?.deliveryMethod.zip} {orderDetails?.deliveryMethod.city}</div>
                  <div>{orderDetails?.deliveryMethod.country}</div>
                </div>
              </div>

              {/* Shipping Method Box */}
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
                  {tOrders('shippingMethod')}
                </span>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#111827',
                    }}
                  >
                    {orderDetails?.shippingMethod || 'Standard'}
                  </span>
                  {orderDetails?.trackingNumber && orderDetails.trackingNumber !== 'N/A' && (
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#6B7280',
                      }}
                    >
                      {orderDetails.trackingUrl ? (
                        <a
                          href={orderDetails.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#2563EB',
                            textDecoration: 'none',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {orderDetails.trackingNumber}
                        </a>
                      ) : (
                        <span>{orderDetails.trackingNumber}</span>
                      )}
                    </div>
                  )}

                  {/* Multi-package shipments */}
                  {(rawOrder as any)?.shipments && (rawOrder as any).shipments.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#374151' }}>
                        Shipments ({(rawOrder as any).shipments.length})
                      </span>
                      {(rawOrder as any).shipments.map((shipment: any) => (
                        <div
                          key={shipment.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          <span style={{ color: '#6B7280' }}>📦</span>
                          {shipment.trackingUrl ? (
                            <a
                              href={shipment.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#2563EB', textDecoration: 'none' }}
                              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              {shipment.trackingNumber}
                            </a>
                          ) : (
                            <span style={{ color: '#111827' }}>{shipment.trackingNumber}</span>
                          )}
                          {shipment.carrier && (
                            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>({shipment.carrier})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* On Hold Toggle */}
              <div
                style={{
                  width: '100%',
                  padding: 'clamp(16px, 1.5vw, 20px) clamp(12px, 1.2vw, 16px)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(16px, 1.3vw, 18px)',
                      lineHeight: '24px',
                      color: '#111827',
                    }}
                  >
                    {tOrders('onHold')}
                  </span>
                  <button
                    onClick={() => {
                      // Prevent toggling if on payment hold (system-managed)
                      if (editOrderEnabled && rawOrder?.holdReason !== 'AWAITING_PAYMENT') {
                        setOnHoldStatus(!onHoldStatus);
                      }
                    }}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      padding: '2px',
                      backgroundColor: onHoldStatus ? '#003450' : '#E5E7EB',
                      position: 'relative',
                      cursor: (editOrderEnabled && rawOrder?.holdReason !== 'AWAITING_PAYMENT') ? 'pointer' : 'not-allowed',
                      border: 'none',
                      transition: 'background-color 0.2s',
                      opacity: (editOrderEnabled && rawOrder?.holdReason !== 'AWAITING_PAYMENT') ? 1 : 0.6,
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
                        left: onHoldStatus ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </button>
                </div>
                {/* Show hold reason message based on holdReason */}
                {rawOrder?.holdReason === 'AWAITING_PAYMENT' ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    This order is awaiting payment. Use the banner above to release the hold manually, or it will be released automatically when payment is confirmed.
                  </p>
                ) : rawOrder?.holdReason === 'SHIPPING_METHOD_MISMATCH' ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    {tOrders('holdReasonShippingMismatch')}
                  </p>
                ) : rawOrder?.holdReason === 'HIGH_RISK_OF_FRAUD' ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    {tOrders('holdReasonHighRisk')}
                  </p>
                ) : rawOrder?.holdReason === 'INCORRECT_ADDRESS' ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    {tOrders('holdReasonIncorrectAddress')}
                  </p>
                ) : rawOrder?.holdReason === 'INVENTORY_OUT_OF_STOCK' ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    {tOrders('holdReasonInventory')}
                  </p>
                ) : rawOrder?.isOnHold ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#D97706',
                    }}
                  >
                    {tOrders('holdReasonOther')}
                  </p>
                ) : (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#6B7280',
                    }}
                  >
                    {tOrders('onHoldDescription')}
                  </p>
                )}
              </div>

              {/* Shipment Weight Box */}
              <div
                style={{
                  width: '100%',
                  minWidth: 'clamp(240px, 19.9%, 270px)',
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
                  {tOrders('shipmentWeight')}
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
                  {orderDetails?.shipmentWeight}
                </div>
                <div
                  style={{
                    marginTop: '24px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                  }}
                >
                  {tOrders('shipmentWeightDescription')}
                </div>
              </div>

              {/* Tags Box */}
              <div
                style={{
                  width: '100%',
                  minWidth: 'clamp(240px, 19.9%, 270px)',
                  minHeight: editOrderEnabled ? '150px' : '100px',
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
                  {tOrders('tags')}
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
                      {editOrderEnabled && (
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
                      )}
                    </div>
                  ))}
                </div>
                {editOrderEnabled && (
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
                      placeholder={tOrders('addTag')}
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
                      +
                    </button>
                  </div>
                )}
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
                    {tOrders('productName')}
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
                          marginRight: '10px',
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
                          {tCommon('remove')}
                        </span>
                      </button>
                    )}
                    <Link
                      href={`/client/products/${product.id}`}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#2563EB',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1E40AF';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2563EB';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {product.name}
                    </Link>
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
                      {tOrders('addProducts')}
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
                      placeholder={tOrders('searchProducts')}
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
                          gridTemplateColumns: '2fr 1fr 1.5fr 0.8fr 0.5fr',
                          padding: '12px 24px',
                          borderBottom: '1px solid #E5E7EB',
                          backgroundColor: '#F9FAFB',
                        }}
                      >
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
                          {tOrders('productName')}
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
                        <span></span>
                      </div>

                      {/* Table Body */}
                      {filteredAvailableProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="grid items-center"
                          style={{
                            gridTemplateColumns: '2fr 1fr 1.5fr 0.8fr 0.5fr',
                            padding: '16px 24px',
                            borderBottom: index < filteredAvailableProducts.length - 1 ? '1px solid #E5E7EB' : 'none',
                          }}
                        >
                          <Link
                            href={`/client/products/${product.id}`}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: '#2563EB',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#1E40AF';
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2563EB';
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            {product.name}
                          </Link>
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
                              {tOrders('add')}
                            </span>
                          </button>
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
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(16px, 1.3vw, 18px)',
                      lineHeight: '24px',
                      color: '#111827',
                    }}
                  >
                    {tOrders('editOrder')}
                  </span>
                  {/* Toggle */}
                  <button
                    onClick={() => {
                      if (!isEditLocked) {
                        setEditOrderEnabled(!editOrderEnabled);
                      }
                    }}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      padding: '2px',
                      backgroundColor: editOrderEnabled ? '#003450' : '#E5E7EB',
                      border: 'none',
                      cursor: isEditLocked ? 'not-allowed' : 'pointer',
                      opacity: isEditLocked ? 0.6 : 1,
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
                {isEditLocked && (
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                    margin: 0,
                  }}>
                    {rawOrder?.jtlOutboundId
                      ? tOrders('editLockedJtl')
                      : tOrders('editLockedWarehouse')}
                  </p>
                )}
              </div>

              {/* Order Notes Box */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: 'clamp(20px, 1.77vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(16px, 1.47vw, 20px)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(16px, 1.33vw, 18px)',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  {tOrders('orderNotes')}
                </span>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(13px, 1.03vw, 14px)',
                    lineHeight: '20px',
                    color: '#6B7280',
                    margin: 0,
                  }}
                >
                  {tOrders('orderNotesDescription')}
                </p>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  disabled={!editOrderEnabled}
                  style={{
                    width: '100%',
                    minHeight: 'clamp(70px, 5.9vw, 80px)',
                    padding: 'clamp(10px, 0.88vw, 12px) clamp(12px, 1.03vw, 14px)',
                    borderRadius: '6px',
                    border: '1px solid #DFDFDF',
                    backgroundColor: editOrderEnabled ? '#FFFFFF' : '#F3F4F6',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(13px, 1.03vw, 14px)',
                    fontWeight: 400,
                    lineHeight: '140%',
                    letterSpacing: '0%',
                    color: editOrderEnabled ? '#111827' : '#6B7280',
                    resize: 'vertical',
                    outline: 'none',
                    cursor: editOrderEnabled ? 'text' : 'not-allowed',
                  }}
                />
              </div>

              {/* Save Changes Button */}
              {editOrderEnabled && (
                <div>
                  {saveError && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#DC2626', marginBottom: '8px' }}>
                      {saveError}
                    </p>
                  )}
                  <button
                    onClick={handleSaveOrder}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '6px',
                      backgroundColor: isSaving ? '#9CA3AF' : '#003450',
                      border: 'none',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
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
                      {isSaving ? tCommon('saving') : tCommon('saveChanges')}
                    </span>
                  </button>
                </div>
              )}

              {/* Sync to JTL FFN Box */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
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
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Sync to JTL FFN
                </span>
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
                  {rawOrder?.jtlOutboundId
                    ? `Already synced to JTL FFN (Outbound: ${rawOrder.jtlOutboundId})`
                    : 'Manually push this order to JTL FFN for fulfillment. This will check if the order already exists in FFN before creating.'}
                </p>
                {jtlSyncResult && (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: jtlSyncResult.success ? '#059669' : '#DC2626',
                      marginBottom: '12px',
                    }}
                  >
                    {jtlSyncResult.message}
                  </p>
                )}
                <button
                  onClick={handleSyncToJTL}
                  disabled={isSyncingToJTL || !!rawOrder?.jtlOutboundId}
                  style={{
                    minWidth: '140px',
                    height: '38px',
                    borderRadius: '6px',
                    padding: '9px 17px',
                    backgroundColor: rawOrder?.jtlOutboundId ? '#9CA3AF' : isSyncingToJTL ? '#9CA3AF' : '#003450',
                    border: 'none',
                    cursor: rawOrder?.jtlOutboundId || isSyncingToJTL ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '20px',
                      color: '#FFFFFF',
                    }}
                  >
                    {isSyncingToJTL ? 'Syncing...' : rawOrder?.jtlOutboundId ? 'Already Synced' : 'Sync to JTL'}
                  </span>
                </button>
              </div>
              {/* Create Replacement Order Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '178px',
                  gap: '20px',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
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
                    display: 'block',
                  }}
                >
                  {tOrders('createReplacementOrderHeading')}
                </span>
                <p
                  style={{
                    marginTop: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                  }}
                >
                  {tOrders('createReplacementOrderDescription')}
                </p>
                <button
                  onClick={handleCreateReplacementOrder}
                  disabled={isCreatingReplacement}
                  style={{
                    marginTop: '20px',
                    width: 'clamp(170px, 15.2vw, 206px)',
                    height: 'clamp(34px, 2.8vw, 38px)',
                    padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                    borderRadius: '6px',
                    backgroundColor: isCreatingReplacement ? '#9CA3AF' : '#003450',
                    border: 'none',
                    cursor: isCreatingReplacement ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '20px',
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                    }}
                  >
                    {isCreatingReplacement ? 'Creating...' : tOrders('createReplacementOrder')}
                  </span>
                </button>
              </div>

              {/* Status History Box */}
              <div
                style={{
                  width: '100%',
                  minHeight: '178px',
                  gap: '20px',
                  borderRadius: '8px',
                  padding: 'clamp(16px, 1.8vw, 24px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <StatusHistory
                  syncLogs={rawOrder?.syncLogs}
                  orderDate={rawOrder?.orderDate}
                  currentStatus={rawOrder?.status}
                  fulfillmentState={rawOrder?.fulfillmentState}
                />
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
                position: 'relative',
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
                {tOrders('editOrder')}
              </h2>

              {/* Close button (X) */}
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

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
                    {tOrders('firstName')}
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
                    {tOrders('lastName')}
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
                    {tOrders('company')}
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

                {/* Street Address */}
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
                    {tOrders('streetAddress')}
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

                {/* Address Line 2 - Full Width */}
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
                    {tOrders('addressLine2')}
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
                    {tOrders('city')}
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
                    {tOrders('zipPostal')}
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
                    {tOrders('country')}
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
                      <option value="">{locale === 'de' ? 'Land auswählen' : 'Select Country'}</option>
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {locale === 'de' ? country.de : country.en}
                        </option>
                      ))}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                {/* Cancel Button */}
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    minWidth: 'clamp(60px, 5.5vw, 75px)',
                    height: 'clamp(34px, 2.8vw, 38px)',
                    padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                    borderRadius: '6px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #E5E7EB',
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
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '20px',
                      color: '#374151',
                      textAlign: 'center',
                    }}
                  >
                    {tCommon('cancel')}
                  </span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSaveAddress}
                  style={{
                    minWidth: 'clamp(60px, 5.5vw, 75px)',
                    height: 'clamp(34px, 2.8vw, 38px)',
                    padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
                    borderRadius: '6px',
                    backgroundColor: '#003450',
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
                      fontSize: 'clamp(12px, 1.03vw, 14px)',
                      lineHeight: '20px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    {tCommon('save')}
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
                {tOrders('shippingAddressChanged')}
              </span>
            </div>
          </div>
        )}

        {/* Replacement Order Created Modal */}
        {showReplacementModal && (
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
                height: '140px',
                maxWidth: '90vw',
                gap: '24px',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 10px 10px -5px rgba(0, 0, 0, 0.04), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
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
                {tOrders('replacementOrderCreated')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Hold Release Confirmation Dialog */}
      {showReleaseConfirmation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => !isReleasingHold && setShowReleaseConfirmation(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="#D97706">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#111827',
                margin: 0,
              }}>
                Release Payment Hold?
              </h3>
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '22px',
              color: '#6B7280',
              marginBottom: '20px',
            }}>
              This order has not been paid yet. Releasing the hold will queue it for fulfillment.
              You accept the risk of fulfilling an unpaid order. Are you sure you want to continue?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReleaseConfirmation(false)}
                disabled={isReleasingHold}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isReleasingHold ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseHold}
                disabled={isReleasingHold}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: isReleasingHold ? '#F59E0B' : '#D97706',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isReleasingHold ? 'not-allowed' : 'pointer',
                  opacity: isReleasingHold ? 0.7 : 1,
                }}
              >
                {isReleasingHold ? 'Releasing...' : 'Yes, Release Hold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
