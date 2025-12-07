'use client';

import { DashboardLayout } from '@/components/layout';
import { ProductDetails } from '@/components/products';
import { useAuthStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminProductDetailsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="w-full px-[5.2%] py-8">
        <ProductDetails productId={productId} backUrl="/admin/products" />
      </div>
    </DashboardLayout>
  );
}
