'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTaskMessages } from '@/lib/hooks/useTaskMessages';
import { TaskMessage } from '@/lib/data-api';

interface TaskChatProps {
  taskId: string;
  currentUserId?: string;
}

export function TaskChat({ taskId, currentUserId }: TaskChatProps) {
  const t = useTranslations('tasks');
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    loading,
    error,
    sendMessage,
    isTyping,
    typingUser,
    setTyping,
  } = useTaskMessages(taskId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(inputValue.trim());
      setInputValue('');
      setTyping(false);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <label
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          {t('taskChat') || 'Task Chat'}
        </label>
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '32px 16px',
            border: '1px solid #E5E7EB',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid #E5E7EB',
              borderTopColor: '#003450',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <label
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          {t('taskChat') || 'Task Chat'}
        </label>
        <div
          style={{
            background: '#FEF2F2',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <label
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#111827',
        }}
      >
        {t('taskChat') || 'Task Chat'}
      </label>

      {/* Messages Container */}
      <div
        style={{
          background: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '300px',
          minHeight: '150px',
        }}
      >
        {/* Messages List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                color: '#9CA3AF',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: '0 auto 8px', opacity: 0.5 }}
              >
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  margin: 0,
                }}
              >
                {t('noMessages') || 'No messages yet. Start the conversation!'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.isFromCurrentUser}
                formatTime={formatTime}
                getInitials={getInitials}
              />
            ))
          )}

          {/* Typing indicator */}
          {isTyping && typingUser && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#6B7280',
                  fontStyle: 'italic',
                }}
              >
                {typingUser.name} {t('isTyping') || 'is typing...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={t('typeMessage') || 'Type a message...'}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={sending}
            style={{
              flex: 1,
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#192A3E',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '6px 0',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: 'none',
              background: inputValue.trim() && !sending ? '#003450' : '#E5E7EB',
              cursor: inputValue.trim() && !sending ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s ease',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={inputValue.trim() && !sending ? '#FFFFFF' : '#9CA3AF'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: TaskMessage;
  isCurrentUser: boolean;
  formatTime: (timestamp: string) => string;
  getInitials: (name: string) => string;
}

function MessageBubble({ message, isCurrentUser, formatTime, getInitials }: MessageBubbleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '8px',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isCurrentUser ? '#003450' : '#6BAC4D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {message.senderAvatar ? (
          <img
            src={message.senderAvatar}
            alt={message.senderName}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '11px',
              color: '#FFFFFF',
            }}
          >
            {getInitials(message.senderName)}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '11px',
            color: '#6B7280',
            marginBottom: '2px',
          }}
        >
          {message.senderName}
        </span>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: isCurrentUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
            background: isCurrentUser ? '#003450' : '#FFFFFF',
            border: isCurrentUser ? 'none' : '1px solid #E5E7EB',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              lineHeight: '18px',
              color: isCurrentUser ? '#FFFFFF' : '#374151',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </p>
        </div>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '10px',
            color: '#9CA3AF',
            marginTop: '2px',
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
