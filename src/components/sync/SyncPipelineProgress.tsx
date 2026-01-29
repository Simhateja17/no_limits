'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  getPipelineStatus,
  retryPipeline,
  pausePipeline,
  resumePipeline,
  startPipeline,
  getStepLabel,
  type PipelineStatus,
  type PipelineStepStatusEnum,
} from '@/lib/sync-pipeline-api';
import { Skeleton } from '@/components/ui';

interface SyncPipelineProgressProps {
  channelId: string;
  clientId: string;
  syncFromDate?: string;
  syncType?: 'initial' | 'full' | 'incremental';
  autoStart?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// Icons
function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size, animation: 'spin 1s linear infinite' }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.4 31.4" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="2"/>
    </svg>
  );
}

function ErrorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2"/>
      <path d="M15 9L9 15M9 9L15 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PauseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#EAB308" strokeWidth="2"/>
      <path d="M10 8V16M14 8V16" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PendingIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" fill="#9CA3AF"/>
    </svg>
  );
}

function SkipIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 2"/>
      <path d="M8 12H16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function getStepStatusIcon(status: PipelineStepStatusEnum, size = 20) {
  switch (status) {
    case 'COMPLETED':
      return <CheckIcon size={size} />;
    case 'IN_PROGRESS':
      return <SpinnerIcon size={size} />;
    case 'FAILED':
      return <ErrorIcon size={size} />;
    case 'SKIPPED':
      return <SkipIcon size={size} />;
    case 'PENDING':
    default:
      return <PendingIcon size={size} />;
  }
}

