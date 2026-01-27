'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notificationsApi, type Notification, NotificationType, NotificationPriority } from '@/lib/notifications-api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response =
          user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
            ? await notificationsApi.getAdminNotifications({
                unreadOnly: filter === 'unread',
                limit: 100,
                types: typeFilter !== 'all' ? [typeFilter] : undefined,
              })
            : await notificationsApi.getNotifications({
                unreadOnly: filter === 'unread',
                limit: 100,
                types: typeFilter !== 'all' ? [typeFilter] : undefined,
              });

        if (response.success) {
          setNotifications(response.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, filter, typeFilter]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await notificationsApi.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return '#DC2626';
      case 'HIGH':
        return '#F59E0B';
      case 'MEDIUM':
        return '#3B82F6';
      case 'LOW':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'SHIPPING_MISMATCH':
        return '📦';
      case 'ORDER_ON_HOLD':
        return '⏸️';
      case 'SYNC_ERROR':
        return '⚠️';
      case 'INVENTORY_LOW':
        return '📉';
      case 'SYSTEM_ALERT':
        return '🔔';
      case 'TASK_ASSIGNED':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#111827',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '8px',
            }}
          >
            Notifications
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            View and manage all system notifications
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          {/* Read/Unread Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'all' ? '#003450' : '#FFFFFF',
                color: filter === 'all' ? '#FFFFFF' : '#6B7280',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'unread' ? '#003450' : '#FFFFFF',
                color: filter === 'unread' ? '#FFFFFF' : '#6B7280',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Unread
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <option value="all">All Types</option>
            <option value="SHIPPING_MISMATCH">Shipping Mismatch</option>
            <option value="ORDER_ON_HOLD">Order On Hold</option>
            <option value="SYNC_ERROR">Sync Error</option>
            <option value="INVENTORY_LOW">Low Inventory</option>
            <option value="SYSTEM_ALERT">System Alert</option>
            <option value="TASK_ASSIGNED">Task Assigned</option>
          </select>
        </div>

        {/* Notifications List */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '14px',
              }}
            >
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '48px',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '14px',
              }}
            >
              No notifications found
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  padding: '16px 24px',
                  borderBottom: index < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                  cursor: notification.actionUrl ? 'pointer' : 'default',
                  backgroundColor: notification.isRead ? '#FFFFFF' : '#F9FAFB',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? '#FFFFFF' : '#F9FAFB';
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Icon */}
                  <div style={{ fontSize: '24px', flexShrink: 0 }}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: notification.isRead ? 400 : 600,
                        color: '#111827',
                        marginBottom: '8px',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {notification.title}
                    </div>

                    {/* Message */}
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        marginBottom: '12px',
                        lineHeight: '1.5',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {notification.message}
                    </div>

                    {/* Metadata */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#9CA3AF',
                        fontFamily: 'Inter, sans-serif',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Priority Badge */}
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${getPriorityColor(notification.priority)}15`,
                          color: getPriorityColor(notification.priority),
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        {notification.priority}
                      </span>

                      {/* Type */}
                      <span>{notification.type.replace(/_/g, ' ')}</span>

                      {/* Time */}
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>

                      {/* Client */}
                      {notification.client && (
                        <span>
                          • {notification.client.companyName || notification.client.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#3B82F6',
                        flexShrink: 0,
                        marginTop: '8px',
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
