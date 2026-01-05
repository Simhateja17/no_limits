'use client';

import { useEffect, useRef } from 'react';

interface ProcessedOrdersChartProps {
  dateRange?: string;
}

export function ProcessedOrdersChart({ dateRange = 'August 2018' }: ProcessedOrdersChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawChart(ctx, canvas.width, canvas.height);
      }
    };

    const drawChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Chart data points (normalized 0-1)
      const dataPoints = [
        0.3, 0.35, 0.4, 0.38, 0.42, 0.5, 0.48, 0.55, 0.6, 0.58,
        0.65, 0.7, 0.68, 0.75, 0.72, 0.8, 0.78, 0.85, 0.82, 0.9
      ];

      const padding = { left: 0, right: 20, top: 20, bottom: 20 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Draw the line
      ctx.beginPath();
      ctx.strokeStyle = '#003450';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      dataPoints.forEach((point, index) => {
        const x = padding.left + (index / (dataPoints.length - 1)) * chartWidth;
        const y = padding.top + (1 - point) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw shadow/fill below the line
      ctx.beginPath();
      dataPoints.forEach((point, index) => {
        const x = padding.left + (index / (dataPoints.length - 1)) * chartWidth;
        const y = padding.top + (1 - point) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Close the path to create a fill area
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.closePath();

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      gradient.addColorStop(0, 'rgba(0, 52, 80, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 52, 80, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const months = ['Sep 2018', 'Oct 2018', 'Nov 2018', 'Dec 2018', 'Jan 2019'];

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
        minHeight: '280px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Title */}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#6B7280',
          }}
        >
          Processed orders
        </span>

        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#6B7280',
            }}
          >
            from
          </span>
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#111827',
            }}
          >
            {dateRange}
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ flex: 1, position: 'relative', minHeight: '120px' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* X-axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '8px',
        }}
      >
        {months.map((month) => (
          <span
            key={month}
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              color: '#6B7280',
              textAlign: 'center',
            }}
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}
