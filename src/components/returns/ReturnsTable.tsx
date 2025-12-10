'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Tab type for returns
type ReturnTabType = 'all' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

// Return status type
type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

// Return interface
interface Return {
  id: string;
  returnId: string;
  returnDate: Date;
  client: string;
  orderId: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
}

// Mock data
const mockReturns: Return[] = [
  { id: '1', returnId: '24234', returnDate: new Date(), client: 'Papercrush', orderId: '24234', quantity: 3, reason: 'Damaged', status: 'pending' },
  { id: '2', returnId: '24076', returnDate: new Date(Date.now() - 5 * 60 * 60 * 1000), client: 'Papercrush', orderId: '24076', quantity: 3, reason: 'Wrong Item', status: 'approved' },
  { id: '3', returnId: '23974', returnDate: new Date(Date.now() - 24 * 60 * 60 * 1000), client: 'Caobali', orderId: '23974', quantity: 1, reason: 'Defective', status: 'processing' },
  { id: '4', returnId: '22421', returnDate: new Date('2022-05-16'), client: 'Terppens', orderId: '22421', quantity: 2, reason: 'Not as Described', status: 'completed' },
  { id: '5', returnId: '22122', returnDate: new Date('2022-05-15'), client: 'Terppens', orderId: '22122', quantity: 2, reason: 'Damaged', status: 'rejected' },
  { id: '6', returnId: '22063', returnDate: new Date('2022-05-15'), client: 'Protabo', orderId: '22063', quantity: 5, reason: 'Wrong Item', status: 'pending' },
  { id: '7', returnId: '24235', returnDate: new Date(), client: 'Merchant 3', orderId: '24235', quantity: 3, reason: 'Defective', status: 'approved' },
  { id: '8', returnId: '24077', returnDate: new Date(Date.now() - 5 * 60 * 60 * 1000), client: 'Merchant 5', orderId: '24077', quantity: 3, reason: 'Damaged', status: 'processing' },
  { id: '9', returnId: '23975', returnDate: new Date(Date.now() - 24 * 60 * 60 * 1000), client: 'Merchant 7', orderId: '23975', quantity: 1, reason: 'Not as Described', status: 'completed' },
  { id: '10', returnId: '22422', returnDate: new Date('2022-05-16'), client: 'Merchant 5', orderId: '22422', quantity: 2, reason: 'Wrong Item', status: 'pending' },
  { id: '11', returnId: '22123', returnDate: new Date('2022-05-15'), client: 'Merchant 5', orderId: '22123', quantity: 2, reason: 'Damaged', status: 'approved' },
  { id: '12', returnId: '22064', returnDate: new Date('2022-05-15'), client: 'Merchant 5', orderId: '22064', quantity: 5, reason: 'Defective', status: 'rejected' },
];

// Customers for filter
const customers = ['Alle', 'Papercrush', 'Caobali', 'Terppens', 'Protabo', 'Merchant 3', 'Merchant 5', 'Merchant 7'];

interface ReturnsTableProps {
  showClientColumn: boolean;
  basePath?: string;
}

