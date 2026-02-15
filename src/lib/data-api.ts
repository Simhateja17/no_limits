/**
 * Data API Client
 * API functions for fetching products, orders, returns, and inbounds
 */

import { api } from './api';

export interface Product {
  id: string;
  productId: string;
  name: string;
  manufacturer?: string | null;
  sku: string;
  gtin: string | null;
  han?: string | null;
  available: number;
  reserved: number;
  announced: number;
  heightInCm?: number | null;
  widthInCm?: number | null;
  lengthInCm?: number | null;
  weightInKg: number | null;
  amazonAsin?: string | null;
  amazonSku?: string | null;
  isbn?: string | null;
  customsCode?: string | null;
  countryOfOrigin?: string | null;
  netSalesPrice?: number | null;
  imageUrl: string | null;
  clientId: string;
  client: {
    companyName: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  jtlProductId?: string | null;
  jtlSyncStatus?: string | null;
  lastJtlSync?: string | null;
  isBundle?: boolean;
  bundlePrice?: number | null;
  bundleItems?: BundleItem[];
  possibleQuantity?: number | null;
  channels?: Array<{
    id: string;
    channelId: string;
    externalProductId: string | null;
    syncStatus: string;
    lastSyncAt: string | null;
    lastError: string | null;
    syncEnabled: boolean;
    isActive: boolean;
    channel: {
      name: string;
      type: string;
    };
  }>;
}

export interface BundleItem {
  id: string;
  quantity: number;
  childProductId: string;
  childProduct: {
    id: string;
    name: string;
    sku: string;
    gtin: string | null;
    imageUrl: string | null;
    available: number;
  };
}

export interface BundleSearchResult {
  id: string;
  name: string;
  sku: string;
  gtin: string | null;
  imageUrl: string | null;
  available: number;
}

export interface OrderSyncLog {
  id: string;
  action: string;
  origin: string;
  targetPlatform: string;
  changedFields: string[];
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  success: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  orderNumber: string | null;
  externalOrderId: string | null;
  orderDate: string;
  status: string;
  fulfillmentState: string | null; // FFN operational state (PENDING, PICKING, PACKING, PACKED, SHIPPED, etc.)
  jtlOutboundId: string | null; // JTL FFN outbound ID
  lastJtlSync: string | null; // Last sync date with JTL FFN
  jtlSyncStatus: string | null; // Sync status (SYNCED, ERROR, PENDING, etc.)
  jtlSyncError: string | null; // Error message if sync failed
  totalAmount: number | null;
  paymentStatus: string | null; // "paid", "pending", "refunded", or null
  paymentMethod: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  totalWeight: number | null;
  tags: string[];

  // Hold status
  isOnHold?: boolean;
  holdReason?: string | null;
  holdNotes?: string | null;

  // Customer information
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  // Shipping address
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingCompany: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  shippingCountryCode: string | null;

  client: {
    companyName: string;
    name: string;
  };
  channel: {
    name: string;
    type: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    productName: string | null;
    sku: string | null;
    product: {
      name: string;
      sku: string;
      gtin: string | null;
    } | null;
  }>;
  shipments?: Array<{
    id: string;
    trackingNumber: string;
    carrier: string | null;
    trackingUrl: string | null;
    shippedAt: string;
    status: string;
  }>;
  syncLogs?: OrderSyncLog[];
}

export interface Return {
  id: string;
  returnId: string;
  externalReturnId: string | null;
  status: string;
  reason: string | null;
  refundAmount: number | null;
  client: {
    companyName: string;
    name: string;
  };
  order: {
    orderId: string;
    orderNumber: string | null;
    externalOrderId: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    condition: string | null;
    product: {
      name: string;
      sku: string;
    };
  }>;
  createdAt: string;
}

export interface Inbound {
  id: string;
  inboundId: string;
  externalInboundId: string | null;
  status: string;
  deliveryType: string | null;
  expectedDate: string | null;
  receivedDate: string | null;
  client: {
    companyName: string;
    name: string;
  };
  items: Array<{
    id: string;
    expectedQuantity: number;
    receivedQuantity: number | null;
    product: {
      name: string;
      sku: string;
    };
  }>;
  createdAt: string;
}

export interface CreateOrderInput {
  orderId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    sku?: string;
    productName?: string;
  }>;
  shippingMethod?: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingZip?: string;
  shippingCountry?: string;
  shippingCountryCode?: string;
  notes?: string;
  tags?: string[];
  isOnHold?: boolean;
}

