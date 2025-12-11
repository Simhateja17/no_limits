'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { Contact } from './ContactsList';
import { CreateTaskModal } from './CreateTaskModal';
import { useTranslations } from 'next-intl';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
}

interface ChatSectionProps {
  contact: Contact | null;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  typingUser?: { name: string; avatar: string };
  showCreateTask?: boolean;
}

export function ChatSection({
  contact,
  messages,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onSendMessage,
  isTyping,
  typingUser,
  showCreateTask = true,
}: ChatSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageContent, setSelectedMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (!contact) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          flex: 1,
          background: '#FFFFFF',
        }}
      >
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px',
            color: '#90A0B7',
          }}
        >
          {t('selectConversation')}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        flex: 1,
        background: '#FFFFFF',
        minWidth: '400px',
      }}
    >
      {/* Chat Header - Removed as per request */}
      {/* <div
        className="flex items-center px-6 py-4"
        style={{
          borderBottom: '1px solid #E4E9EE',
        }}
      >
        <div
          className="relative flex-shrink-0"
          style={{
            width: '24px',
            height: '24px',
            marginRight: '12px',
          }}
        >
          <Image
            src={contact.avatar}
            alt={contact.name}
            width={24}
            height={24}
            className="rounded-full object-cover"
            style={{ width: '24px', height: '24px' }}
          />
        </div>
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.3vw, 18px)',
            lineHeight: '100%',
            letterSpacing: '1%',
            color: '#192A3E',
          }}
        >
          {contact.name}
        </span>
        <div
          className="ml-2"
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: contact.isOnline ? '#22C55E' : '#9CA3AF',
          }}
        />
      </div> */}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          background: '#FAFBFC',
        }}
      >
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div key={message.id} className="mb-4">
              {/* Message sender info - positioned based on sender */}
              <div className={`flex items-center mb-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                {!isCurrentUser && (
                  <div
                    className="relative flex-shrink-0"
                    style={{
                      width: '16px',
                      height: '16px',
                      marginRight: '8px',
                    }}
                  >
                    <Image
                      src={message.senderAvatar}
                      alt={message.senderName}
                      width={16}
                      height={16}
                      className="rounded-full object-cover"
                      style={{ width: '16px', height: '16px' }}
                    />
                  </div>
                )}
                <span
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '100%',
                    letterSpacing: '1%',
                    color: '#192A3E',
                  }}
                >
                  {message.senderName}
                </span>
                <span
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    fontSize: '10px',
                    lineHeight: '100%',
                    letterSpacing: '1%',
                    color: '#90A0B7',
                    marginLeft: '8px',
                  }}
                >
                  {formatTime(message.timestamp)}
                </span>
                {isCurrentUser && (
                  <div
                    className="relative flex-shrink-0"
                    style={{
                      width: '16px',
                      height: '16px',
                      marginLeft: '8px',
                    }}
                  >
                    <Image
                      src={currentUserAvatar}
                      alt={currentUserName}
                      width={16}
                      height={16}
                      className="rounded-full object-cover"
                      style={{ width: '16px', height: '16px' }}
                    />
                  </div>
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[80%] ${isCurrentUser ? 'ml-auto' : ''}`}
              >
                <div
                  style={{
                    padding: 'clamp(12px, 1.5vw, 20px)',
                    borderRadius: '8px',
                    background: isCurrentUser ? '#FFFFFF' : '#003450',
                    border: isCurrentUser ? '1px solid #E4E9EE' : 'none',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(12px, 1.1vw, 15px)',
                      lineHeight: '165%',
                      letterSpacing: '1%',
                      color: isCurrentUser ? '#192A3E' : '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    {message.content}
                  </p>
                </div>

                {/* Create task button - only for non-user messages and when showCreateTask is true */}
                {!isCurrentUser && showCreateTask && (
                  <button
                    onClick={() => {
                      setSelectedMessageContent(message.content);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center mt-2 hover:opacity-80 transition-opacity"
                    style={{
                      background: '#F3F4F6',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '19px',
                      padding: '9px 13px 9px 11px',
                      gap: '8px',
                      height: '38px',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 6.67V13.33M6.67 10H13.33"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#111827',
                      }}
                    >
                      Create task
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator - positioned just above input area */}
      {isTyping && typingUser && (
        <div
          className="flex items-center px-4 py-3"
          style={{
            background: '#FAFBFC',
          }}
        >
          <div
            className="relative flex-shrink-0"
            style={{
              width: '16px',
              height: '16px',
              marginRight: '8px',
            }}
          >
            <Image
              src={typingUser.avatar}
              alt={typingUser.name}
              width={16}
              height={16}
              className="rounded-full object-cover"
              style={{ width: '16px', height: '16px' }}
            />
          </div>
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              color: '#192A3E',
            }}
          >
            {typingUser.name}
          </span>
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              color: '#90A0B7',
              marginLeft: '8px',
              fontStyle: 'italic',
            }}
          >
            Typing a message...
          </span>
        </div>
      )}

      {/* Input Area */}
      <div
        className="flex items-center px-4 py-4"
        style={{
          borderTop: '1px solid #E4E9EE',
          background: '#FFFFFF',
          minHeight: 'clamp(80px, 10%, 159px)',
        }}
      >
        <input
          type="text"
          placeholder="Schreibe eine Nachricht..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 outline-none"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(12px, 1vw, 14px)',
            color: '#192A3E',
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
          }}
        />

        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '16px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.44 11.05L12.25 20.24C10.72 21.77 8.18 21.77 6.65 20.24C5.12 18.71 5.12 16.17 6.65 14.64L15.84 5.45C16.81 4.48 18.37 4.48 19.34 5.45C20.31 6.42 20.31 7.98 19.34 8.95L10.15 18.14C9.67 18.62 8.89 18.62 8.41 18.14C7.93 17.66 7.93 16.88 8.41 16.4L16.6 8.21"
              stroke="#90A0B7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => {
            // Handle file upload
          }}
        />
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(task) => {
          console.log('Task created:', task);
          // Handle task creation here
        }}
        clientName={contact?.name || ''}
        initialDescription={selectedMessageContent}
      />
    </div>
  );
}
