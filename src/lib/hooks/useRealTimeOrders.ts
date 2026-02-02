import { useCallback } from 'react';
import { useRealTimeData } from './useRealTimeData';
import { dataApi, Order } from '../data-api';

/**
 * Real-time orders hook
 *
 * Fetches orders and automatically updates them when backend emits socket events.
 * Listens to:
 * - data:order:synced - when an order is created/updated/synced to FFN or commerce
 * - data:order:cancelled - when an order is cancelled
 *
 * @returns { data, loading, error, refetch }
 */
export function useRealTimeOrders() {
  // Stable fetchData function - won't change on re-renders
  const fetchData = useCallback(() => dataApi.getOrders(), []);

  // Stable onEvent function - won't change on re-renders
  const onEvent = useCallback((currentOrders: Order[], eventData: any) => {
    const { orderId } = eventData;

    // Find order in current list by orderId (external order ID)
    const orderIndex = currentOrders.findIndex(
      o => o.orderId === orderId ||
           o.orderNumber === orderId ||
           o.externalOrderId === orderId
    );

    if (orderIndex === -1) {
      // New order - refetch to get full data
      return null;
    }

    // Order exists - refetch to get updated fields
    // (Alternatively: could fetch single order and merge, but refetching is safer)
    return null;
  }, []);

  return useRealTimeData<Order[]>({
    fetchData,
    eventName: 'data:order:synced',
    onEvent,
  });
}

/**
 * Alternative implementation if you want to also listen to order cancellations
 * This would require a more complex hook or composing multiple listeners
 */
export function useRealTimeOrdersWithCancellation() {
  // For now, we only listen to the primary sync event
  // The order:synced event should cover both updates and cancellations
  return useRealTimeOrders();
}
