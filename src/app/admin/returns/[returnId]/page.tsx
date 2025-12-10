'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ReturnDetails } from '@/components/returns';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';

export default function AdminReturnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const returnId = params.returnId as string;

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  // Show client column for SUPER_ADMIN and ADMIN (superadmin and warehouse labor view)
  const showClientColumn = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <DashboardLayout>
      <ReturnDetails returnId={returnId} showClientColumn={showClientColumn} />
    </DashboardLayout>
  );
}
