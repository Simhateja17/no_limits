'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Tab type
type TabType = 'all' | 'booked_in' | 'partially_booked_in' | 'pending';

// User role type
type UserRole = 'CLIENT' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';

// Inbound interface
interface Inbound {
  id: string;
  inboundId: string;
  deliveryType: string;
  anouncedQty: number;
  noOfProducts: number;
  expectDate: string;
  status: 'booked_in' | 'partially_booked_in' | 'pending';
  client: string;
}

// Mock data matching reference image
const mockInbounds: Inbound[] = [
  { id: '1', inboundId: '23423', deliveryType: 'Freight forwarder', anouncedQty: 312, noOfProducts: 12, expectDate: '12.12.2020', status: 'booked_in', client: 'Papercrush' },
  { id: '2', inboundId: '43642', deliveryType: 'Freight forwarder', anouncedQty: 5, noOfProducts: 3, expectDate: '05.06.2021', status: 'booked_in', client: 'Papercrush' },
  { id: '3', inboundId: '34532', deliveryType: 'Freight forwarder', anouncedQty: 252, noOfProducts: 53, expectDate: '16.02.2025', status: 'booked_in', client: 'Caobali' },
  { id: '4', inboundId: '43462', deliveryType: 'Parcel service', anouncedQty: 0, noOfProducts: -10, expectDate: '30.05.2020', status: 'booked_in', client: 'Terppens' },
  { id: '5', inboundId: '34983', deliveryType: 'Parcel service', anouncedQty: 0, noOfProducts: 0, expectDate: '19.03.2021', status: 'booked_in', client: 'Terppens' },
  { id: '6', inboundId: '43895', deliveryType: 'Parcel service', anouncedQty: 16, noOfProducts: 1, expectDate: '28.05.2023', status: 'booked_in', client: 'Protabo' },
  { id: '7', inboundId: '12345', deliveryType: 'Freight forwarder', anouncedQty: 75, noOfProducts: 8, expectDate: '01.01.2024', status: 'pending', client: 'TestClient' },
  { id: '8', inboundId: '67890', deliveryType: 'Parcel service', anouncedQty: 120, noOfProducts: 15, expectDate: '15.04.2024', status: 'booked_in', client: 'Papercrush' },
  { id: '9', inboundId: '11111', deliveryType: 'Freight forwarder', anouncedQty: 100, noOfProducts: 20, expectDate: '20.06.2024', status: 'partially_booked_in', client: 'Caobali' },
  { id: '10', inboundId: '22222', deliveryType: 'Parcel service', anouncedQty: 200, noOfProducts: 25, expectDate: '10.07.2024', status: 'booked_in', client: 'Protabo' },
  { id: '11', inboundId: '33333', deliveryType: 'Freight forwarder', anouncedQty: 50, noOfProducts: 5, expectDate: '22.08.2024', status: 'booked_in', client: 'Papercrush' },
  { id: '12', inboundId: '44444', deliveryType: 'Parcel service', anouncedQty: 30, noOfProducts: 3, expectDate: '05.09.2024', status: 'booked_in', client: 'Terppens' },
  { id: '13', inboundId: '55555', deliveryType: 'Freight forwarder', anouncedQty: 80, noOfProducts: 10, expectDate: '18.10.2024', status: 'booked_in', client: 'Caobali' },
  { id: '14', inboundId: '66666', deliveryType: 'Parcel service', anouncedQty: 45, noOfProducts: 6, expectDate: '25.11.2024', status: 'booked_in', client: 'Protabo' },
  { id: '15', inboundId: '77777', deliveryType: 'Freight forwarder', anouncedQty: 90, noOfProducts: 12, expectDate: '03.12.2024', status: 'booked_in', client: 'Papercrush' },
  { id: '16', inboundId: '88888', deliveryType: 'Parcel service', anouncedQty: 25, noOfProducts: 4, expectDate: '14.01.2025', status: 'booked_in', client: 'Terppens' },
  { id: '17', inboundId: '99999', deliveryType: 'Freight forwarder', anouncedQty: 60, noOfProducts: 7, expectDate: '28.02.2025', status: 'booked_in', client: 'Caobali' },
  { id: '18', inboundId: '10101', deliveryType: 'Parcel service', anouncedQty: 35, noOfProducts: 5, expectDate: '10.03.2025', status: 'booked_in', client: 'Protabo' },
  { id: '19', inboundId: '20202', deliveryType: 'Freight forwarder', anouncedQty: 70, noOfProducts: 9, expectDate: '22.04.2025', status: 'booked_in', client: 'Papercrush' },
  { id: '20', inboundId: '30303', deliveryType: 'Parcel service', anouncedQty: 40, noOfProducts: 6, expectDate: '05.05.2025', status: 'booked_in', client: 'Terppens' },
];

