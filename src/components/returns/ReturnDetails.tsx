'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Condition type
type ConditionType = 'Damaged' | 'Well condition' | 'Acceptable';

// Info type for products
type InfoType = 'disposed' | 'booked in again';

// Product interface for returns
interface ReturnProduct {
  id: string;
  name: string;
  sku: string;
  gtin: string;
  qty: number;
  condition: ConditionType;
  info: InfoType;
}

// Mock return data
const mockReturnData = {
  externalOrderId: '#24421',
  internalReturnId: '#2324',
  clientName: 'Kamal Gupta',
  dateArrived: '12.12.2025',
  information: 'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.',
  status: 'Done' as const,
  products: [
    { id: '1', name: 'Testproduct 1', sku: '#24234', gtin: 'Merchant 3', qty: 3, condition: 'Damaged' as ConditionType, info: 'disposed' as InfoType },
    { id: '2', name: 'Testproduct 2', sku: '#24076', gtin: 'Merchant 5', qty: 3, condition: 'Well condition' as ConditionType, info: 'booked in again' as InfoType },
    { id: '3', name: 'Testproduct 3', sku: '#24089', gtin: 'Merchant 3', qty: 2, condition: 'Acceptable' as ConditionType, info: 'booked in again' as InfoType },
  ],
  images: [
    '/women_in_return.jpg',
    '/women_in_return.jpg',
    '/women_in_return.jpg',
    '/women_in_return.jpg',
  ],
};

// Condition Badge Component
function ConditionBadge({ condition }: { condition: ConditionType }) {
  const getConditionStyles = () => {
    switch (condition) {
      case 'Damaged':
        return {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
        };
      case 'Well condition':
        return {
          backgroundColor: '#D1FAE5',
          color: '#059669',
        };
      case 'Acceptable':
        return {
          backgroundColor: '#FFF1CD',
          color: '#B45309',
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          color: '#6B7280',
        };
    }
  };

  const styles = getConditionStyles();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'clamp(16px, 1.47vw, 20px)',
        borderRadius: '10px',
        padding: 'clamp(1.5px, 0.15vw, 2px) clamp(7.5px, 0.74vw, 10px)',
        backgroundColor: styles.backgroundColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 'clamp(10px, 0.88vw, 12px)',
        lineHeight: 'clamp(13px, 1.18vw, 16px)',
        textAlign: 'center',
        color: styles.color,
        whiteSpace: 'nowrap',
      }}
    >
      {condition}
    </span>
  );
}

interface ReturnDetailsProps {
  returnId: string;
}

