import { useState, useEffect, useCallback } from 'react';
import { dataApi, Product } from '@/lib/data-api';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiProducts = await dataApi.getProducts();
      setProducts(apiProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

// Re-export Product type for convenience
export type { Product };
