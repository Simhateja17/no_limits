'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, UserRole, getDashboardRoute } from '@/lib/store';
import { useState, useRef, useEffect } from 'react';

// Navigation items per role
const navItemsByRole: Record<UserRole, { name: string; href: string }[]> = {
  CLIENT: [
    { name: 'Dashboard', href: '/client/dashboard' },
    { name: 'Orders', href: '/client/orders' },
    { name: 'Chat', href: '/client/chat' },
  ],
  EMPLOYEE: [
    { name: 'Dashboard', href: '/employee/dashboard' },
    { name: 'Orders', href: '/employee/orders' },
    { name: 'Products', href: '/employee/products' },
    { name: 'Returns', href: '/employee/returns' },
    { name: 'Chat', href: '/employee/chat' },
    { name: 'Tasks', href: '/employee/tasks' },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Returns', href: '/admin/returns' },
    { name: 'Chat', href: '/admin/chat' },
    { name: 'Tasks', href: '/admin/tasks' },
    { name: 'Settings', href: '/admin/settings' },
  ],
  SUPER_ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Returns', href: '/admin/returns' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Employees', href: '/admin/employees' },
    { name: 'System', href: '/admin/system' },
    { name: 'Settings', href: '/admin/settings' },
  ],
};

// Fallback for unauthenticated users
const defaultNavItems = [
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
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get navigation items based on user role
  const navItems = user?.role ? navItemsByRole[user.role] : defaultNavItems;

  // Get home route based on role
  const homeRoute = user?.role ? getDashboardRoute(user.role) : '/dashboard';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get role display label
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'CLIENT':
        return 'Fulfillment Client';
      case 'EMPLOYEE':
        return 'Warehouse';
      case 'ADMIN':
        return 'Admin';
      case 'SUPER_ADMIN':
        return 'Super Admin';
      default:
        return 'User';
    }
  };

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
        <Link href={homeRoute}>
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
        {/* Role Badge */}
        {user?.role && (
          <span
            className="hidden md:block"
            style={{
              padding: '6px 14px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#111827',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 400,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {getRoleLabel(user.role)}
          </span>
        )}

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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
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

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 py-2"
              style={{
                width: '200px',
                background: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB',
                zIndex: 50,
              }}
            >
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                  {user?.name || 'User'}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6B7280' }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push(homeRoute.replace('dashboard', 'settings'));
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#374151',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#DC2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
