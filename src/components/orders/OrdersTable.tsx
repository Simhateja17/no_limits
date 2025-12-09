'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Tab type for orders
type OrderTabType = 'all' | 'inStock' | 'outOfStock' | 'errors' | 'cancelled' | 'sent';

// Order status type
type OrderStatus = 'success' | 'error' | 'mildError';

// Order interface
interface Order {
  id: string;
  orderId: string;
  orderDate: Date;
  client: string;
  weight: string;
  quantity: number;
  method: string;
  status: OrderStatus;
}

// Mock data
const mockOrders: Order[] = [
  { id: '1', orderId: '24234', orderDate: new Date(), client: 'Papercrush', weight: '0,35 kg', quantity: 3, method: 'Brief National', status: 'success' },
  { id: '2', orderId: '24076', orderDate: new Date(Date.now() - 5 * 60 * 60 * 1000), client: 'Papercrush', weight: '0,35 kg', quantity: 3, method: 'Brief National', status: 'success' },
  { id: '3', orderId: '23974', orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), client: 'Caobali', weight: '0,95 kg', quantity: 1, method: 'DHL Paket', status: 'success' },
  { id: '4', orderId: '22421', orderDate: new Date('2022-05-16'), client: 'Terppens', weight: '0,55 kg', quantity: 2, method: 'DHL Paket', status: 'success' },
  { id: '5', orderId: '22122', orderDate: new Date('2022-05-15'), client: 'Terppens', weight: '0,55 kg', quantity: 2, method: 'DHL Paket', status: 'success' },
  { id: '6', orderId: '22063', orderDate: new Date('2022-05-15'), client: 'Protabo', weight: '3,25 kg', quantity: 5, method: 'DHL Paket', status: 'success' },
  { id: '7', orderId: '24235', orderDate: new Date(), client: 'Merchant 3', weight: '0,35 kg', quantity: 3, method: 'Brief National', status: 'error' },
  { id: '8', orderId: '24077', orderDate: new Date(Date.now() - 5 * 60 * 60 * 1000), client: 'Merchant 5', weight: '0,35 kg', quantity: 3, method: 'Brief National', status: 'error' },
  { id: '9', orderId: '23975', orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), client: 'Merchant 7', weight: '0,95 kg', quantity: 1, method: 'DHL Paket', status: 'mildError' },
  { id: '10', orderId: '22422', orderDate: new Date('2022-05-16'), client: 'Merchant 5', weight: '0,55 kg', quantity: 2, method: 'DHL Paket', status: 'mildError' },
  { id: '11', orderId: '22123', orderDate: new Date('2022-05-15'), client: 'Merchant 5', weight: '0,55 kg', quantity: 2, method: 'DHL Paket', status: 'mildError' },
  { id: '12', orderId: '22064', orderDate: new Date('2022-05-15'), client: 'Merchant 5', weight: '3,25 kg', quantity: 5, method: 'DHL Paket', status: 'mildError' },
  // Additional mock data for counts
  { id: '13', orderId: '21001', orderDate: new Date('2022-04-10'), client: 'Papercrush', weight: '1,2 kg', quantity: 4, method: 'DHL Paket', status: 'success' },
  { id: '14', orderId: '21002', orderDate: new Date('2022-04-11'), client: 'Caobali', weight: '0,8 kg', quantity: 2, method: 'Brief National', status: 'success' },
  { id: '15', orderId: '21003', orderDate: new Date('2022-04-12'), client: 'Terppens', weight: '2,1 kg', quantity: 6, method: 'DHL Paket', status: 'success' },
  { id: '16', orderId: '21004', orderDate: new Date('2022-04-13'), client: 'Protabo', weight: '0,45 kg', quantity: 1, method: 'Brief National', status: 'success' },
  { id: '17', orderId: '21005', orderDate: new Date('2022-04-14'), client: 'Merchant 3', weight: '1,5 kg', quantity: 3, method: 'DHL Paket', status: 'mildError' },
  { id: '18', orderId: '21006', orderDate: new Date('2022-04-15'), client: 'Merchant 5', weight: '0,9 kg', quantity: 2, method: 'DHL Paket', status: 'success' },
  { id: '19', orderId: '21007', orderDate: new Date('2022-04-16'), client: 'Papercrush', weight: '0,6 kg', quantity: 2, method: 'Brief National', status: 'success' },
  { id: '20', orderId: '21008', orderDate: new Date('2022-04-17'), client: 'Caobali', weight: '1,8 kg', quantity: 4, method: 'DHL Paket', status: 'success' },
];

