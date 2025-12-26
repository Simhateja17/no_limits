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

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await api.get('/data/orders');
    return response.data.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/data/orders/${id}`);
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
};