export function ReturnDetails({ returnId }: ReturnDetailsProps) {
  const router = useRouter();

  // Suppress unused variable warning
  void returnId;

  const handleBack = () => {
    router.back();
  };

  const handleCreateReplacementOrder = () => {
    // TODO: Create replacement order logic
    console.log('Creating replacement order...');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#F9FAFB',
        padding: 'clamp(24px, 2.36vw, 32px) clamp(39px, 3.83vw, 52px)',
        paddingBottom: 'clamp(100px, 9.8vw, 150px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Content Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 'clamp(736px, 72.46vw, 984px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            width: 'fit-content',
            height: 'clamp(29px, 2.80vw, 38px)',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            padding: 'clamp(7px, 0.66vw, 9px) clamp(13px, 1.25vw, 17px)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: 'clamp(24px, 2.36vw, 32px)',
          }}
        >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(11px, 1.03vw, 14px)',
            lineHeight: '1',
            color: '#374151',
          }}
        >
          Back
        </span>
      </button>

      {/* Return Information Section */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          padding: 'clamp(18px, 1.77vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(9px, 0.88vw, 12px)',
          marginBottom: 'clamp(24px, 2.36vw, 32px)',
        }}
      >
        {/* Section Header with Done Badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(14px, 1.33vw, 18px)',
                lineHeight: 'clamp(18px, 1.77vw, 24px)',
                color: '#111827',
                margin: 0,
              }}
            >
              Return Information
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
                margin: 0,
                marginTop: 'clamp(4px, 0.39vw, 6px)',
              }}
            >
              Details of return
            </p>
          </div>
          
          {/* Done Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(6px, 0.59vw, 8px)',
              padding: 'clamp(6px, 0.59vw, 8px) clamp(10px, 0.98vw, 14px)',
              borderRadius: '9999px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'transparent',
            }}
          >
            <span
              style={{
                width: 'clamp(6px, 0.59vw, 8px)',
                height: 'clamp(6px, 0.59vw, 8px)',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: '1',
                color: '#374151',
              }}
            >
              {mockReturnData.status}
            </span>
          </div>
        </div>

        {/* Information Rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'clamp(8px, 0.78vw, 12px)',
          }}
        >
          {/* External Order ID */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'clamp(15px, 1.47vw, 20px) 0',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                width: 'clamp(225px, 22.09vw, 300px)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              External Order ID
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {mockReturnData.externalOrderId}
            </span>
          </div>

          {/* Internal Return ID */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'clamp(15px, 1.47vw, 20px) 0',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                width: 'clamp(225px, 22.09vw, 300px)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              Internal Return ID
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {mockReturnData.internalReturnId}
            </span>
          </div>

          {/* Client name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'clamp(15px, 1.47vw, 20px) 0',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                width: 'clamp(225px, 22.09vw, 300px)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              Client name
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {mockReturnData.clientName}
            </span>
          </div>

          {/* Date arrived */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'clamp(15px, 1.47vw, 20px) 0',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                width: 'clamp(225px, 22.09vw, 300px)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              Date arrived
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {mockReturnData.dateArrived}
            </span>
          </div>

          {/* Information */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: 'clamp(15px, 1.47vw, 20px) 0',
            }}
          >
            <span
              style={{
                width: 'clamp(225px, 22.09vw, 300px)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              Information
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {mockReturnData.information}
            </span>
          </div>
        </div>
      </div>

      {/* Products Section - Separate Card */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: 'clamp(24px, 2.36vw, 32px)',
        }}
      >
        {/* Products Table Header with background */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(50px, 0.5fr) minmax(90px, 1fr) minmax(100px, 1.2fr)',
            padding: 'clamp(12px, 1.18vw, 16px) clamp(18px, 1.77vw, 24px)',
            backgroundColor: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Product name
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            SKU
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            GTIN
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            QTY
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Condition
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(10px, 0.88vw, 12px)',
              lineHeight: 'clamp(12px, 1.18vw, 16px)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Info
          </span>
        </div>

        {/* Products Table Body */}
        {mockReturnData.products.map((product, index) => (
          <div
            key={product.id}
            className="grid items-center"
            style={{
              gridTemplateColumns: 'minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(50px, 0.5fr) minmax(90px, 1fr) minmax(100px, 1.2fr)',
              padding: 'clamp(12px, 1.18vw, 16px) clamp(18px, 1.77vw, 24px)',
              borderBottom: index < mockReturnData.products.length - 1 ? '1px solid #E5E7EB' : 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#111827',
              }}
            >
              {product.name}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              {product.sku}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              {product.gtin}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              {product.qty}
            </span>
            <div>
              <ConditionBadge condition={product.condition} />
            </div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(11px, 1.03vw, 14px)',
                lineHeight: 'clamp(15px, 1.47vw, 20px)',
                color: '#6B7280',
              }}
            >
              {product.info}
            </span>
          </div>
        ))}
      </div>

      {/* Images Section */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          padding: 'clamp(18px, 1.77vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(9px, 0.88vw, 12px)',
          marginBottom: 'clamp(24px, 2.36vw, 32px)',
        }}
      >
        {/* Section Header */}
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.33vw, 18px)',
            lineHeight: 'clamp(18px, 1.77vw, 24px)',
            color: '#111827',
            margin: 0,
          }}
        >
          Return Images
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(11px, 1.03vw, 14px)',
            lineHeight: 'clamp(15px, 1.47vw, 20px)',
            color: '#6B7280',
            margin: 0,
          }}
        >
          Images of returned items
        </p>

        {/* Images Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(12px, 1.18vw, 16px)',
            marginTop: 'clamp(12px, 1.18vw, 16px)',
          }}
        >
          {mockReturnData.images.map((imageSrc, index) => (
            <div
              key={index}
              style={{
                width: 'clamp(144px, 14.14vw, 192px)',
                height: 'clamp(144px, 14.14vw, 192px)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0px 0px 0px 4px #FFFFFF',
                position: 'relative',
              }}
            >
              <Image
                src={imageSrc}
                alt={`Return image ${index + 1}`}
                fill
                style={{
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Create Replacement Order Section */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          padding: 'clamp(18px, 1.77vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(15px, 1.47vw, 20px)',
        }}
      >
        {/* Section Header */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(14px, 1.33vw, 18px)',
              lineHeight: 'clamp(18px, 1.77vw, 24px)',
              color: '#111827',
              margin: 0,
            }}
          >
            Create Replacement Order
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(11px, 1.03vw, 14px)',
              lineHeight: 'clamp(15px, 1.47vw, 20px)',
              color: '#6B7280',
              margin: 0,
              marginTop: 'clamp(4px, 0.39vw, 6px)',
            }}
          >
            Create a replacement order for this return
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateReplacementOrder}
          style={{
            width: 'fit-content',
            height: 'clamp(32px, 3.14vw, 42px)',
            borderRadius: '6px',
            border: 'none',
            padding: 'clamp(8px, 0.78vw, 11px) clamp(14px, 1.37vw, 18px)',
            backgroundColor: '#003450',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(11px, 1.03vw, 14px)',
              lineHeight: '1',
              color: '#FFFFFF',
            }}
          >
            Create Replacement Order
          </span>
        </button>
      </div>
      </div>
    </div>
  );
}
