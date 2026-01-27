'use client';

import { DashboardLayout } from '@/components/layout';
import { ChannelApiSetup } from '@/components/channels';
import { useAuthStore } from '@/lib/store';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChannelApiSetupPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const channelId = params.channelId as string;

  // Normalize channel type from database enum (SHOPIFY, WOOCOMMERCE) to title case (Shopify, Woocommerce)
  const rawChannelType = searchParams.get('type') || 'WOOCOMMERCE';
  const channelType = rawChannelType.charAt(0).toUpperCase() + rawChannelType.slice(1).toLowerCase();

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
      <ChannelApiSetup 
        channelId={channelId}
        channelType={channelType}
        baseUrl={`/client/channels/${channelId}`} 
      />
    </DashboardLayout>
  );
}
