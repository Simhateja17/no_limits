'use client';

import { DashboardLayout } from '@/components/layout';
import { StatCard } from '@/components/dashboard';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EmployeeDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <DashboardLayout>
      <div
        className="w-full px-[5.2%] py-8"
        style={{ maxWidth: '100%' }}
      >
        {/* Last 30 Days Header */}
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#111827',
            marginBottom: '20px',
          }}
        >
          Last 30 Days
        </h1>

        {/* Stats Cards Container */}
        <div
          className="flex flex-col"
          style={{
            maxWidth: '247px',
            gap: '20px',
          }}
        >
          <StatCard label="Offene Bestellungen" value="897" />
          <StatCard label="Fehlerhafte Bestellungen" value="4" />
          <StatCard label="Avg. Click Rate" value="24.57%" />
        </div>
      </div>
    </DashboardLayout>
  );
}
