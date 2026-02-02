import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../socket';
import { toast } from 'sonner';

export interface UseRealTimeDataOptions<T> {
  /**
   * Function to fetch initial data
   */
  fetchData: () => Promise<T>;

  /**
   * Socket event name to listen for (e.g., 'data:product:synced')
   */
  eventName: string;

  /**
   * Function to update data when event received
   * @param currentData Current data state
   * @param eventData Data received from socket event
   * @returns Updated data or null to refetch
   */
  onEvent: (currentData: T, eventData: any) => T | null;

  /**
   * Optional: Filter function to ignore irrelevant events
   */
  eventFilter?: (eventData: any) => boolean;

  /**
   * Optional: Show toast notifications for updates (default: true)
   */
  showToast?: boolean;
}

/**
 * Generic hook for real-time data updates via Socket.IO
 *
 * Features:
 * - Fetches initial data
 * - Listens for socket events and updates data automatically
 * - Shows toast notifications for updates
 * - Falls back to polling on socket disconnect
 * - Handles reconnection gracefully
 */
export function useRealTimeData<T>(options: UseRealTimeDataOptions<T>) {
  const { fetchData, eventName, onEvent, eventFilter, showToast = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const refetch = useCallback(async () => {
    try {
      console.log('[RealTime] Fetching initial data...');
      setLoading(true);
      setError(null);
      const result = await fetchData();
      console.log('[RealTime] Data fetched successfully:', result);
      setData(result);
    } catch (err: any) {
      console.error('[RealTime] Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      console.log('[RealTime] Loading complete');
    }
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Socket event listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.log('[RealTime] Socket not initialized yet, skipping event listener setup');
      return;
    }

    console.log(`[RealTime] Setting up listener for: ${eventName}`);

    const handleEvent = (eventData: any) => {
      console.log(`[RealTime] Event received:`, eventName, eventData);

      // Apply filter if provided
      if (eventFilter && !eventFilter(eventData)) {
        return;
      }

      // Show toast notification
      if (showToast) {
        const message = getToastMessage(eventName, eventData);
        toast.success(message, {
          duration: 3500,
        });
      }

      setData((currentData) => {
        if (!currentData) return currentData;

        const updated = onEvent(currentData, eventData);

        // If onEvent returns null, trigger refetch
        if (updated === null) {
          refetch();
          return currentData;
        }

        console.log(`[RealTime] Data updated:`, updated);
        return updated;
      });
    };

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
    };
  }, [eventName, onEvent, eventFilter, refetch, showToast]);

  // Fallback polling on socket disconnect
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.log('[RealTime] Socket not initialized, skipping disconnect handler setup');
      return;
    }

    let pollInterval: NodeJS.Timeout | null = null;

    const handleDisconnect = () => {
      console.log('[RealTime] Socket disconnected, starting fallback polling');
      // Start polling every 60 seconds as fallback
      pollInterval = setInterval(() => {
        console.log('[RealTime] Polling data (socket disconnected)');
        refetch();
      }, 60000);
    };

    const handleConnect = () => {
      console.log('[RealTime] Socket reconnected, stopping fallback polling');
      // Stop polling when reconnected
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      // Refetch data to ensure we're up to date
      refetch();
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Helper function to generate toast messages for different event types
 */
function getToastMessage(eventName: string, data: any): string {
  switch (eventName) {
    case 'data:order:synced':
      return `Order ${data.orderId?.slice(-6) || 'updated'} synced from ${data.platform}`;
    case 'data:order:cancelled':
      return `Order ${data.orderId?.slice(-6) || ''} cancelled`;
    case 'data:product:synced':
      return `Product synced to ${data.platform}`;
    case 'data:return:synced':
      return `Return ${data.returnId?.slice(-6) || ''} updated`;
    case 'data:return:restocked':
      return `${data.productsUpdated} product(s) restocked`;
    default:
      return 'Data updated';
  }
}
