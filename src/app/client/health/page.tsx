'use client';

import { DashboardLayout } from '@/components/layout';
import { HealthStatusDashboard } from '@/components/health/HealthStatusDashboard';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientHealthPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

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
      <div className="w-full px-[5.2%] py-8">
        <HealthStatusDashboard />
      </div>
    </DashboardLayout>
  );
}
