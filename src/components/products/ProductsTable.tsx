'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useClients, getClientNames } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import { dataApi } from '@/lib/data-api';
import { channelsApi, Channel } from '@/lib/channels-api';
import type { Product as ApiProduct } from '@/lib/data-api';
import { ProductsTableSkeleton, MobileCardSkeleton, TabsSkeleton, FilterBarSkeleton } from '@/components/ui';
import { JTLLinkModal } from './JTLLinkModal';

// Tab type
type TabType = 'all' | 'outOfStock' | 'missingData';

// Custom hook to detect screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// Product interface
interface Product {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  available: number;
  reserved: number;
  announced: number;
  client: string;
  clientId: string;
  jtlProductId?: string | null;
  jtlSyncStatus?: string | null;
  lastJtlSync?: string | null;
}

// Helper to check if a SKU is generated (SHOP-xxx or WOO-xxx)
const GENERATED_SKU_PATTERNS = ['SHOP-', 'WOO-'];
const isGeneratedSku = (sku: string): boolean => {
  return GENERATED_SKU_PATTERNS.some(pattern => sku.startsWith(pattern));
};

// Channel interface for display
interface DisplayChannel {
  id: string;
  name: string;
  client: string;
  type: string;
}

interface ProductsTableProps {
  showClientColumn: boolean; // Show client column only for superadmin and warehouse labor view
  baseUrl: string; // Base URL for product details navigation (e.g., '/admin/products' or '/employee/products')
  showSyncButtons?: boolean; // Show JTL sync buttons (defaults to true)
}

// Mobile Product Card Component
const ProductCard = ({ 
  product, 
  showClientColumn, 
  onClick, 
  t 
}: { 
  product: Product; 
  showClientColumn: boolean; 
  onClick: () => void;
  t: (key: string) => string;
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{product.productName || <span className="text-red-500 italic">Missing</span>}</p>
          <p className="text-xs text-gray-500 mt-0.5">ID: {product.productId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs">{t('available')}</span>
          <p className={`font-medium ${product.available === 0 ? 'text-red-500' : 'text-gray-700'}`}>{product.available}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">{t('reserved')}</span>
          <p className="text-gray-700">{product.reserved}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">{t('announced')}</span>
          <p className="text-gray-700">{product.announced}</p>
        </div>
      </div>
      
      {showClientColumn && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-gray-500 text-xs">{t('client')}</span>
          <p className="text-gray-700 text-sm truncate">{product.client || <span className="text-red-500 italic">Missing</span>}</p>
        </div>
      )}
    </div>
  );
};

