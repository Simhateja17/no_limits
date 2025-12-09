'use client';

import { DashboardLayout } from '@/components/layout';
import { ContactsList, ChatSection } from '@/components/chats';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Contact } from '@/components/chats/ContactsList';
import type { ChatMessage } from '@/components/chats/ChatSection';

// Mock data for contacts - using randomuser.me for avatars
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Max Schmidt',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'Lorem ipsum dolor sit amet, consectetur...',
    lastMessageDate: '2022-12-30T12:34:00',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Nicci Troiani',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMessage: 'Nicci schreibt eine Nachricht...',
    lastMessageDate: '2022-12-30T11:12:00',
    unreadCount: 2,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Jasmin Gold',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    lastMessage: 'Du: Klar!',
    lastMessageDate: '2022-12-29T18:05:00',
    status: 'read',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Rebecca Moore',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    lastMessage: 'Du: Die Retoure wurde beschädigt',
    lastMessageDate: '2022-12-29T18:05:00',
    status: 'error',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    lastMessage: 'Du: Das Paket wurde heute morgen verschickt',
    lastMessageDate: '2022-12-29T16:45:00',
    status: 'delivered',
    isOnline: false,
  },
  {
    id: '6',
    name: 'Jones Dermot',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Ich möchte gerne Preise für UPS erfahren',
    lastMessageDate: '2022-12-29T13:37:00',
    isOnline: true,
  },
  {
    id: '7',
    name: 'Martin Merces',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastMessage: 'Martin schreibt eine Nachricht...',
    lastMessageDate: '2022-12-29T12:48:00',
    isOnline: false,
  },
  {
    id: '8',
    name: 'Franz Ferdinand',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    lastMessage: 'Können wir am Freitag um 15 Uhr telefonieren?',
    lastMessageDate: '2022-12-28T15:27:00',
    isOnline: false,
  },
  {
    id: '9',
    name: 'Judith Williams',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    lastMessage: 'Dankeschön, bis später',
    lastMessageDate: '2022-12-28T13:19:00',
    isOnline: true,
  },
  {
    id: '10',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Am 30. Dezember passt es sehr gut',
    lastMessageDate: '2022-12-27T21:22:00',
    isOnline: false,
  },
  {
    id: '11',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    lastMessage: 'Passt, alles top! Die Sendung wurde zugestellt.',
    lastMessageDate: '2022-12-27T21:22:00',
    isOnline: false,
  },
];

// Mock messages for selected chat
const getMockMessages = (contactId: string): ChatMessage[] => {
  if (contactId === '1') {
    return [
      {
        id: '1',
        senderId: '1',
        senderName: 'Max Schmidt',
        senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        content: 'posuere lorem ipsum dolor sit amet consecteturg.',
        timestamp: '2022-12-30T11:10:00',
        isFromUser: false,
      },
      {
        id: '2',
        senderId: '1',
        senderName: 'Max Schmidt',
        senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh mauris cursus mattis molestie. Ligula ullamcorper malesuada proin libero nunc consequat interdum. A lacus vestibulum sed arcu non odio euismod lacinia.',
        timestamp: '2022-12-30T11:12:00',
        isFromUser: false,
      },
      {
        id: '3',
        senderId: 'admin',
        senderName: 'Admin',
        senderAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id aliquet lectus proin nibh nisl. Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consecteturg.',
        timestamp: '2022-12-30T11:20:00',
        isFromUser: true,
      },
      {
        id: '4',
        senderId: '1',
        senderName: 'Max Schmidt',
        senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        content: 'Hey can you check 110-DA. How many pieces are in stocks? It might be wrong',
        timestamp: '2022-12-30T11:25:00',
        isFromUser: false,
      },
    ];
  }
  return [];
};

export default function AdminChatPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Set first contact as selected by default
  useEffect(() => {
    if (mockContacts.length > 0 && !selectedContact) {
      setSelectedContact(mockContacts[0]);
      setMessages(getMockMessages(mockContacts[0].id));
    }
  }, [selectedContact]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setMessages(getMockMessages(contact.id));
    // Simulate typing for demo
    if (contact.id === '1') {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'admin',
      senderName: 'Admin',
      senderAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      content,
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
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
        {/* Contacts List */}
        <ContactsList
          contacts={mockContacts}
          selectedContactId={selectedContact?.id}
          onSelectContact={handleSelectContact}
        />

        {/* Chat Section */}
        <ChatSection
          contact={selectedContact}
          messages={messages}
          currentUserId="admin"
          currentUserName="Admin"
          currentUserAvatar="https://randomuser.me/api/portraits/men/75.jpg"
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
