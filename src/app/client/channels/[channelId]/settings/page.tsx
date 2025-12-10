'use client';

import { DashboardLayout } from '@/components/layout';
import { ChannelSettings } from '@/components/channels';
import { useAuthStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ChannelSettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const channelId = params.channelId as string;

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
      <ChannelSettings channelId={channelId} baseUrl="/client/channels" />
    </DashboardLayout>
  );
}