export function ProductsTable({ showClientColumn, baseUrl, showSyncButtons = true }: ProductsTableProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<DisplayChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingStock, setSyncingStock] = useState(false);
  const [pushingProducts, setPushingProducts] = useState(false);
  const [importingProducts, setImportingProducts] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalProduct, setLinkModalProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const isMobile = useIsMobile();

  // Fetch real clients for admin/employee filter
  const { clients, loading: clientsLoading } = useClients();
  const customerNames = getClientNames(clients);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await dataApi.getProducts();
        // Transform API data to component format
        const transformedProducts: Product[] = data.map(p => ({
          id: p.id,
          productId: p.productId,
          productName: p.name,
          sku: p.sku,
          available: p.available,
          reserved: p.reserved,
          announced: p.announced,
          client: p.client.companyName || p.client.name,
          clientId: p.clientId,
          jtlProductId: p.jtlProductId,
          jtlSyncStatus: p.jtlSyncStatus,
          lastJtlSync: p.lastJtlSync,
        }));
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch channels from API
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user?.clientId) return;

      try {
        const response = await channelsApi.getChannels(user.clientId);
        if (response.success) {
          // Transform to display format
          const displayChannels: DisplayChannel[] = response.channels.map(ch => ({
            id: ch.id,
            name: ch.name,
            client: user.name || 'Client',
            type: ch.type,
          }));
          setChannels(displayChannels);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        // Keep empty channels array on error
      }
    };

    fetchChannels();
  }, [user?.clientId, user?.name]);

  // Current client from auth context
  const currentClient = user?.name || 'Client';

  // Filter channels based on user role
  // showClientColumn = true means admin/employee view (can see all channels)
  // showClientColumn = false means client view (can only see their own channels)
  const filteredChannels = showClientColumn
    ? channels
    : channels.filter(ch => ch.client === currentClient);

  const handleProductClick = (productId: string) => {
    router.push(`${baseUrl}/${productId}`);
  };

  // Open the JTL link modal for a product
  const handleOpenLinkModal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation
    setLinkModalProduct(product);
    setLinkModalOpen(true);
  };

  // Handle successful link - refresh products
  const handleProductLinked = async () => {
    try {
      const data = await dataApi.getProducts();
      const transformedProducts: Product[] = data.map(p => ({
        id: p.id,
        productId: p.productId,
        productName: p.name,
        sku: p.sku,
        available: p.available,
        reserved: p.reserved,
        announced: p.announced,
        client: p.client.companyName || p.client.name,
        clientId: (p as any).clientId || '',
        jtlProductId: p.jtlProductId,
        jtlSyncStatus: p.jtlSyncStatus,
        lastJtlSync: p.lastJtlSync,
      }));
      setProducts(transformedProducts);
      setSyncResult({
        success: true,
        message: 'Product successfully linked to JTL FFN',
      });
      setTimeout(() => setSyncResult(null), 5000);
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  };

  // Push products to JTL FFN (assigns jtlProductId)
  const handlePushProducts = async () => {
    if (!user?.clientId) {
      setSyncResult({
        success: false,
        message: 'Client ID not found. Please log in again.',
      });
      return;
    }

    setPushingProducts(true);
    setSyncResult(null);
    try {
      // Step 1: Pull existing products from JTL first to match by SKU
      setSyncResult({
        success: true,
        message: 'Pulling existing products from JTL...',
      });

      const pullResult = await dataApi.pullProductsFromJTL(user.clientId);

      if (pullResult.data.updated > 0) {
        setSyncResult({
          success: true,
          message: `Matched ${pullResult.data.updated} existing products. Now pushing updates...`,
        });
      }

      // Step 2: Push products to JTL (create new or update existing)
      const result = await dataApi.pushProductsToJTL(user.clientId);

      if (result.success) {
        setSyncResult({
          success: true,
          message: `Sync complete! ${pullResult.data.updated} matched from JTL, ${result.data.synced} synced, ${result.data.failed} failed.`,
        });
        // Refetch products to show updated sync status
        const data = await dataApi.getProducts();
        const transformedProducts: Product[] = data.map(p => ({
          id: p.id,
          productId: p.productId,
          productName: p.name,
          sku: p.sku,
          available: p.available,
          reserved: p.reserved,
          announced: p.announced,
          client: p.client.companyName || p.client.name,
          clientId: p.clientId,
          jtlProductId: p.jtlProductId,
          jtlSyncStatus: p.jtlSyncStatus,
          lastJtlSync: p.lastJtlSync,
        }));
        setProducts(transformedProducts);
      } else {
        setSyncResult({
          success: false,
          message: result.message || 'Failed to push products to JTL.',
        });
      }
    } catch (err) {
      console.error('Error pushing products:', err);
      setSyncResult({
        success: false,
        message: 'Failed to sync products with JTL. Please try again.',
      });
    } finally {
      setPushingProducts(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  // Sync stock from JTL FFN - pulls stock levels only (no product creation)
  const handleSyncStock = async () => {
    if (!user?.clientId) {
      setSyncResult({
        success: false,
        message: 'Client ID not found. Please log in again.',
      });
      return;
    }

    setSyncingStock(true);
    setSyncResult(null);
    try {
      // Step 1: Pull products from JTL to match existing products by SKU
      setSyncResult({
        success: true,
        message: 'Checking for products in JTL...',
      });

      const pullResult = await dataApi.pullProductsFromJTL(user.clientId);

      if (pullResult.data.updated > 0) {
        setSyncResult({
          success: true,
          message: `Matched ${pullResult.data.updated} existing products from JTL. Now pulling stock...`,
        });
      }

      // Step 2: Sync stock levels (only for products that have jtlProductId)
      const result = await dataApi.syncStockFromJTL(user.clientId);
      if (result.success) {
        setSyncResult({
          success: true,
          message: `Stock synced! ${result.productsUpdated} updated, ${result.productsUnchanged} unchanged.`,
        });
        // Refetch products to show updated stock
        const refreshedData = await dataApi.getProducts();
        const transformedProducts: Product[] = refreshedData.map(p => ({
          id: p.id,
          productId: p.productId,
          productName: p.name,
          sku: p.sku,
          available: p.available,
          reserved: p.reserved,
          announced: p.announced,
          client: p.client.companyName || p.client.name,
          clientId: p.clientId,
          jtlProductId: p.jtlProductId,
          jtlSyncStatus: p.jtlSyncStatus,
          lastJtlSync: p.lastJtlSync,
        }));
        setProducts(transformedProducts);
      } else {
        setSyncResult({
          success: false,
          message: `Sync completed with ${result.productsFailed} failures.`,
        });
      }
    } catch (err) {
      console.error('Error syncing stock:', err);
      setSyncResult({
        success: false,
        message: 'Failed to sync stock from JTL. Please try again.',
      });
    } finally {
      setSyncingStock(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  // Import products from JTL FFN (creates new products locally, no channel sync)
  const handleImportProducts = async () => {
    if (!user?.clientId) {
      setSyncResult({
        success: false,
        message: 'Client ID not found. Please log in again.',
      });
      return;
    }

    setImportingProducts(true);
    setSyncResult(null);
    try {
      setSyncResult({
        success: true,
        message: 'Importing products from JTL FFN...',
      });

      const result = await dataApi.importProductsFromJTL(user.clientId);

      if (result.success) {
        setSyncResult({
          success: true,
          message: `Imported ${result.data.imported} products from JTL (${result.data.alreadyExists} already existed)`,
        });
        // Refetch products to show imported products
        const data = await dataApi.getProducts();
        const transformedProducts: Product[] = data.map(p => ({
          id: p.id,
          productId: p.productId,
          productName: p.name,
          sku: p.sku,
          available: p.available,
          reserved: p.reserved,
          announced: p.announced,
          client: p.client.companyName || p.client.name,
          clientId: p.clientId,
          jtlProductId: p.jtlProductId,
          jtlSyncStatus: p.jtlSyncStatus,
          lastJtlSync: p.lastJtlSync,
        }));
        setProducts(transformedProducts);
      } else {
        setSyncResult({
          success: false,
          message: result.message || 'Failed to import products from JTL.',
        });
      }
    } catch (err) {
      console.error('Error importing products:', err);
      setSyncResult({
        success: false,
        message: 'Failed to import products from JTL. Please try again.',
      });
    } finally {
      setImportingProducts(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  // Filter products based on tab and search
  const filteredProducts = useMemo(() => {
    let filteredList = [...products];

    // Filter by tab
    if (activeTab === 'outOfStock') {
      filteredList = filteredList.filter(p => p.available === 0);
    } else if (activeTab === 'missingData') {
      filteredList = filteredList.filter(p => !p.productName || !p.client);
    }

    // Filter by customer
    if (customerFilter !== 'ALL') {
      filteredList = filteredList.filter(p => p.client === customerFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(p =>
        p.productId.toLowerCase().includes(query) ||
        p.productName.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query)
      );
    }

    return filteredList;
  }, [products, activeTab, searchQuery, customerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count for tabs
  const allCount = products.length;
  const outOfStockCount = products.filter(p => p.available === 0).length;
  const missingDataCount = products.filter(p => !p.productName || !p.client).length;

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Show loading state - skeleton
  if (loading) {
    return (
      <div className="w-full flex flex-col" style={{ gap: 'clamp(16px, 1.76vw, 24px)' }}>
        <TabsSkeleton tabs={3} />
        <FilterBarSkeleton />
        {isMobile ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <MobileCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ProductsTableSkeleton rows={10} />
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ gap: 'clamp(16px, 1.76vw, 24px)' }}>
      {/* Header with Tabs and Create Button */}
      <div className="flex flex-col w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between w-full gap-4">
        
        {/* Mobile: Tab Dropdown Selector */}
        <div className="md:hidden w-full">
          <select
            value={activeTab}
            onChange={(e) => { setActiveTab(e.target.value as TabType); setCurrentPage(1); }}
            className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003450]/20"
          >
            <option value="all">{t('allProducts')} ({allCount})</option>
            <option value="outOfStock">{t('outOfStock')} ({outOfStockCount})</option>
            <option value="missingData">{t('missingData')} ({missingDataCount})</option>
          </select>
        </div>

        {/* Desktop: Horizontal Tabs */}
        <div
          className="hidden md:flex items-end"
          style={{
            gap: 'clamp(16px, 1.76vw, 24px)',
          }}
        >
          {/* All Products Tab */}
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              gap: 'clamp(4px, 0.59vw, 8px)',
              paddingBottom: 'clamp(8px, 0.88vw, 12px)',
              borderBottom: activeTab === 'all' ? '2px solid #003450' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'all' ? '#003450' : '#6B7280',
              }}
            >
              {t('allProducts')}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.88vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'all' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'all' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {allCount}
            </span>
          </button>

          {/* Out of Stock Tab */}
          <button
            onClick={() => { setActiveTab('outOfStock'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              gap: 'clamp(4px, 0.59vw, 8px)',
              paddingBottom: 'clamp(8px, 0.88vw, 12px)',
              borderBottom: activeTab === 'outOfStock' ? '2px solid #003450' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'outOfStock' ? '#003450' : '#6B7280',
              }}
            >
              {t('outOfStock')}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.88vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'outOfStock' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'outOfStock' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {outOfStockCount}
            </span>
          </button>

          {/* Missing Data Tab */}
          <button
            onClick={() => { setActiveTab('missingData'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              gap: 'clamp(4px, 0.59vw, 8px)',
              paddingBottom: 'clamp(8px, 0.88vw, 12px)',
              borderBottom: activeTab === 'missingData' ? '2px solid #003450' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'missingData' ? '#003450' : '#6B7280',
              }}
            >
              {t('missingData')}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.88vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'missingData' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'missingData' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {missingDataCount}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
          {/* Push Products to JTL Button */}
          {showSyncButtons && (
            <button
              onClick={handlePushProducts}
              disabled={pushingProducts}
              className="w-full md:w-auto"
              style={{
                height: 'clamp(32px, 2.8vw, 38px)',
                borderRadius: '6px',
                paddingTop: 'clamp(7px, 0.66vw, 9px)',
                paddingRight: 'clamp(13px, 1.25vw, 17px)',
                paddingBottom: 'clamp(7px, 0.66vw, 9px)',
                paddingLeft: 'clamp(13px, 1.25vw, 17px)',
                backgroundColor: pushingProducts ? '#9CA3AF' : '#2563EB',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: pushingProducts ? 'not-allowed' : 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                marginBottom: 'clamp(8px, 0.88vw, 12px)',
                gap: '6px',
              }}
            >
              {pushingProducts && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {pushingProducts ? 'Pushing...' : 'Push Products to JTL'}
              </span>
            </button>
          )}

          {/* Sync Stock Button */}
          {showSyncButtons && (
            <button
              onClick={handleSyncStock}
              disabled={syncingStock}
              className="w-full md:w-auto"
              style={{
                height: 'clamp(32px, 2.8vw, 38px)',
                borderRadius: '6px',
                paddingTop: 'clamp(7px, 0.66vw, 9px)',
                paddingRight: 'clamp(13px, 1.25vw, 17px)',
                paddingBottom: 'clamp(7px, 0.66vw, 9px)',
                paddingLeft: 'clamp(13px, 1.25vw, 17px)',
                backgroundColor: syncingStock ? '#9CA3AF' : '#059669',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: syncingStock ? 'not-allowed' : 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                marginBottom: 'clamp(8px, 0.88vw, 12px)',
                gap: '6px',
              }}
            >
              {syncingStock && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {syncingStock ? 'Syncing...' : 'Sync Stock from JTL'}
              </span>
            </button>
          )}

          {/* Import from JTL Button */}
          {showSyncButtons && (
            <button
              onClick={handleImportProducts}
              disabled={importingProducts}
              className="w-full md:w-auto"
              style={{
                height: 'clamp(32px, 2.8vw, 38px)',
                borderRadius: '6px',
                paddingTop: 'clamp(7px, 0.66vw, 9px)',
                paddingRight: 'clamp(13px, 1.25vw, 17px)',
                paddingBottom: 'clamp(7px, 0.66vw, 9px)',
                paddingLeft: 'clamp(13px, 1.25vw, 17px)',
                backgroundColor: importingProducts ? '#9CA3AF' : '#7C3AED',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: importingProducts ? 'not-allowed' : 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                marginBottom: 'clamp(8px, 0.88vw, 12px)',
                gap: '6px',
              }}
            >
              {importingProducts && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {importingProducts ? 'Importing...' : 'Import from JTL'}
              </span>
            </button>
          )}

          {/* Create Product Button */}
          <button
            onClick={() => router.push(`${baseUrl}/create`)}
            className="w-full md:w-auto"
            style={{
              height: 'clamp(32px, 2.8vw, 38px)',
              borderRadius: '6px',
              paddingTop: 'clamp(7px, 0.66vw, 9px)',
              paddingRight: 'clamp(13px, 1.25vw, 17px)',
              paddingBottom: 'clamp(7px, 0.66vw, 9px)',
              paddingLeft: 'clamp(13px, 1.25vw, 17px)',
              backgroundColor: '#003450',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              whiteSpace: 'nowrap',
              marginBottom: 'clamp(8px, 0.88vw, 12px)',
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
              }}
            >
              {t('createProduct')}
            </span>
          </button>
        </div>
      </div>

      {/* Sync Result Toast */}
      {syncResult && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            syncResult.success ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <div className="flex items-center gap-2">
            {syncResult.success ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-medium">{syncResult.message}</span>
          </div>
        </div>
      )}

      {/* Full-width horizontal line below tabs - hidden on mobile */}
      <div
        className="hidden md:block"
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#E5E7EB',
          marginTop: '-1px', // Overlap with tab border
        }}
      />
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        {/* Filter by Customer (admin/employee) or Channels (client) */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {showClientColumn ? t('filterByCustomer') : tCommon('channels')}
          </label>
          <div className="relative">
            <select
              value={customerFilter}
              onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
              disabled={showClientColumn ? clientsLoading : false}
              className="w-full md:w-auto"
              style={{
                minWidth: '200px',
                maxWidth: '100%',
                height: '38px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: '9px 13px',
                paddingRight: '32px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option key="ALL" value="ALL">
                {tCommon('all')}
              </option>
              {/* Show clients for admin/employee, show channels for client view */}
              {showClientColumn
                ? customerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))
                : channels.map((channel) => (
                    <option key={channel.name} value={channel.name}>
                      {channel.name} - {channel.type}
                    </option>
                  ))
              }
            </select>
            {/* Dropdown Arrow */}
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
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {tCommon('search')}
          </label>
          <input
            type="text"
            placeholder={tCommon('search')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-auto"
            style={{
              minWidth: '200px',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 13px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          />
        </div>

        {/* Info text for client column visibility */}
        {showClientColumn && (
          <div
            className="ml-auto"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#6B7280',
            }}
          >
            
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="flex flex-col gap-3">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showClientColumn={showClientColumn}
              onClick={() => handleProductClick(product.productId)}
              t={t}
            />
          ))}
          
          {/* Empty State */}
          {paginatedProducts.length === 0 && (
            <div
              className="bg-white rounded-lg border border-gray-200 p-8 text-center"
              style={{
                color: '#6B7280',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              }}
            >
              No products found
            </div>
          )}
        </div>
      ) : (
      /* Desktop Table View */
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
            gridTemplateColumns: showClientColumn
              ? 'minmax(80px, 1fr) minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1.5fr)'
              : 'minmax(80px, 1fr) minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr)',
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
            {t('productId')}
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
            {t('productName')}
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
            {t('available')}
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
            {t('reserved')}
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
            {t('announced')}
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
            JTL SYNC
          </span>
          {showClientColumn && (
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
              {t('client')}
            </span>
          )}
        </div>

        {/* Table Body */}
        {paginatedProducts.map((product, index) => (
          <div
            key={product.id}
            className="grid"
            onClick={() => handleProductClick(product.productId)}
            style={{
              gridTemplateColumns: showClientColumn
                ? 'minmax(80px, 1fr) minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1.5fr)'
                : 'minmax(80px, 1fr) minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr)',
              padding: '16px 24px',
              borderBottom: index < paginatedProducts.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#FFFFFF',
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
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              {product.productId}
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
              {product.productName || <span style={{ color: '#EF4444', fontStyle: 'italic' }}>Missing</span>}
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
              {product.available}
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
              {product.reserved}
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
              {product.announced}
            </span>
            {/* JTL Sync Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {product.jtlProductId ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: product.jtlSyncStatus === 'SYNCED' ? '#D1FAE5' : product.jtlSyncStatus === 'ERROR' ? '#FEE2E2' : '#FEF3C7',
                    color: product.jtlSyncStatus === 'SYNCED' ? '#059669' : product.jtlSyncStatus === 'ERROR' ? '#DC2626' : '#D97706',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '11px'
                  }}
                  title={`JTL ID: ${product.jtlProductId}${product.lastJtlSync ? ` | Last sync: ${new Date(product.lastJtlSync).toLocaleString()}` : ''}`}
                >
                  {product.jtlSyncStatus === 'SYNCED' ? 'Synced' : product.jtlSyncStatus === 'ERROR' ? 'Error' : 'Pending'}
                </span>
              ) : isGeneratedSku(product.sku) ? (
                <>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '11px'
                    }}
                    title={`Product has generated SKU (${product.sku}) and needs manual linking to JTL FFN`}
                  >
                    Needs Linking
                  </span>
                  <button
                    onClick={(e) => handleOpenLinkModal(product, e)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '11px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="Link this product to an existing JTL FFN product"
                  >
                    Link
                  </button>
                </>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '11px'
                  }}
                  title="Product not synced with JTL FFN"
                >
                  Not synced
                </span>
              )}
            </div>
            {showClientColumn && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                }}
              >
                {product.client || <span style={{ color: '#EF4444', fontStyle: 'italic' }}>Missing</span>}
              </span>
            )}
          </div>
        ))}

        {/* Empty State */}
        {paginatedProducts.length === 0 && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            }}
          >
            No products found
          </div>
        )}
      </div>
      )}

      {/* Pagination */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          minHeight: '63px',
          paddingTop: '12px',
        }}
      >
        <span
          className="text-sm text-center sm:text-left"
          style={{
            fontFamily: 'Inter, sans-serif',
            lineHeight: '20px',
            color: '#374151',
          }}
        >
          Showing <span style={{ fontWeight: 500 }}>{filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span style={{ fontWeight: 500 }}>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
          <span style={{ fontWeight: 500 }}>{filteredProducts.length}</span> results
        </span>

        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex-1 sm:flex-none"
            style={{
              minWidth: '92px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 17px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {tCommon('previous')}
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex-1 sm:flex-none"
            style={{
              minWidth: '92px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 17px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {tCommon('next')}
            </span>
          </button>
        </div>
      </div>

      {/* JTL Link Modal */}
      {linkModalProduct && (
        <JTLLinkModal
          isOpen={linkModalOpen}
          productId={linkModalProduct.id}
          productName={linkModalProduct.productName}
          productSku={linkModalProduct.sku}
          clientId={linkModalProduct.clientId || user?.clientId || ''}
          onClose={() => {
            setLinkModalOpen(false);
            setLinkModalProduct(null);
          }}
          onLinked={handleProductLinked}
        />
      )}
    </div>
  );
}
