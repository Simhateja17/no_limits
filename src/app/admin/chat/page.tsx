'use client';

import { DashboardLayout } from '@/components/layout';
import { ContactsList, ChatSection } from '@/components/chats';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/chat/rooms');
        if (response.data.success) {
          setContacts(response.data.data);
          // Select first contact by default
          if (response.data.data.length > 0 && !selectedContact) {
            setSelectedContact(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setIsLoading(false);
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
        setIsLoadingMessages(true);
        const response = await api.get(`/chat/rooms/${selectedContact.id}/messages`);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedContact]);

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
          currentUserAvatar={user?.avatar || '/imageofchat.png'}
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
