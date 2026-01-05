'use client';

import { useTranslations } from 'next-intl';

interface Event {
  id: string;
  title: string;
  description: string;
}

interface NewEventsProps {
  events?: Event[];
  onViewAll?: () => void;
}

export function NewEvents({ events, onViewAll }: NewEventsProps) {
  const t = useTranslations('dashboard');

  const defaultEvents: Event[] = [
    {
      id: '1',
      title: t('events.orderReturned', { id: '2343' }),
      description: t('events.orderReturnedDesc'),
    },
    {
      id: '2',
      title: t('events.inboundBooked', { id: '4242' }),
      description: t('events.inboundBookedDesc', { count: '540' }),
    },
    {
      id: '3',
      title: t('events.invoiceIssued', { id: '32423' }),
      description: t('events.invoiceIssuedDesc', { period: 'December 2025' }),
    },
    {
      id: '4',
      title: t('events.orderAttention', { id: '32423' }),
      description: t('events.orderAttentionDesc'),
    },
  ];

  const displayEvents = events || defaultEvents;

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
        minHeight: '531px',
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
        {t('newEvents')}
      </span>

      {/* Events List */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
        }}
      >
        {displayEvents.map((event) => (
          <div
            key={event.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            {/* Event Title */}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#111827',
              }}
            >
              {event.title}
            </span>

            {/* Event Description */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#6B7280',
                margin: 0,
              }}
            >
              {event.description}
            </p>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button
        onClick={onViewAll}
        style={{
          width: '100%',
          padding: '9px 17px',
          background: '#FFFFFF',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#374151',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F9FAFB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FFFFFF';
        }}
      >
        {t('viewAll')}
      </button>
    </div>
  );
}