export interface CreateProductInput {
  name: string;
  manufacturer?: string;
  sku: string;
  gtin?: string;
  han?: string;
  heightInCm?: string;
  lengthInCm?: string;
  widthInCm?: string;
  weightInKg?: string;
  amazonAsin?: string;
  amazonSku?: string;
  isbn?: string;
  mhd?: string;
  charge?: string;
  zolltarifnummer?: string;
  ursprung?: string;
  nettoVerkaufspreis?: string;
  imageUrl?: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'INTERNAL_WAREHOUSE' | 'CLIENT_COMMUNICATION' | 'ORDER_PROCESSING' | 'RETURNS' | 'INVENTORY_CHECK' | 'OTHER';
  dueDate: string | null;
  completedAt: string | null;
  clientId: string | null;
  client: {
    id: string;
    companyName: string;
    name: string;
  } | null;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type?: 'INTERNAL_WAREHOUSE' | 'CLIENT_COMMUNICATION' | 'ORDER_PROCESSING' | 'RETURNS' | 'INVENTORY_CHECK' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  dueDate?: string;
  assigneeId?: string;
  clientId?: string;
  notifyCustomer?: boolean;
}

export interface TaskMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: string;
  content: string;
  timestamp: string;
  isFromCurrentUser: boolean;
}

// Update input types
export interface UpdateOrderInput {
  warehouseNotes?: string;
  carrierSelection?: string;
  carrierServiceLevel?: string;
  priorityLevel?: number;
  pickingInstructions?: string;
  packingInstructions?: string;
  isOnHold?: boolean;
  tags?: string[];
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingZip?: string;
  shippingCountryCode?: string;
  jtlShippingMethodId?: string;
  items?: Array<{
    id?: string;
    productId?: string;
    sku?: string;
    productName?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
}

export interface UpdateProductInput {
  name?: string;
  manufacturer?: string;
  sku?: string;
  gtin?: string;
  han?: string;
  heightInCm?: string;
  lengthInCm?: string;
  widthInCm?: string;
  weightInKg?: string;
  amazonAsin?: string;
  amazonSku?: string;
  isbn?: string;
  customsCode?: string;
  countryOfOrigin?: string;
  netSalesPrice?: string;
  warehouseNotes?: string;
  storageLocation?: string;
  minStockLevel?: number;
  reorderPoint?: number;
  imageUrl?: string;
}

export interface UpdateReturnInput {
  inspectionResult?: 'PENDING' | 'PASSED' | 'FAILED' | 'PARTIAL';
  notes?: string;
  warehouseNotes?: string;
  restockEligible?: boolean;
  restockQuantity?: number;
  restockReason?: string;
  hasDamage?: boolean;
  damageDescription?: string;
  hasDefect?: boolean;
  defectDescription?: string;
  status?: string;
  items?: Array<{
    returnItemId: string;
    condition?: 'GOOD' | 'ACCEPTABLE' | 'DAMAGED' | 'DEFECTIVE';
    disposition?: 'DISPOSED' | 'BOOKED_IN_AGAIN' | 'PENDING_DECISION';
    restockableQuantity?: number;
    damagedQuantity?: number;
    defectiveQuantity?: number;
    notes?: string;
  }>;
}

export interface CreateReturnInput {
  orderId?: string;
  reason?: string;
  reasonCategory?: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
  warehouseNotes?: string;
  items: Array<{
    sku?: string;
    productName?: string;
    quantity: number;
    condition: 'GOOD' | 'ACCEPTABLE' | 'DAMAGED' | 'DEFECTIVE';
  }>;
}

// Health Status types
export interface ChannelHealthStatus {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  lastOrderPollAt: string | null;
  lastProductPollAt: string | null;
  hasWebhook: boolean;
  status: 'healthy' | 'warning' | 'error' | 'inactive';
}

export interface SyncHealthCounts {
  total: number;
  synced: number;
  pending: number;
  error: number;
  conflict?: number;
}

export interface FFNHealthStatus {
  connected: boolean;
  lastSyncAt: string | null;
  pendingOrders: number;
  errorOrders: number;
  heldOrders: number;
}

export interface CommerceSyncHealthStatus {
  syncedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  failedOrdersList: Array<{
    id: string;
    orderNumber: string;
    error: string | null;
    lastAttempt: string;
  }>;
}

export interface FFNToPlatformStatus {
  lastStockSync: string | null;
  recentStockUpdates: number;
  orderStatusUpdates: number;
}

export interface CronJobStatus {
  jobName: string;
  lastRunAt: string;
  success: boolean;
  duration: number;
  details: Record<string, unknown> | null;
  error: string | null;
}

export interface HealthError {
  id: string;
  type: 'product' | 'order' | 'return';
  action: string;
  targetPlatform: string;
  errorMessage: string | null;
  entityId: string;
  entityName: string;
  createdAt: string;
}

export interface LastSyncJob {
  status: string;
  type: string;
  startedAt: string;
  completedAt: string | null;
}

export interface HealthStatus {
  channels: ChannelHealthStatus[];
  sync: {
    products: SyncHealthCounts;
    orders: SyncHealthCounts;
    returns: SyncHealthCounts;
  };
  ffn: FFNHealthStatus;
  ffnToPlatform: FFNToPlatformStatus;
  commerceSync: CommerceSyncHealthStatus;
  cronJobs: CronJobStatus[];
  recentErrors: HealthError[];
  lastSyncJob: LastSyncJob | null;
  generatedAt: string;
}

export interface UpdateResponse<T> {
  data: T;
  changedFields: string[];
  jtlSync: {
    success: boolean;
    error?: string;
  } | null;
}

// Dashboard types
export interface ChartDataPoint {
  monthKey: string;
  value: number;
}

export interface DashboardChartData {
  chartData: ChartDataPoint[];
  referenceData: ChartDataPoint[];
  monthOptions: string[];
  dateRange: {
    from: string;
    to: string;
  };
}

export interface DashboardEvent {
  id: string;
  type: 'return' | 'inbound' | 'order_attention';
  entityId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface QuickChatMessage {
  id: string;
  roomId: string;
  sender: string;
  senderRole: string;
  avatar: string | null;
  avatarColor: string;
  timestamp: string;
  content: string;
  clientName: string;
  tasks: string[];
}

export const dataApi = {
  // Products
  async getProducts(options?: { includeBundleDetails?: boolean }): Promise<Product[]> {
    const params = options?.includeBundleDetails ? { includeBundleDetails: 'true' } : {};
    const response = await api.get('/data/products', { params });
    return response.data.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/data/products/${id}`);
    return response.data.data;
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    const response = await api.post('/data/products', input);
    return response.data.data;
  },

  async updateProduct(id: string, input: UpdateProductInput): Promise<UpdateResponse<Product>> {
    const response = await api.patch(`/data/products/${id}`, input);
    return {
      data: response.data.data,
      changedFields: response.data.changedFields || [],
      jtlSync: response.data.jtlSync || null,
    };
  },

  // Bundles
  async updateBundle(productId: string, input: {
    isBundle: boolean;
    bundlePrice?: number | null;
    items: Array<{ childProductId: string; quantity: number }>;
  }): Promise<Product> {
    const response = await api.put(`/data/products/${productId}/bundle`, input);
    return response.data.data;
  },

  async searchBundleComponents(productId: string, query: string): Promise<BundleSearchResult[]> {
    const response = await api.get(`/data/products/${productId}/bundle/search`, { params: { q: query } });
    return response.data.data;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await api.get('/data/orders');
    return response.data.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/data/orders/${id}`);
    return response.data.data;
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const response = await api.post('/data/orders', input);
    return response.data.data;
  },

