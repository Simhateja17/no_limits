'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Skeleton component for loading placeholders
 * Uses Tailwind's animate-pulse for the shimmer effect
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
    />
  );
}

/**
 * SkeletonText - for text lines
 */
export function SkeletonText({
  lines = 1,
  width = '100%',
  height = '16px',
  gap = '8px',
  className = '',
}: {
  lines?: number;
  width?: string | number | (string | number)[];
  height?: string | number;
  gap?: string | number;
  className?: string;
}) {
  const getWidth = (index: number) => {
    if (Array.isArray(width)) {
      return width[index] || width[width.length - 1];
    }
    // Last line is typically shorter
    if (index === lines - 1 && lines > 1) {
      return '60%';
    }
    return width;
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
      }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={getWidth(index)}
          height={height}
          borderRadius="4px"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCircle - for avatars and circular elements
 */
export function SkeletonCircle({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      className={className}
    />
  );
}

/**
 * SkeletonCard - for card-like containers
 */
export function SkeletonCard({
  width = '100%',
  height = '200px',
  className = '',
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius="8px"
      className={className}
    />
  );
}

/**
 * SkeletonTableRow - skeleton for table rows
 */
export function SkeletonTableRow({
  columns = 5,
  height = '52px',
  className = '',
}: {
  columns?: number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 24px',
        gap: '24px',
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === 0 ? '80px' : '120px'}
          height="16px"
          style={{ flex: index === columns - 1 ? 'none' : 1 }}
        />
      ))}
    </div>
  );
}

/**
 * TasksTableSkeleton - specific skeleton for tasks table
 */
export function TasksTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(100px, 1fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr)',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          padding: '12px 24px',
          gap: '24px',
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} width="60%" height="12px" />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(100px, 1fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr)',
            borderBottom: rowIndex < rows - 1 ? '1px solid #E5E7EB' : 'none',
            padding: '16px 24px',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <Skeleton width="100px" height="16px" />
          <Skeleton width="80%" height="16px" />
          <Skeleton width="70%" height="16px" />
          <Skeleton width="60%" height="16px" />
          <Skeleton width="50px" height="20px" borderRadius="10px" />
          <Skeleton width="60px" height="32px" borderRadius="4px" />
        </div>
      ))}
    </div>
  );
}

/**
 * ProductDetailsSkeleton - specific skeleton for product details page
 */
export function ProductDetailsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Back button skeleton */}
      <Skeleton width="80px" height="38px" borderRadius="6px" />

      {/* Tabs skeleton */}
      <div className="flex gap-6" style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} width="100px" height="20px" />
        ))}
      </div>

      {/* Product header skeleton */}
      <div className="flex gap-6">
        {/* Image skeleton */}
        <SkeletonCard width="192px" height="192px" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Name box */}
          <div
            style={{
              padding: '15px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Skeleton width="300px" height="24px" style={{ marginBottom: '8px' }} />
            <Skeleton width="400px" height="16px" />
          </div>

          {/* Stats row */}
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                }}
              >
                <Skeleton width="80px" height="14px" style={{ marginBottom: '8px' }} />
                <Skeleton width="40px" height="20px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info box skeleton */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          marginLeft: '216px',
        }}
      >
        <div className="grid grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4">
              <Skeleton width="100px" height="20px" style={{ marginBottom: '8px' }} />
              {Array.from({ length: colIndex === 1 ? 6 : 4 }).map((_, rowIndex) => (
                <div key={rowIndex}>
                  <Skeleton width="80px" height="14px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="100%" height="36px" borderRadius="4px" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * QuickChatSkeleton - specific skeleton for quick chat widget
 */
export function QuickChatSkeleton({ messages = 3 }: { messages?: number }) {
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
      <Skeleton width="100px" height="20px" />

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Array.from({ length: messages }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px' }}>
            <SkeletonCircle size={40} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton width="120px" height="16px" />
              <Skeleton width="80px" height="14px" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <Skeleton width="100%" height="48px" borderRadius="8px" />
    </div>
  );
}

/**
 * ChatMessagesSkeleton - skeleton for chat messages
 */
export function ChatMessagesSkeleton({ messages = 4 }: { messages?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {Array.from({ length: messages }).map((_, index) => {
        const isRight = index % 2 === 0;
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isRight ? 'flex-end' : 'flex-start',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isRight && <SkeletonCircle size={16} />}
              <Skeleton width="80px" height="12px" />
              {isRight && <SkeletonCircle size={16} />}
            </div>
            <Skeleton
              width={isRight ? '200px' : '280px'}
              height="60px"
              borderRadius="8px"
            />
            <Skeleton width="40px" height="10px" />
          </div>
        );
      })}
    </div>
  );
}
