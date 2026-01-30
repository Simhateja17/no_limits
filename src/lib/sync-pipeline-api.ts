/**
 * Sync Pipeline API Client
 * API functions for managing the initial sync pipeline during client onboarding
 */

import { api } from './api';

// ============= TYPES =============

export type PipelineStatusEnum = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type PipelineStepStatusEnum = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface PipelineStep {
  stepNumber: number;
  stepName: string;
  stepDescription: string | null;
  status: PipelineStepStatusEnum;
  progress: number;
  itemsTotal: number;
  itemsProcessed: number;
  itemsFailed: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PipelineStatus {
  pipelineId: string;
  channelId: string;
  clientId: string;
  status: PipelineStatusEnum;
  currentStep: number;
  totalSteps: number;
  progress: number;
  progressMessage: string | null;
  lastError: string | null;
  startedAt: string | null;
  completedAt: string | null;
  steps: PipelineStep[];
}

export interface PipelineResult {
  success: boolean;
  pipelineId: string;
  message?: string;
  error?: string;
}

export interface PipelineWithChannel {
  id: string;
  channelId: string;
  clientId: string;
  status: PipelineStatusEnum;
  currentStep: number;
  totalSteps: number;
  progress: number;
  progressMessage: string | null;
  lastError: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  steps: PipelineStep[];
}

// ============= API FUNCTIONS =============

/**
 * Start a new sync pipeline for a channel
 */
export async function startPipeline(params: {
  channelId: string;
  clientId: string;
  syncFromDate?: string;
  syncType?: 'initial' | 'full' | 'incremental';
}): Promise<PipelineResult> {
  const response = await api.post<PipelineResult>('/sync-pipeline/start', params);
  return response.data;
}

/**
 * Get the current pipeline status for a channel
 */
export async function getPipelineStatus(
  channelId: string,
  syncType: string = 'initial'
): Promise<PipelineStatus | null> {
  try {
    const response = await api.get<{ success: boolean; data: PipelineStatus }>(
      `/sync-pipeline/status/${channelId}`,
      { params: { syncType } }
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * Pause a running pipeline
 */
export async function pausePipeline(pipelineId: string): Promise<PipelineResult> {
  const response = await api.post<PipelineResult>(`/sync-pipeline/${pipelineId}/pause`);
  return response.data;
}

/**
 * Resume a paused pipeline
 */
export async function resumePipeline(pipelineId: string): Promise<PipelineResult> {
  const response = await api.post<PipelineResult>(`/sync-pipeline/${pipelineId}/resume`);
  return response.data;
}

/**
 * Retry a failed pipeline from the failed step
 */
export async function retryPipeline(pipelineId: string): Promise<PipelineResult> {
  const response = await api.post<PipelineResult>(`/sync-pipeline/${pipelineId}/retry`);
  return response.data;
}

/**
 * Cancel/stop a running pipeline completely
 */
export async function cancelPipeline(pipelineId: string): Promise<PipelineResult> {
  const response = await api.post<PipelineResult>(`/sync-pipeline/${pipelineId}/cancel`);
  return response.data;
}

/**
 * Get all pipelines for a client
 */
export async function getClientPipelines(
  clientId: string
): Promise<PipelineWithChannel[]> {
  const response = await api.get<{ success: boolean; data: PipelineWithChannel[] }>(
    `/sync-pipeline/client/${clientId}/pipelines`
  );
  return response.data.data;
}

/**
 * Helper to get step label from step name
 */
export function getStepLabel(stepName: string): string {
  const labels: Record<string, string> = {
    pull_channel_data: 'Pull Channel Data',
    import_jtl_products: 'Import JTL Products',
    push_products_to_jtl: 'Push Products to JTL',
    sync_order_statuses: 'Sync Order Statuses',
    sync_stock_levels: 'Sync Stock Levels',
  };
  return labels[stepName] || stepName;
}

/**
 * Helper to get status color class
 */
export function getStatusColor(status: PipelineStatusEnum | PipelineStepStatusEnum): string {
  const colors: Record<string, string> = {
    PENDING: 'text-gray-500',
    IN_PROGRESS: 'text-blue-500',
    PAUSED: 'text-yellow-500',
    COMPLETED: 'text-green-500',
    FAILED: 'text-red-500',
    SKIPPED: 'text-gray-400',
  };
  return colors[status] || 'text-gray-500';
}

/**
 * Helper to get status background color class
 */
export function getStatusBgColor(status: PipelineStatusEnum | PipelineStepStatusEnum): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-gray-100',
    IN_PROGRESS: 'bg-blue-100',
    PAUSED: 'bg-yellow-100',
    COMPLETED: 'bg-green-100',
    FAILED: 'bg-red-100',
    SKIPPED: 'bg-gray-50',
  };
  return colors[status] || 'bg-gray-100';
}
