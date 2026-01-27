/**
 * Notifications API Client
 * Handles fetching and managing notifications
 */

import { api } from './api';

// ============= TYPES =============

export type NotificationType =
  | 'SHIPPING_MISMATCH'
  | 'ORDER_ON_HOLD'
  | 'SYNC_ERROR'
  | 'INVENTORY_LOW'
  | 'SYSTEM_ALERT'
  | 'TASK_ASSIGNED'
  | 'INFO';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  userId: string | null;
  clientId: string | null;
  orderId: string | null;
  mismatchId: string | null;
  metadata: any;
  isRead: boolean;
  readAt: Date | null;
  isDismissed: boolean;
  dismissedAt: Date | null;
  actionUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    name: string;
    companyName: string;
  } | null;
  order?: {
    orderId: string;
    orderNumber: string | null;
  } | null;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  error?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
  error?: string;
}

// ============= API FUNCTIONS =============

export const notificationsApi = {
  /**
   * Get notifications for the current user
   */
  getNotifications: async (options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    types?: NotificationType[];
  }): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();

    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.types?.length) params.append('types', options.types.join(','));

    const response = await api.get<NotificationsResponse>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get admin broadcast notifications
   */
  getAdminNotifications: async (options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    types?: NotificationType[];
    clientId?: string;
  }): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();

    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.types?.length) params.append('types', options.types.join(','));
    if (options?.clientId) params.append('clientId', options.clientId);

    const response = await api.get<NotificationsResponse>(
      `/notifications/admin?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean; count: number; error?: string }> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Dismiss a notification
   */
  dismissNotification: async (notificationId: string): Promise<{ success: boolean; error?: string }> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationsApi;