  async updateOrder(id: string, input: UpdateOrderInput): Promise<UpdateResponse<Order>> {
    const response = await api.patch(`/data/orders/${id}`, input);
    return {
      data: response.data.data,
      changedFields: response.data.changedFields || [],
      jtlSync: response.data.jtlSync || null,
    };
  },

  async createReplacementOrder(orderId: string, data: {
    reason: string;
    returnId?: string;
    items?: Array<{ sku: string; productName: string; quantity: number }>;
    customAddress?: {
      firstName?: string;
      lastName?: string;
      company?: string;
      address1?: string;
      address2?: string;
      city?: string;
      zip?: string;
      country?: string;
      countryCode?: string;
      phone?: string;
    };
    notes?: string;
    expedited?: boolean;
  }): Promise<{ replacementOrderId: string; originalOrderId: string; details: any }> {
    const response = await api.post(`/sync-admin/orders/${orderId}/replacement`, data);
    return response.data.data;
  },

  // Returns
  async getReturns(): Promise<Return[]> {
    const response = await api.get('/data/returns');
    return response.data.data;
  },

  async getReturn(id: string): Promise<Return> {
    const response = await api.get(`/data/returns/${id}`);
    return response.data.data;
  },

  async updateReturn(id: string, input: UpdateReturnInput): Promise<UpdateResponse<Return>> {
    const response = await api.patch(`/data/returns/${id}`, input);
    return {
      data: response.data.data,
      changedFields: response.data.changedFields || [],
      jtlSync: response.data.jtlSync || null,
    };
  },

  async createReturn(input: CreateReturnInput): Promise<Return> {
    const response = await api.post('/data/returns', input);
    return response.data.data;
  },

  async deleteOrder(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/data/orders/${id}`);
    return response.data;
  },

  async syncOrderToJTL(orderId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      outboundId?: string;
      alreadyExisted: boolean;
    };
  }> {
    const response = await api.post(`/fulfillment/orders/${orderId}/sync-to-jtl`);
    return response.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/data/products/${id}`);
    return response.data;
  },

