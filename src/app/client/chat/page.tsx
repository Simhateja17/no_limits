'use client';

import { DashboardLayout } from '@/components/layout';
import { ChatSection } from '@/components/chats';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/lib/hooks/useSocket';
import type { Contact } from '@/components/chats/ContactsList';
import type { ChatMessage } from '@/components/chats/ChatSection';

// Admin contact for client chat
const adminContact: Contact = {
  id: 'admin',
  name: 'Admin Support',
  avatar: '/imageofchat.png',
  lastMessage: '',
  lastMessageDate: new Date().toISOString(),
  isOnline: true,
};

export default function ClientChatPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  // Initialize Socket.IO connection
  const socket = useSocket({
    token: token || undefined,
    autoConnect: !!token,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CLIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Get or create chat room on mount
  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        setIsLoading(true);
        // Get current user's chat room
        const roomResponse = await api.get('/chat/my-room');
        if (roomResponse.data.success) {
          const { roomId: fetchedRoomId } = roomResponse.data.data;
          setRoomId(fetchedRoomId);

          // Fetch messages for this room
          const messagesResponse = await api.get(`/chat/rooms/${fetchedRoomId}/messages`);
          if (messagesResponse.data.success) {
            setMessages(messagesResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error initializing chat room:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'CLIENT') {
      initializeChatRoom();
    }
  }, [isAuthenticated, user]);

  // Join/leave chat room when room ID is available
  useEffect(() => {
    if (!roomId || !socket.isConnected) return;

    socket.joinRoom(roomId);

    return () => {
      socket.leaveRoom(roomId);
    };
  }, [roomId, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.onMessage((message: ChatMessage) => {
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return unsubscribe;
  }, [socket]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.onTypingUpdate((data) => {
      if (data.roomId === roomId && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return unsubscribe;
  }, [socket, roomId, user]);

  const handleSendMessage = async (content: string) => {
    if (!roomId) return;

    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content,
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isAuthenticated || user?.role !== 'CLIENT') {
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
          messages={isLoading ? [] : messages}
          currentUserId={user?.id || 'client'}
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