// Format date for display
const formatReturnDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const returnDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  if (returnDay.getTime() === today.getTime()) {
    return `Heute, ${timeStr}`;
  } else if (returnDay.getTime() === yesterday.getTime()) {
    return `Gestern, ${timeStr}`;
  } else {
    const dayOfWeek = date.toLocaleDateString('de-DE', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${dayOfWeek}, ${dateStr}`;
  }
};

// Status tag component
const StatusTag = ({ status }: { status: ReturnStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          dotColor: '#F59E0B',
        };
      case 'approved':
        return {
          label: 'Approved',
          dotColor: '#22C55E',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          dotColor: '#EF4444',
        };
      case 'processing':
        return {
          label: 'Processing',
          dotColor: '#3B82F6',
        };
      case 'completed':
        return {
          label: 'Completed',
          dotColor: '#6B7280',
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

export function ReturnsTable({ showClientColumn, basePath = '/admin/returns' }: ReturnsTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ReturnTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('Alle');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle return row click
  const handleReturnClick = (returnId: string) => {
    router.push(`${basePath}/${returnId}`);
  };

  // Filter returns based on tab and search
  const filteredReturns = useMemo(() => {
    let returns = [...mockReturns];

    // Filter by tab
    if (activeTab === 'pending') {
      returns = returns.filter(r => r.status === 'pending');
    } else if (activeTab === 'approved') {
      returns = returns.filter(r => r.status === 'approved');
    } else if (activeTab === 'rejected') {
      returns = returns.filter(r => r.status === 'rejected');
    } else if (activeTab === 'processing') {
      returns = returns.filter(r => r.status === 'processing');
    } else if (activeTab === 'completed') {
      returns = returns.filter(r => r.status === 'completed');
    }

    // Filter by customer
    if (customerFilter !== 'Alle') {
      returns = returns.filter(r => r.client === customerFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      returns = returns.filter(r =>
        r.returnId.toLowerCase().includes(query) ||
        r.client.toLowerCase().includes(query) ||
        r.orderId.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query)
      );
    }

    // Sort by date descending
    returns.sort((a, b) => b.returnDate.getTime() - a.returnDate.getTime());

    return returns;
  }, [activeTab, searchQuery, customerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count for tabs
  const allCount = mockReturns.length;
  const pendingCount = mockReturns.filter(r => r.status === 'pending').length;
  const approvedCount = mockReturns.filter(r => r.status === 'approved').length;
  const rejectedCount = mockReturns.filter(r => r.status === 'rejected').length;
  const processingCount = mockReturns.filter(r => r.status === 'processing').length;
  const completedCount = mockReturns.filter(r => r.status === 'completed').length;

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
      {/* Header with Tabs */}
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
          {/* All Returns Tab */}
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
              All Returns
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

          {/* Pending Tab */}
          <button
            onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'pending' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'pending' ? '#003450' : '#6B7280',
              }}
            >
              Pending
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'pending' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'pending' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {pendingCount}
            </span>
          </button>

          {/* Approved Tab */}
          <button
            onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'approved' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'approved' ? '#003450' : '#6B7280',
              }}
            >
              Approved
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'approved' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'approved' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {approvedCount}
            </span>
          </button>

          {/* Rejected Tab */}
          <button
            onClick={() => { setActiveTab('rejected'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'rejected' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'rejected' ? '#003450' : '#6B7280',
              }}
            >
              Rejected
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'rejected' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'rejected' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {rejectedCount}
            </span>
          </button>

          {/* Processing Tab */}
          <button
            onClick={() => { setActiveTab('processing'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'processing' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'processing' ? '#003450' : '#6B7280',
              }}
            >
              Processing
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'processing' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'processing' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {processingCount}
            </span>
          </button>

          {/* Completed Tab */}
          <button
            onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
            className="flex items-center"
            style={{
              height: '36px',
              gap: '8px',
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingBottom: '16px',
              marginLeft: 'clamp(12px, 1.8vw, 24px)',
              borderBottom: activeTab === 'completed' ? '2px solid #003450' : '2px solid transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1vw, 14px)',
                lineHeight: '20px',
                color: activeTab === 'completed' ? '#003450' : '#6B7280',
              }}
            >
              Completed
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.9vw, 12px)',
                lineHeight: '16px',
                color: activeTab === 'completed' ? '#003450' : '#6B7280',
                backgroundColor: activeTab === 'completed' ? '#E5E7EB' : 'transparent',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex items-end gap-6 flex-wrap">
        {/* Filter by Customer */}
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

      {/* Returns Table */}
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
              ? 'minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 1fr)'
              : 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 1fr)',
            padding: 'clamp(8px, 0.9vw, 12px) clamp(12px, 1.8vw, 24px)',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
          }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Return Date
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Return-ID
          </span>
          {showClientColumn && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
              Client
            </span>
          )}
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Order-ID
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Qty
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Reason
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(10px, 0.9vw, 12px)', lineHeight: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' }}>
            Status
          </span>
        </div>

        {/* Table Body */}
        {paginatedReturns.map((returnItem, index) => (
          <div
            key={returnItem.id}
            className="grid items-center"
            style={{
              gridTemplateColumns: showClientColumn
                ? 'minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 1fr)'
                : 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 1fr)',
              padding: 'clamp(12px, 1.2vw, 16px) clamp(12px, 1.8vw, 24px)',
              borderBottom: index < paginatedReturns.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onClick={() => handleReturnClick(returnItem.returnId)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#111827' }}>
              {formatReturnDate(returnItem.returnDate)}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#111827' }}>
              #{returnItem.returnId}
            </span>
            {showClientColumn && (
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#6B7280' }}>
                {returnItem.client}
              </span>
            )}
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#6B7280' }}>
              #{returnItem.orderId}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#6B7280' }}>
              {returnItem.quantity}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#6B7280' }}>
              {returnItem.reason}
            </span>
            <div className="flex items-center justify-start">
              <StatusTag status={returnItem.status} />
            </div>
          </div>
        ))}

        {/* Empty State */}
        {paginatedReturns.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(12px, 1vw, 14px)' }}>
            No returns found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ minHeight: '63px', paddingTop: '12px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#374151' }}>
          Showing <span style={{ fontWeight: 500 }}>{filteredReturns.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span style={{ fontWeight: 500 }}>{Math.min(currentPage * itemsPerPage, filteredReturns.length)}</span> of{' '}
          <span style={{ fontWeight: 500 }}>{filteredReturns.length}</span> results
        </span>

        <div className="flex items-center gap-3">
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
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#374151' }}>
              Previous
            </span>
          </button>

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
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '20px', color: '#374151' }}>
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
