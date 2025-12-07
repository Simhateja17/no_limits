'use client';

import { useAuthStore, getDashboardRoute } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ['/'];

// Route prefixes and their allowed roles
const routePermissions: Record<string, string[]> = {
  '/client': ['CLIENT'],
  '/employee': ['EMPLOYEE'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard': ['CLIENT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'], // Legacy route - redirect to proper dashboard
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand to hydrate from localStorage
  useEffect(() => {
    const timeout = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    // If on public route and authenticated, redirect to appropriate dashboard
    if (isPublicRoute && isAuthenticated && user) {
      router.push(getDashboardRoute(user.role));
      return;
    }

    // If on protected route and not authenticated, redirect to login
    if (!isPublicRoute && !isAuthenticated) {
      router.push('/');
      return;
    }

    // Check role-based access for protected routes
    if (!isPublicRoute && isAuthenticated && user) {
      // Handle legacy /dashboard route - redirect to proper role-based dashboard
      if (pathname === '/dashboard') {
        router.push(getDashboardRoute(user.role));
        return;
      }

      // Check if user has access to the current route
      for (const [routePrefix, allowedRoles] of Object.entries(routePermissions)) {
        if (pathname.startsWith(routePrefix)) {
          if (!allowedRoles.includes(user.role)) {
            // Redirect to proper dashboard if no access
            router.push(getDashboardRoute(user.role));
            return;
          }
          break;
        }
      }
    }
  }, [isHydrated, isAuthenticated, user, pathname, router]);

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="animate-pulse">
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
