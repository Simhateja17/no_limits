'use client';

import { useHealthStatus } from '@/lib/hooks';
import { CronJobStatus } from '@/lib/data-api';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Utility: Format relative time
function formatRelativeTime(dateStr: string | null, t: any): string {
  if (!dateStr) return t('never');

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return t('secondsAgo', { count: diffSec });
  } else if (diffMin < 60) {
    return t('minutesAgo', { count: diffMin });
  } else {
    return t('hoursAgo', { count: diffHr });
  }
}

// Utility: Get status color classes
function getStatusColor(status: 'healthy' | 'warning' | 'error' | 'inactive'): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    case 'inactive':
      return 'bg-gray-400';
  }
}

// Utility: Get type icon
function getTypeIcon(type: string) {
  if (type === 'SHOPIFY') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.373 4.382c-.117-.055-.197-.064-.382-.045-.006-.006-.197-.193-.197-.193-1.103-1.103-2.52-1.591-4.005-.965-1.04.436-2.07 1.296-2.989 2.495-.655.855-1.157 1.58-1.427 2.05-.835-.244-1.427-.37-1.915-.37-.021 0-.048 0-.069.003-.282.027-.296.042-.335.294-.027.183-.682 5.255-.682 5.255L11.837 24l7.563-1.578s-2.988-17.97-3.027-18.04zm-2.66 1.74c-.335.103-.703.227-1.089.358-.006-1.24-.194-2.986-1.006-4.05.752-.165 1.584.197 2.095 1.415.295.702.392 1.44.406 2.277zm-2.289.73c-.973.3-2.038.63-3.084.96.6-2.316 1.697-3.434 2.495-3.857.476 1.103.589 2.316.589 2.897zm-1.188-4.54c.51 0 .973.138 1.378.406-.973.703-2.189 2.357-2.746 5.255-.82.252-1.62.503-2.344.728.589-2.412 2.056-6.389 3.712-6.389zm-5.087 17.577c-.117-.752 3.212-1.296 4.307-1.441.589-.08 1.697-.232 2.618-.437.021.138.049.27.076.4.117.615.376 1.103.752 1.427-.448.194-.876.424-1.263.693-1.103.772-2.032 1.857-2.344 2.897-.296.972-.089 1.709.436 2.316-.738-.064-1.309-.394-1.717-.986-.448-.648-.682-1.568-.865-2.869zm9.677 6.389c-.424-.117-.752-.4-1.006-.841-.227-.4-.358-.91-.358-1.515 0-1.103.483-2.064 1.103-2.897.42-.551.972-1.046 1.584-1.44.021.138.049.27.076.4.182 1.006.555 1.815 1.103 2.413-.318.876-.824 1.678-1.497 2.4-.537.572-1.103 1.027-1.709 1.378-.076.048-.158.091-.234.138-.027-.021-.062-.021-.062-.036z" />
      </svg>
    );
  } else if (type === 'WOOCOMMERCE') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.004 8.574c-.23-1.447-.664-2.74-1.273-3.83A9.97 9.97 0 0 0 12 0a9.97 9.97 0 0 0-9.73 4.744c-.61 1.09-1.044 2.383-1.274 3.83-.167 1.053-.196 2.192-.025 3.41.33 2.355 1.234 4.85 2.65 7.127 1.416 2.277 3.342 4.332 5.658 5.682A9.97 9.97 0 0 0 12 24a9.97 9.97 0 0 0 2.721-.369c2.316-1.35 4.242-3.405 5.658-5.682 1.416-2.277 2.32-4.772 2.65-7.127.171-1.218.142-2.357-.025-3.41z" />
      </svg>
    );
  }
  return null;
}

// Human-readable labels for cron job names
const JOB_LABELS: Record<string, string> = {
  paidOrderFFNSync: 'Paid Order → FFN Sweep',
  tokenRefresh: 'JTL Token Refresh',
  stockSync: 'Stock Sync (Safety Net)',
  commerceReconcile: 'Commerce Reconcile',
  stuckFulfillmentReconcile: 'Stuck Fulfillment Reconcile',
  inboundPoll: 'Inbound Poll (Stock)',
};

