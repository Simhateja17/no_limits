/**
 * Channels API Service
 * Handles fetching channels, warehouse locations, and shipping methods
 */

import { api } from './api';

// ============= TYPES =============

export interface Channel {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier?: string;
}

export interface ChannelsResponse {
  success: boolean;
  channels: Channel[];
  error?: string;
}

export interface LocationsResponse {
  success: boolean;
  locations: Location[];
  error?: string;
}

export interface ShippingMethodsResponse {
  success: boolean;
  warehouseMethods: ShippingMethod[];
  channelMethods: ShippingMethod[];
  error?: string;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  syncedAt: string;
  error?: string;
}

export interface HistoricSyncResponse {
  success: boolean;
  channelId: string;
  syncedSince: string;
  details: {
    products: SyncResult;
    orders: SyncResult;
    returns: SyncResult;
  };
  error?: string;
}

// ============= API FUNCTIONS =============

export const channelsApi = {
  /**
   * Get all channels for a client
   */
  getChannels: async (clientId: string): Promise<ChannelsResponse> => {
    const response = await api.get<ChannelsResponse>(
      '/integrations/channels',
      {
        params: { clientId }
      }
    );
    return response.data;
  },

  /**
   * Get warehouse locations for a client
   */
  getWarehouseLocations: async (clientId: string): Promise<LocationsResponse> => {
    const response = await api.get<LocationsResponse>(
      '/integrations/warehouse-locations',
      {
        params: { clientId }
      }
    );
    return response.data;
  },

  /**
   * Get shipping methods for a channel
   */
  getShippingMethods: async (channelId: string): Promise<ShippingMethodsResponse> => {
    const response = await api.get<ShippingMethodsResponse>(
      `/integrations/shipping-methods/${channelId}`
    );
    return response.data;
  },

  /**
   * Trigger historic data sync for a channel
   * Pulls orders, returns, and inbounds from the last N days (default 180)
   */
  triggerHistoricSync: async (channelId: string, daysBack: number = 180): Promise<HistoricSyncResponse> => {
    const response = await api.post<HistoricSyncResponse>(
      `/integrations/sync/historic/${channelId}`,
      { daysBack }
    );
    return response.data;
  },

  /**
   * Trigger manual sync for a channel
   */
  triggerSync: async (channelId: string, fullSync: boolean = false): Promise<{ success: boolean; data: any }> => {
    const response = await api.post(
      `/integrations/sync/${channelId}`,
      { fullSync }
    );
    return response.data;
  },
};

export default channelsApi;