// Customers for filter
const customers = ['Alle', 'Papercrush', 'Caobali', 'Terppens', 'Protabo', 'Merchant 3', 'Merchant 5', 'Merchant 7'];

interface OrdersTableProps {
  showClientColumn: boolean; // Show client column only for superadmin and warehouse labor view
  basePath?: string; // Base path for navigation (e.g., '/admin/orders' or '/employee/orders')
}

// Format date for display
const formatOrderDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const orderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  if (orderDay.getTime() === today.getTime()) {
    return `Heute, ${timeStr}`;
  } else if (orderDay.getTime() === yesterday.getTime()) {
    return `Gestern, ${timeStr}`;
  } else {
    const dayOfWeek = date.toLocaleDateString('de-DE', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${dayOfWeek}, ${dateStr}`;
  }
};

// Status tag component
const StatusTag = ({ status }: { status: OrderStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          label: 'Processing',
          dotColor: '#22C55E',
        };
      case 'error':
        return {
          label: 'Cancelled',
          dotColor: '#EF4444',
        };
      case 'mildError':
        return {
          label: 'Issue',
          dotColor: '#F59E0B',
        };
      default:
        return {
          label: 'Unknown',
          dotColor: '#6B7280',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '9999px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#111827',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
        }}
      />
      {config.label}
    </span>
  );
};

export function OrdersTable({ showClientColumn, basePath = '/admin/orders' }: OrdersTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('Alle');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle order row click - navigate to order detail page
  const handleOrderClick = (orderId: string) => {
    router.push(`${basePath}/${orderId}`);
  };

  // Filter orders based on tab and search
  const filteredOrders = useMemo(() => {
    let orders = [...mockOrders];

    // Filter by tab
    if (activeTab === 'inStock') {
      orders = orders.filter(o => o.status === 'success');
    } else if (activeTab === 'outOfStock') {
      orders = orders.filter(o => o.status === 'mildError');
    } else if (activeTab === 'errors') {
      orders = orders.filter(o => o.status === 'error');
    } else if (activeTab === 'cancelled') {
      // For now, no cancelled orders in mock data
      orders = [];
    } else if (activeTab === 'sent') {
      // For now, filter sent as success
      orders = orders.filter(o => o.status === 'success');
    }

    // Filter by customer
    if (customerFilter !== 'Alle') {
      orders = orders.filter(o => o.client === customerFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(query) ||
        o.client.toLowerCase().includes(query) ||
        o.method.toLowerCase().includes(query)
      );
    }

    // Sort by date descending (newest first)
    orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    return orders;
  }, [activeTab, searchQuery, customerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count for tabs
  const allCount = mockOrders.length;
  const inStockCount = mockOrders.filter(o => o.status === 'success').length;
  const outOfStockCount = mockOrders.filter(o => o.status === 'mildError').length;
  const errorsCount = mockOrders.filter(o => o.status === 'error').length;
  // cancelledCount and sentCount not shown in tabs currently

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header with Tabs and Create Button */}
      <div className="flex items-center justify-between w-full flex-wrap gap-4">
        {/* Tabs */}
        <div
          className="flex items-center flex-wrap"
          style={{
            height: 'auto',
            minHeight: '38px',
            gap: '0',
          }}
        >
          {/* All Orders Tab */}
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              borderBottom: activeTab === 'all' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'all' ? '#003450' : '#6B7280',
              }}
            >
              All Orders
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'all' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'all' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {allCount}
            </span>
          </button>

          {/* In Stock Tab */}
          <button
            onClick={() => { setActiveTab('inStock'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'inStock' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'inStock' ? '#003450' : '#6B7280',
              }}
            >
              In Stock
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'inStock' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'inStock' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {inStockCount}
            </span>
          </button>

          {/* Out of Stock Tab */}
          <button
            onClick={() => { setActiveTab('outOfStock'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'outOfStock' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'outOfStock' ? '#003450' : '#6B7280',
              }}
            >
              Out of Stock
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'outOfStock' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'outOfStock' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {outOfStockCount}
            </span>
          </button>

          {/* Errors Tab */}
          <button
            onClick={() => { setActiveTab('errors'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'errors' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'errors' ? '#003450' : '#6B7280',
              }}
            >
              Errors
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'errors' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'errors' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {errorsCount}
            </span>
          </button>

          {/* Cancelled Tab */}
          <button
            onClick={() => { setActiveTab('cancelled'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'cancelled' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'cancelled' ? '#003450' : '#6B7280',
              }}
            >
              Cancelled
            </span>
          </button>

          {/* Sent Tab */}
          <button
            onClick={() => { setActiveTab('sent'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'sent' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'sent' ? '#003450' : '#6B7280',
              }}
            >
              Sent
            </span>
          </button>
        </div>

        {/* Create Order Button */}
        <button
          style={{
            minWidth: '120px',
            height: '38px',
            borderRadius: '6px',
            padding: '9px 17px',
            backgroundColor: '#003450',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Create order
          </span>
        </button>
      </div>

      {/* Filter and Search Row */}
      <div className="flex items-end gap-6 flex-wrap">
        {/* Filter by Customer (for admin/employee) or Channels (for client) */}
        <div className="flex flex-col gap-2">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {showClientColumn ? 'Filter by Customer' : 'Channels'}
          </label>
          <div className="relative">
            <select
              value={customerFilter}
              onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: 'clamp(200px, 23.5vw, 320px)',
                maxWidth: '100%',
                height: '38px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: '9px 13px',
                paddingRight: '32px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              {customers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div
              style={{
                position: 'absolute',
                right: '13px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2">
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            Search
          </label>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: 'clamp(200px, 23.5vw, 320px)',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 13px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: showClientColumn
              ? 'minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(60px, 0.8fr)'
              : 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(60px, 0.8fr)',
            padding: 'clamp(8px, 0.9vw, 12px) clamp(12px, 1.8vw, 24px)',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Order Date
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Order-ID
          </span>
          {showClientColumn && (
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#6B7280',
              }}
            >
              Client
            </span>
          )}
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Weight
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Qty
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Method
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.9vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Status
          </span>
        </div>

        {/* Table Body */}
        {paginatedOrders.map((order, index) => (
          <div
            key={order.id}
            className="grid items-center"
            style={{
              gridTemplateColumns: showClientColumn
                ? 'minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(60px, 0.8fr)'
                : 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(60px, 0.8fr)',
              padding: 'clamp(12px, 1.2vw, 16px) clamp(12px, 1.8vw, 24px)',
              borderBottom: index < paginatedOrders.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onClick={() => handleOrderClick(order.orderId)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              {formatOrderDate(order.orderDate)}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              #{order.orderId}
            </span>
            {showClientColumn && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(12px, 1vw, 14px)',
                  lineHeight: '20px',
                  color: '#6B7280',
                }}
              >
                {order.client}
              </span>
            )}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {order.weight}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {order.quantity}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {order.method}
            </span>
            <div className="flex items-center justify-start">
              <StatusTag status={order.status} />
            </div>
          </div>
        ))}

        {/* Empty State */}
        {paginatedOrders.length === 0 && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(12px, 1vw, 14px)',
            }}
          >
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between flex-wrap gap-4"
        style={{
          minHeight: '63px',
          paddingTop: '12px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(12px, 1vw, 14px)',
            lineHeight: '20px',
            color: '#374151',
          }}
        >
          Showing <span style={{ fontWeight: 500 }}>{filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span style={{ fontWeight: 500 }}>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
          <span style={{ fontWeight: 500 }}>{filteredOrders.length}</span> results
        </span>

        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            style={{
              minWidth: '92px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 17px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Previous
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            style={{
              minWidth: '92px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: '9px 17px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