  async deleteReturn(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/data/returns/${id}`);
    return response.data;
  },

  // Inbounds
  async getInbounds(): Promise<Inbound[]> {
    const response = await api.get('/data/inbounds');
    return response.data.data;
  },

  async getInbound(id: string): Promise<Inbound> {
    const response = await api.get(`/data/inbounds/${id}`);
    return response.data.data;
  },

  async createInbound(data: {
    deliveryType?: string;
    expectedDate?: string;
    carrierName?: string;
    trackingNumber?: string;
    notes?: string;
    simulateStock?: boolean;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<Inbound> {
    const response = await api.post('/data/inbounds', data);
    return response.data.data;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/data/tasks');
    return response.data.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/data/tasks/${id}`);
    return response.data.data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await api.post('/data/tasks', input);
    return response.data.data;
  },

  async updateTask(id: string, input: Partial<CreateTaskInput>): Promise<Task> {
    const response = await api.put(`/data/tasks/${id}`, input);
    return response.data.data;
  },

  // Task Messages (Task-specific chat)
  async getTaskMessages(taskId: string): Promise<TaskMessage[]> {
    const response = await api.get(`/tasks/${taskId}/messages`);
    return response.data.data;
  },

  async sendTaskMessage(taskId: string, content: string): Promise<TaskMessage> {
    const response = await api.post(`/tasks/${taskId}/messages`, { content });
    return response.data.data;
  },

  // Dashboard
  async getDashboardChart(fromDate?: string, toDate?: string): Promise<DashboardChartData> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const queryString = params.toString();
    const response = await api.get(`/data/dashboard/chart${queryString ? `?${queryString}` : ''}`);
    return response.data.data;
  },

  async getDashboardEvents(limit?: number): Promise<DashboardEvent[]> {
    const response = await api.get(`/data/dashboard/events${limit ? `?limit=${limit}` : ''}`);
    return response.data.data;
  },

  async getRecentChatMessages(limit?: number): Promise<QuickChatMessage[]> {
    const response = await api.get(`/chat/recent${limit ? `?limit=${limit}` : ''}`);
    return response.data.data;
  },

  // Stock Sync from JTL FFN
  async syncStockFromJTL(clientId?: string): Promise<{
    success: boolean;
    productsUpdated: number;
    productsUnchanged: number;
    productsFailed: number;
    errors: string[];
  }> {
    const response = await api.post('/sync-admin/stock/sync', clientId ? { clientId } : {});
    return response.data;
  },

  // Pull products FROM JTL FFN (updates jtlProductId for existing products)
  async pullProductsFromJTL(clientId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      totalJtlProducts: number;
      matched: number;
      updated: number;
      notFound: number;
      errors: string[];
    };
  }> {
    const response = await api.post(`/integrations/product-sync/client/${clientId}/pull-from-jtl`);
    return response.data;
  },

  // Push Products to JTL FFN (assigns jtlProductId)
  async pushProductsToJTL(clientId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      totalProducts: number;
      synced: number;
      failed: number;
      skipped: number;
    };
  }> {
    const response = await api.post(`/integrations/product-sync/client/${clientId}/full-sync`);
    return response.data;
  },

  // Import products FROM JTL FFN (creates new products locally, no channel sync)
  async importProductsFromJTL(clientId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      totalJtlProducts: number;
      alreadyExists: number;
      imported: number;
      failed: number;
      errors: string[];
      importedProducts: Array<{ sku: string; name: string; jfsku: string }>;
    };
  }> {
    const response = await api.post(`/integrations/product-sync/client/${clientId}/import-from-jtl`);
    return response.data;
  },

  // ============= MANUAL JTL FFN PRODUCT LINKING =============

  // Get JTL FFN products that are NOT linked to any local product
  async getUnlinkedJTLProducts(clientId: string): Promise<{
    success: boolean;
    data: {
      total: number;
      linked: number;
      unlinked: number;
      products: Array<{
        jfsku: string;
        merchantSku: string;
        name: string;
        description: string | null;
        stockLevel: number;
        ean: string | null;
      }>;
    };
  }> {
    const response = await api.get(`/integrations/jtl/unlinked-products/${clientId}`);
    return response.data;
  },

  // Link a local product to an existing JTL FFN product
  async linkProductToJTL(productId: string, jtlProductId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      productId: string;
      sku: string;
      name: string;
      jtlProductId: string;
      jtlSyncStatus: string;
    };
  }> {
    const response = await api.post(`/integrations/products/${productId}/link-jtl`, { jtlProductId });
    return response.data;
  },

  // Sync product stock to channel(s)
  async syncProductStock(productId: string, channelId?: string): Promise<{
    success: boolean;
    results: Array<{
      channelId: string;
      channelName: string;
      channelType: string;
      success: boolean;
      error?: string;
    }>;
    message?: string;
  }> {
    const response = await api.post(`/data/products/${productId}/sync-stock`, channelId ? { channelId } : {});
    return response.data;
  },

  // Health Status
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await api.get('/data/health-status');
    return response.data.data;
  },
};
