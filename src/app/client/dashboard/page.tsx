'use client';

import { DashboardLayout } from '@/components/layout';
import { StatCard } from '@/components/dashboard';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ClientDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('dashboard');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'CLIENT') {
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
          {t('last30Days')}
        </h1>

        {/* Stats Cards Container */}
        <div
          className="flex flex-col"
          style={{
            maxWidth: '247px',
            gap: '20px',
          }}
        >
          <StatCard label={t('openOrders')} value="897" />
          <StatCard label={t('errorOrders')} value="4" />
          <StatCard label={t('avgClickRate')} value="24.57%" />
        </div>
      </div>
    </DashboardLayout>
  );
}
