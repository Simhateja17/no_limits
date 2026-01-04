/**
 * Data API Client
 * API functions for fetching products, orders, returns, and inbounds
 */

import { api } from './api';

export interface Product {
  id: string;
  productId: string;
  name: string;
  sku: string;
  gtin: string | null;
  available: number;
  reserved: number;
  announced: number;
  weightInKg: number | null;
  imageUrl: string | null;
  client: {
    companyName: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  orderNumber: string | null;
  externalOrderId: string | null;
  orderDate: string;
  status: string;
  totalAmount: number | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  totalWeight: number | null;
  tags: string[];

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
  assignedToId: string | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  client: {
    companyName: string;
    name: string;
  };
  order: {
    orderId: string;
  } | null;
  return: {
    returnId: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: 'INTERNAL_WAREHOUSE' | 'CLIENT_COMMUNICATION' | 'ORDER_PROCESSING' | 'RETURNS' | 'INVENTORY_CHECK' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  dueDate?: string;
  assignedToId?: string;
  clientId?: string;
  orderId?: string;
  returnId?: string;
}

export const dataApi = {
  // Products
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/data/products');
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

  // Inbounds
  async getInbounds(): Promise<Inbound[]> {
    const response = await api.get('/data/inbounds');
    return response.data.data;
  },

  async getInbound(id: string): Promise<Inbound> {
    const response = await api.get(`/data/inbounds/${id}`);
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
};