export function SyncPipelineProgress({
  channelId,
  clientId,
  syncFromDate,
  syncType = 'initial',
  autoStart = false,
  onComplete,
  onError,
}: SyncPipelineProgressProps) {
  const t = useTranslations('channels');
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await getPipelineStatus(channelId, syncType);
      setPipeline(status);
      setError(null);

      if (status?.status === 'COMPLETED') {
        onComplete?.();
      } else if (status?.status === 'FAILED' && status.lastError) {
        onError?.(status.lastError);
      }

      return status;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch pipeline status';
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [channelId, syncType, onComplete, onError]);

  // Initial fetch and auto-start
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const status = await fetchStatus();

      // Auto-start if no pipeline exists and autoStart is enabled
      if (isMounted && autoStart && !status) {
        try {
          await startPipeline({ channelId, clientId, syncFromDate, syncType });
          await fetchStatus();
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to start pipeline');
          }
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [channelId, clientId, syncFromDate, syncType, autoStart, fetchStatus]);

  // Polling for updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // Only poll if pipeline is in progress
    if (pipeline?.status === 'IN_PROGRESS' || pipeline?.status === 'PENDING') {
      pollInterval = setInterval(fetchStatus, 2000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pipeline?.status, fetchStatus]);

  const handleRetry = async () => {
    if (!pipeline) return;
    setActionLoading(true);
    try {
      await retryPipeline(pipeline.pipelineId);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry pipeline');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!pipeline) return;
    setActionLoading(true);
    try {
      await pausePipeline(pipeline.pipelineId);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause pipeline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!pipeline) return;
    setActionLoading(true);
    try {
      await resumePipeline(pipeline.pipelineId);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume pipeline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await startPipeline({ channelId, clientId, syncFromDate, syncType });
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start pipeline');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
      }}>
        <Skeleton width="200px" height="24px" style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height="8px" borderRadius="4px" style={{ marginBottom: 24 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Skeleton width="24px" height="24px" borderRadius="50%" />
            <Skeleton width="180px" height="16px" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !pipeline) {
    return (
      <div style={{
        padding: 20,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        border: '1px solid #FECACA',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ErrorIcon size={20} />
          <span style={{ fontWeight: 500, color: '#DC2626' }}>
            {t('sync.pipeline.error') || 'Pipeline Error'}
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#7F1D1D', marginBottom: 16 }}>{error}</p>
        <button
          onClick={handleStart}
          disabled={actionLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading ? 0.6 : 1,
          }}
        >
          {actionLoading ? (t('sync.pipeline.starting') || 'Starting...') : (t('sync.pipeline.startSync') || 'Start Sync')}
        </button>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div style={{
        padding: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
          {t('sync.pipeline.noPipeline') || 'No sync pipeline found for this channel.'}
        </p>
        <button
          onClick={handleStart}
          disabled={actionLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading ? 0.6 : 1,
          }}
        >
          {actionLoading ? (t('sync.pipeline.starting') || 'Starting...') : (t('sync.pipeline.startInitialSync') || 'Start Initial Sync')}
        </button>
      </div>
    );
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#DCFCE7';
      case 'FAILED': return '#FEE2E2';
      case 'IN_PROGRESS': return '#DBEAFE';
      case 'PAUSED': return '#FEF3C7';
      case 'PENDING': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#166534';
      case 'FAILED': return '#DC2626';
      case 'IN_PROGRESS': return '#1D4ED8';
      case 'PAUSED': return '#A16207';
      case 'PENDING': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDuration = (startedAt: string | null, completedAt: string | null) => {
    if (!startedAt) return '';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div style={{
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pipeline.status === 'IN_PROGRESS' && <SpinnerIcon size={24} />}
          {pipeline.status === 'COMPLETED' && <CheckIcon size={24} />}
          {pipeline.status === 'FAILED' && <ErrorIcon size={24} />}
          {pipeline.status === 'PAUSED' && <PauseIcon size={24} />}
          {pipeline.status === 'PENDING' && <PendingIcon size={24} />}
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 16, color: '#111827', margin: 0 }}>
              {t('sync.pipeline.title') || 'Initial Sync Pipeline'}
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0, marginTop: 2 }}>
              {pipeline.progressMessage || (t('sync.pipeline.step') || 'Step')} {pipeline.currentStep}/{pipeline.totalSteps}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: getStatusBgColor(pipeline.status),
            color: getStatusTextColor(pipeline.status),
            fontSize: 12,
            fontWeight: 600,
          }}>
            {pipeline.status}
          </span>
          {pipeline.startedAt && (
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {formatDuration(pipeline.startedAt, pipeline.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#6B7280',
          marginBottom: 4,
        }}>
          <span>{t('sync.pipeline.progress') || 'Progress'}</span>
          <span>{Math.round(pipeline.progress)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          backgroundColor: '#E5E7EB',
          borderRadius: 9999,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pipeline.progress}%`,
            height: '100%',
            backgroundColor: pipeline.status === 'FAILED' ? '#EF4444' : '#3B82F6',
            borderRadius: 9999,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: 16 }}>
        {pipeline.steps.map((step, index) => (
          <div
            key={step.stepNumber}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 0',
              borderBottom: index < pipeline.steps.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}
          >
            <div style={{ paddingTop: 2 }}>
              {getStepStatusIcon(step.status, 20)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontWeight: 500,
                  fontSize: 14,
                  color: step.status === 'PENDING' ? '#9CA3AF' : '#111827',
                }}>
                  {getStepLabel(step.stepName)}
                </span>
                {step.status === 'IN_PROGRESS' && (
                  <span style={{ fontSize: 12, color: '#3B82F6' }}>
                    {step.itemsProcessed} / {step.itemsTotal || '?'}
                  </span>
                )}
                {step.status === 'COMPLETED' && (
                  <span style={{ fontSize: 12, color: '#22C55E' }}>
                    {step.itemsProcessed} {t('sync.pipeline.processed') || 'processed'}
                    {step.itemsFailed > 0 && (
                      <span style={{ color: '#EF4444', marginLeft: 4 }}>
                        ({step.itemsFailed} failed)
                      </span>
                    )}
                  </span>
                )}
              </div>
              {step.stepDescription && (
                <p style={{
                  fontSize: 12,
                  color: '#6B7280',
                  margin: '4px 0 0 0',
                }}>
                  {step.stepDescription}
                </p>
              )}
              {step.status === 'FAILED' && step.errorMessage && (
                <p style={{
                  fontSize: 12,
                  color: '#EF4444',
                  margin: '4px 0 0 0',
                  padding: '4px 8px',
                  backgroundColor: '#FEE2E2',
                  borderRadius: 4,
                }}>
                  {step.errorMessage}
                </p>
              )}
              {step.status === 'IN_PROGRESS' && step.itemsTotal > 0 && (
                <div style={{
                  marginTop: 6,
                  width: '100%',
                  height: 4,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(step.itemsProcessed / step.itemsTotal) * 100}%`,
                    height: '100%',
                    backgroundColor: '#3B82F6',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {pipeline.status === 'FAILED' && pipeline.lastError && (
        <div style={{
          padding: 12,
          backgroundColor: '#FEE2E2',
          borderRadius: 8,
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>
            <strong>{t('sync.pipeline.error') || 'Error'}:</strong> {pipeline.lastError}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {pipeline.status === 'IN_PROGRESS' && (
          <button
            onClick={handlePause}
            disabled={actionLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FEF3C7',
              color: '#A16207',
              border: '1px solid #FCD34D',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {t('sync.pipeline.pause') || 'Pause'}
          </button>
        )}
        {pipeline.status === 'PAUSED' && (
          <button
            onClick={handleResume}
            disabled={actionLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              border: '1px solid #93C5FD',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {t('sync.pipeline.resume') || 'Resume'}
          </button>
        )}
        {pipeline.status === 'FAILED' && (
          <button
            onClick={handleRetry}
            disabled={actionLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            {t('sync.pipeline.retry') || 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
}

export default SyncPipelineProgress;
