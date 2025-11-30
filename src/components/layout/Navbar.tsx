'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Orders', href: '/orders' },
  { name: 'Products', href: '/products' },
  { name: 'Returns', href: '/returns' },
  { name: 'Chat', href: '/chat' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Settings', href: '/settings' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="w-full flex items-center justify-between px-6"
      style={{
        height: '65px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      {/* Left Section: Logo + Nav Items */}
      <div className="flex items-center" style={{ gap: '32px' }}>
        {/* Logo */}
        <Link href="/dashboard">
          <Image
            src="/no_limits.png"
            alt="NoLimits Logo"
            width={100}
            height={32}
            priority
            className="h-auto w-auto"
            style={{ maxHeight: '32px' }}
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center" style={{ gap: '24px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: isActive ? '#111827' : '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                className="hover:text-[#111827]"
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Section: Bell Icon + Profile */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        {/* Bell Icon */}
        <button
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{
            width: '24px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Image
            src="/Icon.png"
            alt="Notifications"
            width={16}
            height={18}
            style={{
              width: '16px',
              height: '18px',
            }}
          />
        </button>

        {/* Profile Image */}
        <button
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Image
            src="/tom_cooks.jpg"
            alt="Profile"
            width={32}
            height={32}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
        </button>
      </div>
    </nav>
  );
}
