'use client';

import { useState, useEffect, useMemo } from 'react';
import { dataApi } from '@/lib/data-api';

interface JTLProduct {
  jfsku: string;
  merchantSku: string;
  name: string;
  description: string | null;
  stockLevel: number;
  ean: string | null;
}

interface JTLLinkModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  productSku: string;
  clientId: string;
  onClose: () => void;
  onLinked: () => void;
}

export function JTLLinkModal({
  isOpen,
  productId,
  productName,
  productSku,
  clientId,
  onClose,
  onLinked,
}: JTLLinkModalProps) {
  const [jtlProducts, setJtlProducts] = useState<JTLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<JTLProduct | null>(null);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Fetch unlinked JTL products when modal opens
  useEffect(() => {
    if (isOpen && clientId) {
      fetchUnlinkedProducts();
    }
  }, [isOpen, clientId]);

  const fetchUnlinkedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataApi.getUnlinkedJTLProducts(clientId);
      if (response.success) {
        setJtlProducts(response.data.products);
      } else {
        setError('Failed to fetch JTL products');
      }
    } catch (err) {
      console.error('Error fetching unlinked JTL products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch JTL products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return jtlProducts;
    const query = searchQuery.toLowerCase();
    return jtlProducts.filter(
      (p) =>
        p.merchantSku.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.jfsku.toLowerCase().includes(query) ||
        (p.ean && p.ean.toLowerCase().includes(query))
    );
  }, [jtlProducts, searchQuery]);

  const handleLink = async () => {
    if (!selectedProduct) return;

    setLinking(true);
    setLinkError(null);

    try {
      const response = await dataApi.linkProductToJTL(productId, selectedProduct.jfsku);
      if (response.success) {
        onLinked();
        onClose();
      } else {
        setLinkError(response.message || 'Failed to link product');
      }
    } catch (err) {
      console.error('Error linking product:', err);
      setLinkError(err instanceof Error ? err.message : 'Failed to link product');
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Link to JTL FFN Product
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Link <span className="font-medium">{productName}</span>{' '}
              <span className="text-gray-400">({productSku})</span> to an existing JTL FFN product
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by SKU, name, JTL ID, or EAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="ml-3 text-gray-600">Loading JTL products...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchUnlinkedProducts}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <p>No products match your search</p>
              ) : (
                <p>No unlinked JTL products found</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.jfsku}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedProduct?.jfsku === product.jfsku
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {product.name}
                        </span>
                        {selectedProduct?.jfsku === product.jfsku && (
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>
                          <span className="text-gray-400">SKU:</span>{' '}
                          <span className="font-mono">{product.merchantSku}</span>
                        </span>
                        <span>
                          <span className="text-gray-400">JTL ID:</span>{' '}
                          <span className="font-mono">{product.jfsku}</span>
                        </span>
                        {product.ean && (
                          <span>
                            <span className="text-gray-400">EAN:</span>{' '}
                            <span className="font-mono">{product.ean}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          product.stockLevel > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        Stock: {product.stockLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link Error */}
        {linkError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{linkError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={linking}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedProduct || linking}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {linking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Linking...
              </span>
            ) : selectedProduct ? (
              `Link to ${selectedProduct.merchantSku}`
            ) : (
              'Select a product to link'
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-900">
                Migration Product Linking
              </p>
              <p className="text-sm text-amber-700 mt-1">
                This product has a generated SKU ({productSku}) and needs to be manually linked to an existing JTL FFN product. Select the matching product above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
