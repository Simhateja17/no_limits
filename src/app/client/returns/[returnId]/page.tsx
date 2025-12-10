'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ReturnDetails } from '@/components/returns';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

export default function ClientReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const returnId = params.returnId as string;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return null;
  }

  // Don't show client column for client view (they only see their own returns)
  const showClientColumn = false;

  return (
    <DashboardLayout>
      <ReturnDetails returnId={returnId} showClientColumn={showClientColumn} />
    </DashboardLayout>
  );
}
