/**
 * useNotifications Hook
 * Manages notification state and real-time updates via Socket.IO
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, type Notification } from '../notifications-api';
import { getSocket } from '../socket';
import { useAuthStore } from '../store';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get notifications based on user role
      const response =
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          ? await notificationsApi.getAdminNotifications({ limit: 20 })
          : await notificationsApi.getNotifications({ limit: 20 });

      if (response.success) {
        setNotifications(response.notifications);
      } else {
        setError(response.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const result = await notificationsApi.markAsRead(notificationId);
        if (result.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date() } : notif
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationsApi.markAllAsRead();
      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationsApi.dismissNotification(notificationId);
      if (result.success) {
        // Remove from local state
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
        // Decrement unread count if it was unread
        setNotifications((prev) => {
          const dismissed = prev.find((n) => n.id === notificationId);
          if (dismissed && !dismissed.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  }, []);

  // Socket.IO: Listen for new notifications
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket || !socket.connected) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('[Notifications] Received new notification:', notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Play sound for high priority notifications
      if (notification.priority === 'HIGH' || notification.priority === 'CRITICAL') {
        // Optional: Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {
            // Ignore if autoplay is blocked
          });
        } catch (e) {
          // Ignore audio errors
        }
      }

      // Show browser notification for critical alerts
      if (notification.priority === 'CRITICAL' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            tag: notification.id,
          });
        }
      }
    };

    const handleAdminNotification = (notification: Notification) => {
      console.log('[Notifications] Received admin notification:', notification);
      handleNewNotification(notification);
    };

    // Subscribe to notification events
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:admin', handleAdminNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:admin', handleAdminNotification);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: fetchNotifications,
  };
}

export default useNotifications;