export function HealthStatusDashboard() {
  const { data, loading, error, refetch } = useHealthStatus();
  const t = useTranslations('health');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    if (data) {
      setLastRefreshed(new Date());
    }
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading health status...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">Failed to load health status</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const timeSinceRefresh = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('lastUpdated')}: {timeSinceRefresh}s {t('ago')}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('refresh')}
        </button>
      </div>

      {/* SECTION 1: CHANNELS → PLATFORM (Inbound from Commerce) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('section1Title')}</h2>
            <p className="text-sm text-gray-600">{t('section1Desc')}</p>
          </div>
        </div>

        {data.channels.length === 0 ? (
          <p className="text-sm text-gray-500">No channels configured</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.channels.map((channel) => (
              <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">{getTypeIcon(channel.type)}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{channel.name}</h3>
                      <p className="text-xs text-gray-500">{channel.type}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`} title={t(channel.status)}></div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('lastSync')}:</span>
                    <span className="text-gray-900">{formatRelativeTime(channel.lastSyncAt, t)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('lastPoll')} (Orders):</span>
                    <span className="text-gray-900">{formatRelativeTime(channel.lastOrderPollAt, t)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('lastPoll')} (Products):</span>
                    <span className="text-gray-900">{formatRelativeTime(channel.lastProductPollAt, t)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-gray-600">{t('webhookStatus')}:</span>
                    <span className={channel.hasWebhook ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {channel.hasWebhook ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sync Stats Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('syncSummary')}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-600 mb-1">{t('products')}</div>
              <div className="text-2xl font-semibold text-blue-700">{data.sync.products.total}</div>
              <div className="text-xs text-blue-600 mt-1">{data.sync.products.synced} synced</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-600 mb-1">{t('orders')}</div>
              <div className="text-2xl font-semibold text-purple-700">{data.sync.orders.total}</div>
              <div className="text-xs text-purple-600 mt-1">{data.sync.orders.synced} synced</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs text-orange-600 mb-1">{t('returns')}</div>
              <div className="text-2xl font-semibold text-orange-700">{data.sync.returns.total}</div>
              <div className="text-xs text-orange-600 mt-1">{data.sync.returns.synced} synced</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PLATFORM → JTL FFN (Outbound for Fulfillment) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('section2Title')}</h2>
            <p className="text-sm text-gray-600">{t('section2Desc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Connection Status:</span>
            {data.ffn.connected ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {t('connected')}
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                {t('disconnected')}
              </span>
            )}
          </div>

          {data.ffn.connected && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">{t('lastSync')}:</span>
                <span className="text-gray-900">{formatRelativeTime(data.ffn.lastSyncAt, t)}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-semibold text-yellow-700">{data.ffn.pendingOrders}</div>
                  <div className="text-sm text-yellow-600 mt-1">{t('pendingOrders')}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-semibold text-red-700">{data.ffn.errorOrders}</div>
                  <div className="text-sm text-red-600 mt-1">{t('errorOrders')}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-semibold text-blue-700">{data.ffn.heldOrders}</div>
                  <div className="text-sm text-blue-600 mt-1">{t('heldOrders')}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3: JTL FFN → PLATFORM (Inbound from Fulfillment) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('section3Title')}</h2>
            <p className="text-sm text-gray-600">{t('section3Desc')}</p>
          </div>
        </div>

        {data.ffn.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">{t('lastStockSync')}:</span>
              <span className="text-gray-900">{formatRelativeTime(data.ffnToPlatform.lastStockSync, t)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-semibold text-green-700">{data.ffnToPlatform.recentStockUpdates}</div>
                <div className="text-sm text-green-600 mt-1">{t('stockUpdatesLast24h')}</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-2xl font-semibold text-indigo-700">{data.ffnToPlatform.orderStatusUpdates}</div>
                <div className="text-sm text-indigo-600 mt-1">{t('orderStatusUpdatesLast24h')}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">{t('ffnNotConnected')}</p>
          </div>
        )}
      </div>

      {/* SECTION 4: PLATFORM → CHANNELS (Outbound to Commerce) */}
      {(data.commerceSync.syncedOrders + data.commerceSync.pendingOrders + data.commerceSync.failedOrders) > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-cyan-100 rounded-lg">
              <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('section4Title')}</h2>
              <p className="text-sm text-gray-600">{t('section4Desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-semibold text-green-700">{data.commerceSync.syncedOrders}</div>
              <div className="text-sm text-green-600 mt-1">{t('syncedToCommerce')}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-semibold text-yellow-700">{data.commerceSync.pendingOrders}</div>
              <div className="text-sm text-yellow-600 mt-1">{t('pendingCommerce')}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-semibold text-red-700">{data.commerceSync.failedOrders}</div>
              <div className="text-sm text-red-600 mt-1">{t('failedCommerce')}</div>
            </div>
          </div>

          {/* Failed Orders List */}
          {data.commerceSync.failedOrders > 0 && data.commerceSync.failedOrdersList.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('failedOrdersList')} ({data.commerceSync.failedOrdersList.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.commerceSync.failedOrdersList.map((order) => (
                  <div key={order.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        <span className="text-xs text-gray-500">{formatRelativeTime(order.lastAttempt, t)}</span>
                      </div>
                      {order.error && (
                        <p className="text-sm text-red-600 mt-1 line-clamp-2">{order.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: BACKGROUND JOBS */}
      {data.cronJobs && data.cronJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('section5Title')}</h2>
              <p className="text-sm text-gray-600">{t('section5Desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.cronJobs.map((job: CronJobStatus) => {
              const label = JOB_LABELS[job.jobName] || job.jobName;
              const durationStr = job.duration < 1000
                ? `${job.duration}ms`
                : `${(job.duration / 1000).toFixed(1)}s`;

              return (
                <div key={job.jobName} className={`border rounded-lg p-4 ${job.success ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{label}</h3>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${job.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last run:</span>
                      <span className="text-gray-700">{formatRelativeTime(job.lastRunAt, t)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-700">{durationStr}</span>
                    </div>
                    {job.details && (
                      <div className="pt-1 border-t border-gray-100 mt-1">
                        <span className="text-gray-500">
                          {Object.entries(job.details as Record<string, unknown>)
                            .filter(([, v]) => typeof v === 'number')
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {job.error && (
                      <div className="pt-1 border-t border-red-100 mt-1">
                        <p className="text-red-600 line-clamp-2">{job.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Errors Feed (All Directions) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentErrors')}</h2>
        {data.recentErrors.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600">{t('noErrors')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.recentErrors.map((err) => (
              <div key={err.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {err.type === 'product' && (
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                  {err.type === 'order' && (
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {err.type === 'return' && (
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">{err.type}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-xs text-gray-500">{err.targetPlatform}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-xs text-gray-500">{err.action}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{err.entityName}</p>
                  <p className="text-xs text-red-600 mt-1 line-clamp-2">{err.errorMessage || 'Unknown error'}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(err.createdAt, t)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
