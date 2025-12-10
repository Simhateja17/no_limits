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
  name: 'Admin',
  avatar: '/imageofchat.png',
  lastMessage: '',
  lastMessageDate: new Date().toISOString(),
  isOnline: true,
};

// Mock messages for employee-admin chat
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: 'admin',
    senderName: 'Admin',
    senderAvatar: '/imageofchat.png',
    content: 'posuere lorem ipsum dolor sit amet consecteturg.',
    timestamp: '2022-12-30T11:10:00',
    isFromUser: false,
  },
  {
    id: '2',
    senderId: 'admin',
    senderName: 'Admin',
    senderAvatar: '/imageofchat.png',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh mauris cursus mattis molestie. Ligula ullamcorper malesuada proin libero nunc consequat interdum. A lacus vestibulum sed arcu non odio euismod lacinia.',
    timestamp: '2022-12-30T11:12:00',
    isFromUser: false,
  },
  {
    id: '3',
    senderId: 'employee',
    senderName: 'You',
    senderAvatar: '/imageofchat.png',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id aliquet lectus proin nibh nisl. Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consecteturg.',
    timestamp: '2022-12-30T11:20:00',
    isFromUser: true,
  },
  {
    id: '4',
    senderId: 'admin',
    senderName: 'Admin',
    senderAvatar: '/imageofchat.png',
    content: 'Hey can you check 110-DA. How many pieces are in stocks? It might be wrong',
    timestamp: '2022-12-30T11:25:00',
    isFromUser: false,
  },
];

export default function EmployeeChatPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'employee',
      senderName: 'You',
      senderAvatar: '/imageofchat.png',
      content,
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <DashboardLayout>
      <div
        className="flex w-full"
        style={{
          height: 'calc(100vh - 90px)',
          background: '#FFFFFF',
        }}
      >
        {/* Full width Chat Section with Admin */}
        <ChatSection
          contact={adminContact}
          messages={messages}
          currentUserId="employee"
          currentUserName="You"
          currentUserAvatar="/imageofchat.png"
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          typingUser={
            isTyping
              ? { name: 'Admin', avatar: '/imageofchat.png' }
              : undefined
          }
          showCreateTask={false}
        />
      </div>
    </DashboardLayout>
  );
}
