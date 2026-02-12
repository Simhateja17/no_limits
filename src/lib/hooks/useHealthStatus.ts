import { useState, useEffect, useCallback } from 'react';
import { dataApi, HealthStatus } from '@/lib/data-api';

interface UseHealthStatusResult {
  data: HealthStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHealthStatus(): UseHealthStatusResult {
  const [data, setData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      // Only show loading spinner on initial fetch
      if (!data) {
        setLoading(true);
      }
      setError(null);
      const healthData = await dataApi.getHealthStatus();
      setData(healthData);
    } catch (err: any) {
      console.error('Error fetching health status:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch health status');
      // Don't clear data on error - keep showing stale data
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Initial fetch
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth();
    }, 30_000);

    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { data, loading, error, refetch: fetchHealth };
}
