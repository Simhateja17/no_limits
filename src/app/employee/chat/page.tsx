'use client';

import { DashboardLayout } from '@/components/layout';
import { ChatSection } from '@/components/chats';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Contact } from '@/components/chats/ContactsList';
import type { ChatMessage } from '@/components/chats/ChatSection';

// Admin contact for employee chat
const adminContact: Contact = {
  id: 'admin',
  name: 'Admin Support',
  avatar: '/imageofchat.png',
  lastMessage: '',
  lastMessageDate: new Date().toISOString(),
  isOnline: true,
};

export default function EmployeeChatPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Note: Employee chat functionality is not fully implemented in the database schema
  // Employees don't have Client records, so they can't use the same chat room system
  // This page is kept for future implementation

  const handleSendMessage = (content: string) => {
    // Placeholder - employee chat not fully implemented
    console.log('Employee chat not yet implemented:', content);
  };

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <DashboardLayout>
      <div
        className="flex w-full"
        style={{
          height: 'calc(100vh - 64px)',
          background: '#FFFFFF',
        }}
      >
        {/* Full width Chat Section with Admin */}
        <ChatSection
          contact={adminContact}
          messages={messages}
          currentUserId={user?.id || 'employee'}
          currentUserName={user?.name || 'You'}
          currentUserAvatar={user?.avatar || '/imageofchat.png'}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          typingUser={
            isTyping
              ? { name: 'Admin Support', avatar: '/imageofchat.png' }
              : undefined
          }
          showCreateTask={false}
        />
      </div>
    </DashboardLayout>
  );
}
