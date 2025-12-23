'use client';

import { DashboardLayout } from '@/components/layout';
import { ContactsList, ChatSection } from '@/components/chats';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/lib/hooks/useSocket';
import type { Contact } from '@/components/chats/ContactsList';
import type { ChatMessage } from '@/components/chats/ChatSection';

export default function AdminChatPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    console.log('🔑 Access token from localStorage:', storedToken ? 'Found' : 'Not found');
    setToken(storedToken);
  }, []);

  // Initialize Socket.IO connection
  const socket = useSocket({
    token: token || undefined,
    autoConnect: !!token,
  });

  // Log socket connection status
  useEffect(() => {
    console.log('🔌 Socket connection status:', socket.isConnected);
  }, [socket.isConnected]);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log('=== FETCHING CONTACTS ===');
        console.log('User:', user);
        console.log('Is Authenticated:', isAuthenticated);

        setIsLoading(true);
        console.log('Making API call to /chat/rooms...');

        const response = await api.get('/chat/rooms');
        console.log('API Response:', response);
        console.log('Response data:', response.data);

        if (response.data.success) {
          console.log('Success! Contacts:', response.data.data);
          console.log('Number of contacts:', response.data.data.length);

          setContacts(response.data.data);

          // Select first contact by default
          if (response.data.data.length > 0 && !selectedContact) {
            console.log('Selecting first contact:', response.data.data[0]);
            setSelectedContact(response.data.data[0]);
          } else if (response.data.data.length === 0) {
            console.log('⚠️ No contacts found in response');
          }
        } else {
          console.log('❌ Response success is false:', response.data);
        }
      } catch (error: any) {
        console.error('❌ Error fetching chat rooms:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
      } finally {
        setIsLoading(false);
        console.log('=== FETCH CONTACTS COMPLETE ===');
      }
    };

    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
      fetchContacts();
    }
  }, [isAuthenticated, user]);

  // Fetch messages when contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;

      try {
        console.log('=== FETCHING MESSAGES ===');
        console.log('Selected contact:', selectedContact);

        setIsLoadingMessages(true);
        const response = await api.get(`/chat/rooms/${selectedContact.id}/messages`);

        console.log('Messages response:', response.data);

        if (response.data.success) {
          console.log(`Loaded ${response.data.data.length} messages`);
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  // Join/leave chat room when selected contact changes
  useEffect(() => {
    if (!selectedContact || !socket.isConnected) {
      console.log('Socket join skipped - contact:', selectedContact?.id, 'connected:', socket.isConnected);
      return;
    }

    console.log(`🔌 Joining room: ${selectedContact.id}`);
    socket.joinRoom(selectedContact.id);

    return () => {
      console.log(`🔌 Leaving room: ${selectedContact.id}`);
      socket.leaveRoom(selectedContact.id);
    };
  }, [selectedContact, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket.isConnected) {
      console.log('Socket not connected, skipping message listener');
      return;
    }

    console.log('📡 Setting up message listener');

    const unsubscribe = socket.onMessage((message: ChatMessage) => {
      console.log('📨 New message received via socket:', message);
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Update contact list to show latest message
      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.id === selectedContact?.id) {
            return {
              ...contact,
              lastMessage: message.content,
              lastMessageDate: message.timestamp,
            };
          }
          return contact;
        })
      );
    });

    return unsubscribe;
  }, [socket, selectedContact]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.onTypingUpdate((data) => {
      if (data.roomId === selectedContact?.id && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return unsubscribe;
  }, [socket, selectedContact, user]);

  // Listen for user status changes
  useEffect(() => {
    if (!socket.isConnected) return;

    const unsubscribe = socket.onUserStatusChange(
      (userId) => {
        setContacts((prev) =>
          prev.map((contact) => {
            // Update online status for the contact
            // Note: You may need to map userId to contact
            return contact;
          })
        );
      },
      (userId) => {
        setContacts((prev) =>
          prev.map((contact) => {
            // Update offline status for the contact
            return contact;
          })
        );
      }
    );

    return unsubscribe;
  }, [socket]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContact) return;

    try {
      const response = await api.post(`/chat/rooms/${selectedContact.id}/messages`, {
        content,
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
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
        {/* Contacts List */}
        <ContactsList
          contacts={contacts}
          selectedContactId={selectedContact?.id}
          onSelectContact={handleSelectContact}
        />

        {/* Chat Section */}
        <ChatSection
          contact={selectedContact}
          messages={isLoadingMessages ? [] : messages}
          currentUserId={user?.id || 'admin'}
          currentUserName={user?.name || 'Admin'}
          currentUserAvatar={'/imageofchat.png'}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          typingUser={
            isTyping && selectedContact
              ? { name: selectedContact.name, avatar: selectedContact.avatar }
              : undefined
          }
        />
      </div>
    </DashboardLayout>
  );
}
