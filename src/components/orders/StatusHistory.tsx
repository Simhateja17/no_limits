'use client';

import { useTranslations, useLocale } from 'next-intl';
import { type OrderSyncLog } from '@/lib/data-api';

interface StatusHistoryEntry {
  status: string;
  date: Date;
  origin?: string;
}

interface StatusHistoryProps {
  syncLogs?: OrderSyncLog[];
  orderDate?: string;
  currentStatus?: string;
  fulfillmentState?: string | null;
}

// Map internal status values to display labels
const getStatusLabel = (status: string, t: (key: string) => string): string => {
  const statusMap: Record<string, string> = {
    // OrderStatus
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'IN_STOCK': 'inStock',
    'OUT_OF_STOCK': 'outOfStock',
    'PARTIALLY_FULFILLED': 'partiallyFulfilled',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'ON_HOLD': 'onHold',
    'ERROR': 'error',
    // FulfillmentState
    'AWAITING_STOCK': 'awaitingStock',
    'READY_FOR_PICKING': 'readyForPicking',
    'PICKING': 'picking',
    'PICKED': 'picked',
    'PACKING': 'packing',
    'PACKED': 'packed',
    'LABEL_CREATED': 'labelCreated',
    'IN_TRANSIT': 'inTransit',
    'OUT_FOR_DELIVERY': 'outForDelivery',
    'FAILED_DELIVERY': 'failedDelivery',
    'RETURNED_TO_SENDER': 'returnedToSender',
    // Sync actions
    'create': 'created',
    'update': 'updated',
    'cancel': 'cancelled',
    'fulfill': 'fulfilled',
    'split': 'split',
  };

  const key = statusMap[status] || status.toLowerCase();
  // Try to get translation, fallback to formatted status
  try {
    const translated = t(key);
    // If translation returns the key, format it nicely
    if (translated === key) {
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
    }
    return translated;
  } catch {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
  }
};

export function StatusHistory({ syncLogs, orderDate, currentStatus, fulfillmentState }: StatusHistoryProps) {
  const t = useTranslations('status');
  const tOrders = useTranslations('orders');
  const locale = useLocale();

  // Build status history from sync logs and order data
  const buildStatusHistory = (): StatusHistoryEntry[] => {
    const history: StatusHistoryEntry[] = [];

    // Add order creation as first entry
    if (orderDate) {
      history.push({
        status: 'PENDING',
        date: new Date(orderDate),
        origin: 'system',
      });
    }

    // Process sync logs to extract status changes
    if (syncLogs && syncLogs.length > 0) {
      syncLogs.forEach((log) => {
        // Check if this log contains status changes
        const hasStatusChange = log.changedFields.some(field =>
          ['status', 'fulfillmentState', 'orderState'].includes(field)
        );

        if (hasStatusChange && log.newState) {
          const newState = log.newState as Record<string, unknown>;
          const status = (newState.status || newState.fulfillmentState || newState.orderState) as string;
          if (status) {
            history.push({
              status,
              date: new Date(log.createdAt),
              origin: log.origin,
            });
          }
        }

        // Also check for specific actions that indicate status changes
        if (['create', 'fulfill', 'cancel', 'split'].includes(log.action)) {
          // Skip 'create' if we already have the initial PENDING entry
          if (log.action === 'create' && history.length > 0 && history[0].status === 'PENDING') {
            return;
          }

          // For fulfill action, add a fulfillment status
          if (log.action === 'fulfill' && log.newState) {
            const newState = log.newState as Record<string, unknown>;
            const status = (newState.fulfillmentState || 'SHIPPED') as string;
            // Check if this status isn't already in history
            const exists = history.some(h =>
              h.status === status &&
              Math.abs(h.date.getTime() - new Date(log.createdAt).getTime()) < 1000
            );
            if (!exists) {
              history.push({
                status,
                date: new Date(log.createdAt),
                origin: log.origin,
              });
            }
          }

          // For cancel action
          if (log.action === 'cancel') {
            history.push({
              status: 'CANCELLED',
              date: new Date(log.createdAt),
              origin: log.origin,
            });
          }
        }
      });
    }

    // If no sync logs, add current status if different from initial
    if ((!syncLogs || syncLogs.length === 0) && currentStatus && currentStatus !== 'PENDING') {
      history.push({
        status: currentStatus,
        date: new Date(),
        origin: 'system',
      });
    }

    // Add current fulfillment state if not in history
    if (fulfillmentState && !history.some(h => h.status === fulfillmentState)) {
      history.push({
        status: fulfillmentState,
        date: new Date(),
        origin: 'system',
      });
    }

    // Sort by date ascending and remove duplicates
    const sorted = history.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Remove consecutive duplicates
    return sorted.filter((entry, index) =>
      index === 0 || entry.status !== sorted[index - 1].status
    );
  };

  const statusHistory = buildStatusHistory();

  // Format date based on locale
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  };

  if (statusHistory.length === 0) {
    return null;
  }

  return (
    <>
      {/* Header */}
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
        {tOrders('statusHistory')}
      </span>

      {/* Status History Table */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          marginTop: '12px',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {tOrders('status')}
          </div>
          <div
            style={{
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {tOrders('date')}
          </div>
        </div>

        {/* Table Body */}
        {statusHistory.map((entry, index) => (
          <div
            key={`${entry.status}-${entry.date.getTime()}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
              borderBottom: index < statusHistory.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {getStatusLabel(entry.status, t)}
            </div>
            <div
              style={{
                padding: '14px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {formatDate(entry.date)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default StatusHistory;
