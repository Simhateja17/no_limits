'use client';

import { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  timestamp: string;
  content: string;
  tasks?: string[];
}

interface QuickChatProps {
  messages?: ChatMessage[];
}

const defaultMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'Fulfillment employee',
    timestamp: '6d ago',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.',
    tasks: ['Check stock'],
  },
  {
    id: '2',
    sender: 'Fulfillment employee',
    timestamp: '5d ago',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id.',
    tasks: ['Verify shipment'],
  },
];

export function QuickChat({ messages = defaultMessages }: QuickChatProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        height: '100%',
        minHeight: '450px',
      }}
    >
      {/* Header */}
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6B7280',
        }}
      >
        Quick Chat
      </span>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto',
        }}
      >
        {messages.map((message) => (
          <div key={message.id} style={{ display: 'flex', gap: '12px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#E5E7EB',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {message.avatar ? (
                <img
                  src={message.avatar}
                  alt={message.sender}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 10C12.0711 10 13.75 8.32107 13.75 6.25C13.75 4.17893 12.0711 2.5 10 2.5C7.92893 2.5 6.25 4.17893 6.25 6.25C6.25 8.32107 7.92893 10 10 10Z"
                    fill="#9CA3AF"
                  />
                  <path
                    d="M10 11.25C6.55375 11.25 3.75 14.0538 3.75 17.5H16.25C16.25 14.0538 13.4462 11.25 10 11.25Z"
                    fill="#9CA3AF"
                  />
                </svg>
              )}
            </div>

            {/* Message Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Sender Name */}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#111827',
                }}
              >
                {message.sender}
              </span>

              {/* Timestamp */}
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280',
                }}
              >
                {message.timestamp}
              </span>

              {/* Message Text */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#374151',
                  margin: '8px 0',
                }}
              >
                {message.content}
              </p>

              {/* Tasks */}
              {message.tasks && message.tasks.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '32px',
                      color: '#111827',
                    }}
                  >
                    {message.sender}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '32px',
                      color: '#374151',
                    }}
                  >
                    added tasks
                  </span>
                  {message.tasks.map((task) => (
                    <span
                      key={task}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#000000',
                        padding: '3px 13px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '13px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '165%',
            letterSpacing: '0.01em',
            color: '#192A3E',
            outline: 'none',
          }}
        />
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#003450',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.6667 1.33334L7.33334 8.66668"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.6667 1.33334L10 14.6667L7.33334 8.66668L1.33334 6.00001L14.6667 1.33334Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
