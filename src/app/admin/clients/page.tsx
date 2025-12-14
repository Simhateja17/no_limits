'use client';

import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock client data - for demonstration
interface Client {
  id: string;
  clientId: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalValue: string;
  lastOrder: Date;
  lastBillingPeriod: string;
  status: 'active' | 'inactive';
  billingStatus: 'paid' | 'unpaid';
  systemLogin: string;
  emailAction: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    clientId: 1,
    name: 'Max Schmidt',
    email: 'max.schmidt@papercrush.de',
    company: 'Hatstore24',
    phone: '+49 30 12345678',
    address: 'Berliner Str. 123, 10115 Berlin',
    totalOrders: 24,
    totalValue: '€12,450.00',
    lastOrder: new Date('2024-12-10'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'unpaid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  },
  {
    id: '2',
    clientId: 2,
    name: 'Sarah Mueller',
    email: 'sarah@caobali.com',
    company: 'Dogsupplys',
    phone: '+49 40 87654321',
    address: 'Hafenstr. 456, 20459 Hamburg',
    totalOrders: 18,
    totalValue: '€8,920.00',
    lastOrder: new Date('2024-12-08'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'paid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  },
  {
    id: '3',
    clientId: 3,
    name: 'Thomas Weber',
    email: 'thomas@terppens.de',
    company: 'Womenfashion',
    phone: '+49 89 11223344',
    address: 'Maximilianstr. 789, 80539 München',
    totalOrders: 12,
    totalValue: '€5,670.00',
    lastOrder: new Date('2024-11-25'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'paid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  },
  {
    id: '4',
    clientId: 4,
    name: 'Anna Johnson',
    email: 'anna@lighthouse.com',
    company: 'Lighthousestore',
    phone: '+49 30 55667788',
    address: 'Friedrichstr. 456, 10117 Berlin',
    totalOrders: 35,
    totalValue: '€18,320.00',
    lastOrder: new Date('2024-12-12'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'paid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  },
  {
    id: '5',
    clientId: 5,
    name: 'Mike Brown',
    email: 'mike@sunglasses.com',
    company: 'Sunglassesdoor',
    phone: '+49 40 99887766',
    address: 'Reeperbahn 123, 20359 Hamburg',
    totalOrders: 28,
    totalValue: '€14,750.00',
    lastOrder: new Date('2024-12-11'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'paid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  },
  {
    id: '6',
    clientId: 6,
    name: 'Lisa Garcia',
    email: 'lisa@foodexpress.com',
    company: 'Foodexpress',
    phone: '+49 69 44556677',
    address: 'Zeil 789, 60313 Frankfurt',
    totalOrders: 42,
    totalValue: '€22,890.00',
    lastOrder: new Date('2024-12-09'),
    lastBillingPeriod: '01.10.2025 - 30.10.2025',
    status: 'active',
    billingStatus: 'paid',
    systemLogin: 'Login',
    emailAction: 'Mailservice'
  }
];

// Empty state component
const EmptyState = ({ onCreateClient, onCreateQuotation }: { onCreateClient: () => void, onCreateQuotation: () => void }) => (
  <div 
    className="flex flex-col items-center justify-center w-full"
    style={{
      minHeight: 'clamp(300px, 29.4vw, 400px)',
      padding: 'clamp(32px, 3.53vw, 48px) clamp(16px, 1.76vw, 24px)',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
    }}
  >
    <div 
      style={{
        width: 'clamp(48px, 4.12vw, 56px)',
        height: 'clamp(48px, 4.12vw, 56px)',
        borderRadius: '50%',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'clamp(12px, 1.18vw, 16px)',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <h3 
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 'clamp(12px, 1.03vw, 14px)',
        lineHeight: '20px',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 'clamp(6px, 0.59vw, 8px)',
      }}
    >
      No Clients
    </h3>
    <p 
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 'clamp(12px, 1.03vw, 14px)',
        lineHeight: '20px',
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '400px',
      }}
    >
      Get started by creating your first client or quotation.
    </p>
  </div>
);

export default function AdminClientsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'quotations'>('all');
  
  // For demonstration - toggle this to show empty state
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const handleBack = () => {
    router.push('/admin/dashboard');
  };

  const handleCreateQuotation = () => {
    router.push('/admin/clients/create-quotation');
  };

  const handleCreateClient = () => {
    router.push('/admin/clients/create');
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/admin/clients/${clientId}`);
  };

  // Filter clients based on active tab
  const filteredClients = mockClients.filter(client => {
    if (activeTab === 'active') return client.status === 'active';
    if (activeTab === 'inactive') return client.status === 'inactive';
    if (activeTab === 'quotations') return false; // No quotations in mock data
    return true; // 'all' tab
  });

  // Count clients by status
  const allClientsCount = mockClients.length;
  const activeClientsCount = mockClients.filter(c => c.status === 'active').length;
  const inactiveClientsCount = mockClients.filter(c => c.status === 'inactive').length;
  const quotationsCount = 16; // Mock count

  // Display clients or empty state
  const displayClients = showEmptyState ? [] : filteredClients;

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="w-full px-[5.2%] py-8">
          {/* Back Button */}
          <div style={{ marginBottom: 'clamp(12px, 1.18vw, 16px)' }}>
            <button
              onClick={handleBack}
              style={{
                height: 'clamp(32px, 2.8vw, 38px)',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: '9px 15px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(12px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Back
            </button>
          </div>

          {/* Header and Actions */}
          <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(16px, 1.76vw, 24px)' }}>
            <h1
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(20px, 2.35vw, 32px)',
                lineHeight: 'clamp(28px, 3.52vw, 48px)',
                color: '#111827',
              }}
            >
              Clients
            </h1>
            <div className="flex items-center" style={{ gap: 'clamp(8px, 0.88vw, 12px)' }}>
              <button
                onClick={handleCreateQuotation}
                style={{
                  height: 'clamp(32px, 2.8vw, 38px)',
                  borderRadius: '6px',
                  padding: '9px 17px',
                  backgroundColor: '#003450',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                Create Quotation
              </button>
              <button
                onClick={handleCreateClient}
                style={{
                  height: 'clamp(32px, 2.8vw, 38px)',
                  borderRadius: '6px',
                  padding: '9px 17px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 1.03vw, 14px)',
                  lineHeight: '20px',
                  color: '#374151',
                  whiteSpace: 'nowrap',
                }}
              >
                Create Client
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col w-full" style={{ marginBottom: 'clamp(16px, 1.76vw, 24px)' }}>
            <div className="flex items-end justify-between w-full">
              <div className="flex items-end" style={{ gap: 'clamp(16px, 1.76vw, 24px)' }}>
                {[
                  { key: 'all', label: 'All clients', count: allClientsCount },
                  { key: 'active', label: 'Active clients', count: activeClientsCount },
                  { key: 'inactive', label: 'Inactive clients', count: inactiveClientsCount },
                  { key: 'quotations', label: 'Quotations', count: quotationsCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className="flex items-center"
                    style={{
                      gap: 'clamp(4px, 0.59vw, 8px)',
                      paddingBottom: 'clamp(8px, 0.88vw, 12px)',
                      borderBottom: activeTab === tab.key ? '2px solid #003450' : '2px solid transparent',
                      marginBottom: '-1px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(12px, 1.03vw, 14px)',
                        lineHeight: '20px',
                        color: activeTab === tab.key ? '#003450' : '#6B7280',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(10px, 0.88vw, 12px)',
                        lineHeight: '16px',
                        color: activeTab === tab.key ? '#003450' : '#6B7280',
                        backgroundColor: activeTab === tab.key ? '#E5E7EB' : 'transparent',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#E5E7EB', marginTop: '-1px' }} />
          </div>

          {/* Content */}
          {displayClients.length === 0 ? (
            <EmptyState onCreateClient={handleCreateClient} onCreateQuotation={handleCreateQuotation} />
          ) : (
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
              }}
            >
              {/* Table Header */}
              <div 
                className="grid grid-cols-7 gap-4" 
                style={{
                  padding: 'clamp(10px, 0.88vw, 12px) clamp(18px, 1.76vw, 24px)',
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                }}
              >
                {['CLIENT ID', 'CLIENT', 'LAST BILLING PERIOD', 'STATUS', 'SYSTEM LOGIN', 'EMAIL', 'ACTIONS'].map((header) => (
                  <div
                    key={header}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(11px, 0.95vw, 13px)',
                      lineHeight: '16px',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {header}
                  </div>
                ))}
              </div>

              {/* Table Body */}
              {displayClients.map((client, index) => (
                <div
                  key={client.id}
                  className="grid grid-cols-7 gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{
                    padding: 'clamp(12px, 1.18vw, 16px) clamp(18px, 1.76vw, 24px)',
                    borderBottom: index === displayClients.length - 1 ? 'none' : '1px solid #E5E7EB',
                  }}
                  onClick={() => handleClientClick(client.id)}
                >
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(12px, 1vw, 14px)',
                      lineHeight: '20px',
                      color: '#111827',
                    }}
                  >
                    {client.clientId}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(12px, 1vw, 14px)',
                      lineHeight: '20px',
                      color: '#111827',
                    }}
                  >
                    {client.company}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(12px, 1vw, 14px)',
                      lineHeight: '20px',
                      color: '#6B7280',
                    }}
                  >
                    {client.lastBillingPeriod}
                  </div>
                  <div>
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
                        fontSize: 'clamp(11px, 0.95vw, 13px)',
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
                          backgroundColor: client.billingStatus === 'paid' ? '#22C55E' : '#EF4444',
                        }}
                      />
                      {client.billingStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(12px, 1vw, 14px)',
                      lineHeight: '20px',
                      color: '#6B7280',
                    }}
                  >
                    {client.systemLogin}
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        minWidth: 'clamp(70px, 6.33vw, 86px)',
                        height: 'clamp(18px, 1.47vw, 20px)',
                        borderRadius: 'clamp(8px, 0.74vw, 10px)',
                        padding: '2px 10px',
                        backgroundColor: '#F3F4F6',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(11px, 0.88vw, 12px)',
                        lineHeight: 'clamp(14px, 1.18vw, 16px)',
                        textAlign: 'center',
                        color: '#003450',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {client.emailAction}
                    </span>
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        minWidth: 'clamp(50px, 4.2vw, 57px)',
                        height: 'clamp(18px, 1.47vw, 20px)',
                        borderRadius: 'clamp(8px, 0.74vw, 10px)',
                        padding: '2px 10px',
                        backgroundColor: '#F3F4F6',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(11px, 0.88vw, 12px)',
                        lineHeight: 'clamp(14px, 1.18vw, 16px)',
                        textAlign: 'center',
                        color: '#003450',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}