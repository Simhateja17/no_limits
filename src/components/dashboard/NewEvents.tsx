'use client';

interface Event {
  id: string;
  title: string;
  description: string;
}

interface NewEventsProps {
  events?: Event[];
  onViewAll?: () => void;
}

const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Order #2343 has been returned',
    description: 'All products are in good condition and have been booked back into stock.',
  },
  {
    id: '2',
    title: 'Inbound #4242 has been booked in',
    description:
      'All products are in good condition. In total, 540 units have been received and recorded in inbound inventory.',
  },
  {
    id: '3',
    title: 'Invoice #32423',
    description: 'A new invoice has been issued for the period of December 2025.',
  },
  {
    id: '4',
    title: 'Order #32423',
    description:
      'Action required: An incorrect address has been identified. Please rectify this to ensure seamless processing.',
  },
];

export function NewEvents({ events = defaultEvents, onViewAll }: NewEventsProps) {
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
        New events
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
        {events.map((event) => (
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
        View all
      </button>
    </div>
  );
}