// Customers for filter (for warehouse users - excluding 'All' which will be added dynamically)
const customers = ['Papercrush', 'Caobali', 'Terppens', 'Protabo', 'TestClient'];

// Freight forwarders for filter (for client view - excluding 'All' which will be added dynamically)
const freightForwarders = ['Freight forwarder', 'Parcel service'];

interface InboundsTableProps {
  showClientColumn: boolean;
  baseUrl: string;
  userRole: UserRole;
}

export function InboundsTable({ showClientColumn, baseUrl, userRole }: InboundsTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const t = useTranslations('inbounds');
  const tCommon = useTranslations('common');

  // Determine if this is a client view
  const isClientView = userRole === 'CLIENT';
  
  // Get filter options based on role
  const filterOptions = isClientView ? freightForwarders : customers;
  const filterLabel = isClientView ? t('filterByFreightForwarder') : t('filterByCustomer');

  const handleInboundClick = (inboundId: string) => {
    router.push(`${baseUrl}/${inboundId}`);
  };

  // Filter inbounds based on tab and search
  const filteredInbounds = useMemo(() => {
    let inbounds = [...mockInbounds];

    // Filter by tab
    if (activeTab === 'booked_in') {
      inbounds = inbounds.filter(i => i.status === 'booked_in');
    } else if (activeTab === 'partially_booked_in') {
      inbounds = inbounds.filter(i => i.status === 'partially_booked_in');
    } else if (activeTab === 'pending') {
      inbounds = inbounds.filter(i => i.status === 'pending');
    }

    // Filter by selected value
    if (filterValue !== 'ALL') {
      if (isClientView) {
        // Filter by delivery type for clients
        inbounds = inbounds.filter(i => i.deliveryType === filterValue);
      } else {
        // Filter by customer for warehouse users
        inbounds = inbounds.filter(i => i.client === filterValue);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      inbounds = inbounds.filter(i =>
        i.inboundId.toLowerCase().includes(query) ||
        i.deliveryType.toLowerCase().includes(query) ||
        i.client.toLowerCase().includes(query)
      );
    }

    return inbounds;
  }, [activeTab, searchQuery, filterValue, isClientView]);

  // Pagination
  const totalPages = Math.ceil(filteredInbounds.length / itemsPerPage);
  const paginatedInbounds = filteredInbounds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count for tabs
  const allCount = mockInbounds.length;
  const bookedInCount = mockInbounds.filter(i => i.status === 'booked_in').length;
  const partiallyBookedInCount = mockInbounds.filter(i => i.status === 'partially_booked_in').length;
  const pendingCount = mockInbounds.filter(i => i.status === 'pending').length;

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

  // Base width for proportional calculations (1358px reference)
  // Using clamp for proportional sizing

  return (
    <div className="w-full flex flex-col" style={{ gap: 'clamp(16px, 1.76vw, 24px)' }}>
      {/* Header with Tabs and Create Button */}
      <div className="flex flex-col w-full">
        <div className="flex items-end justify-between w-full">
          {/* Tabs */}
          <div
            className="flex items-end"
            style={{
              gap: 'clamp(16px, 1.76vw, 24px)',
            }}
          >
            {/* All Inbounds Tab */}
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className="flex items-center"
              style={{
                gap: 'clamp(4px, 0.59vw, 8px)',
                paddingBottom: 'clamp(8px, 0.88vw, 12px)',
                borderBottom: activeTab === 'all' ? '2px solid #003450' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: activeTab === 'all' ? '#003450' : '#6B7280',
                }}
              >
                {t('allInbounds')}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 0.88vw, 12px)',
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

            {/* Booked in Tab */}
            <button
              onClick={() => { setActiveTab('booked_in'); setCurrentPage(1); }}
              className="flex items-center"
              style={{
                gap: 'clamp(4px, 0.59vw, 8px)',
                paddingBottom: 'clamp(8px, 0.88vw, 12px)',
                borderBottom: activeTab === 'booked_in' ? '2px solid #003450' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: activeTab === 'booked_in' ? '#003450' : '#6B7280',
                }}
              >
                {t('bookedIn')}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 0.88vw, 12px)',
                  lineHeight: '16px',
                  color: activeTab === 'booked_in' ? '#003450' : '#6B7280',
                  backgroundColor: activeTab === 'booked_in' ? '#E5E7EB' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {bookedInCount}
              </span>
            </button>

            {/* Partially booked in Tab */}
            <button
              onClick={() => { setActiveTab('partially_booked_in'); setCurrentPage(1); }}
              className="flex items-center"
              style={{
                gap: 'clamp(4px, 0.59vw, 8px)',
                paddingBottom: 'clamp(8px, 0.88vw, 12px)',
                borderBottom: activeTab === 'partially_booked_in' ? '2px solid #003450' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: activeTab === 'partially_booked_in' ? '#003450' : '#6B7280',
                }}
              >
                {t('partiallyBookedIn')}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 0.88vw, 12px)',
                  lineHeight: '16px',
                  color: activeTab === 'partially_booked_in' ? '#003450' : '#6B7280',
                  backgroundColor: activeTab === 'partially_booked_in' ? '#E5E7EB' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {partiallyBookedInCount}
              </span>
            </button>

            {/* Pending Tab */}
            <button
              onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
              className="flex items-center"
              style={{
                gap: 'clamp(4px, 0.59vw, 8px)',
                paddingBottom: 'clamp(8px, 0.88vw, 12px)',
                borderBottom: activeTab === 'pending' ? '2px solid #003450' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: activeTab === 'pending' ? '#003450' : '#6B7280',
                }}
              >
                {t('pending')}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 0.88vw, 12px)',
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
          </div>

          {/* Create Inbound Button - 138x38 at 1358px, proportional */}
          <button
            onClick={() => router.push(`${baseUrl}/create`)}
            style={{
              height: 'clamp(32px, 2.8vw, 38px)',
              borderRadius: '6px',
              paddingTop: 'clamp(7px, 0.66vw, 9px)',
              paddingRight: 'clamp(13px, 1.25vw, 17px)',
              paddingBottom: 'clamp(7px, 0.66vw, 9px)',
              paddingLeft: 'clamp(13px, 1.25vw, 17px)',
              backgroundColor: '#003450',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              whiteSpace: 'nowrap',
              marginBottom: 'clamp(8px, 0.88vw, 12px)',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              {t('createInbound')}
            </span>
          </button>
        </div>

        {/* Full-width horizontal line below tabs - 1216px width at 1358px screen = 89.5% */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#E5E7EB',
          }}
        />
      </div>

      {/* Filter and Search Row */}
      <div className="flex items-end flex-wrap" style={{ gap: 'clamp(16px, 1.76vw, 24px)' }}>
        {/* Filter */}
        <div className="flex flex-col" style={{ gap: 'clamp(4px, 0.59vw, 8px)' }}>
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1.03vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {filterLabel}
          </label>
          <div className="relative">
            <select
              value={filterValue}
              onChange={(e) => { setFilterValue(e.target.value); setCurrentPage(1); }}
              style={{
                width: 'clamp(260px, 23.56vw, 320px)',
                maxWidth: '100%',
                height: 'clamp(32px, 2.8vw, 38px)',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
                paddingRight: 'clamp(28px, 2.36vw, 32px)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option key="ALL" value="ALL">
                {tCommon('all')}
              </option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div
              style={{
                position: 'absolute',
                right: 'clamp(10px, 0.96vw, 13px)',
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
        <div className="flex flex-col" style={{ gap: 'clamp(4px, 0.59vw, 8px)' }}>
          <label
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1.03vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          >
            {tCommon('search')}
          </label>
          <input
            type="text"
            placeholder=""
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: 'clamp(180px, 17.67vw, 240px)',
              maxWidth: '100%',
              height: 'clamp(32px, 2.8vw, 38px)',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: 'clamp(7px, 0.66vw, 9px) clamp(10px, 0.96vw, 13px)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(12px, 1.03vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
            }}
          />
        </div>
      </div>

      {/* Inbounds Table */}
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
              ? 'minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(90px, 1fr)'
              : 'minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(110px, 1fr) minmax(100px, 1fr)',
            padding: 'clamp(10px, 0.88vw, 12px) clamp(16px, 1.76vw, 24px)',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            {t('inboundId')}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            {t('deliveryType')}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            {t('announcedQty')}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            {t('numberOfProducts')}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            {t('expectedDate')}
          </span>
          {showClientColumn && (
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(10px, 0.88vw, 12px)',
                lineHeight: '16px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#6B7280',
              }}
            >
              {t('client')}
            </span>
          )}
        </div>

        {/* Table Body */}
        {paginatedInbounds.map((inbound, index) => (
          <div
            key={inbound.id}
            className="grid"
            onClick={() => handleInboundClick(inbound.inboundId)}
            style={{
              gridTemplateColumns: showClientColumn
                ? 'minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(110px, 1fr) minmax(100px, 1fr) minmax(90px, 1fr)'
                : 'minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(110px, 1fr) minmax(100px, 1fr)',
              padding: 'clamp(12px, 1.18vw, 16px) clamp(16px, 1.76vw, 24px)',
              borderBottom: index < paginatedInbounds.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
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
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              {inbound.inboundId}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              {inbound.deliveryType}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {inbound.anouncedQty}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {inbound.noOfProducts}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              {inbound.expectDate}
            </span>
            {showClientColumn && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#6B7280',
                }}
              >
                {inbound.client}
              </span>
            )}
          </div>
        ))}

        {/* Empty State */}
        {paginatedInbounds.length === 0 && (
          <div
            style={{
              padding: 'clamp(32px, 3.53vw, 48px) clamp(16px, 1.76vw, 24px)',
              textAlign: 'center',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(12px, 1.03vw, 14px)',
            }}
          >
            {t('noInboundsFound')}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: 'clamp(8px, 0.88vw, 12px)',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(12px, 1.03vw, 14px)',
            lineHeight: '20px',
            color: '#374151',
          }}
        >
          Showing <span style={{ fontWeight: 500 }}>{filteredInbounds.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span style={{ fontWeight: 500 }}>{Math.min(currentPage * itemsPerPage, filteredInbounds.length)}</span> of{' '}
          <span style={{ fontWeight: 500 }}>{filteredInbounds.length}</span> results
        </span>

        <div className="flex items-center" style={{ gap: 'clamp(8px, 0.88vw, 12px)' }}>
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            style={{
              minWidth: 'clamp(76px, 6.77vw, 92px)',
              height: 'clamp(32px, 2.8vw, 38px)',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
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
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {tCommon('previous')}
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            style={{
              minWidth: 'clamp(76px, 6.77vw, 92px)',
              height: 'clamp(32px, 2.8vw, 38px)',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
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
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              {tCommon('next')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
