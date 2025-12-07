'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore, getDashboardRoute, LoginType, UserRole } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading } = useAuthStore();
  const [loginType, setLoginType] = useState<LoginType>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      
      // Map login type to user role
      const roleMap: Record<LoginType, UserRole> = {
        client: 'CLIENT',
        employee: 'EMPLOYEE',
        admin: 'ADMIN',
      };
      
      // TODO: Replace with actual API call
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: roleMap[loginType],
      };
      
      login(mockUser, loginType);
      router.push(getDashboardRoute(mockUser.role));
    }
  };

  const getLoginTypeLabel = (type: LoginType) => {
    switch (type) {
      case 'client':
        return 'Store Owner';
      case 'employee':
        return 'Employee';
      case 'admin':
        return 'Admin';
    }
  };

  const getLoginTypeDescription = (type: LoginType) => {
    switch (type) {
      case 'client':
        return 'Login as Shopify or WooCommerce store owner';
      case 'employee':
        return 'Login as warehouse employee';
      case 'admin':
        return 'Admin access';
    }
  };

  return (
    <div 
      className="flex min-h-screen w-full items-center justify-center"
      style={{ background: '#F8FAFC' }}
    >
      {/* Login Card */}
      <div
        className="flex flex-col w-full max-w-[448px] mx-4"
        style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          padding: '32px 40px',
          gap: '24px',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/no_limits.png"
            alt="NoLimits Logo"
            width={120}
            height={40}
            priority
            className="h-auto w-auto max-w-[120px]"
          />
        </div>

        {/* Login Type Tabs */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <div 
            className="flex w-full"
            style={{
              background: '#F3F4F6',
              borderRadius: '8px',
              padding: '4px',
            }}
          >
            {/* Client Tab */}
            <button
              type="button"
              onClick={() => setLoginType('client')}
              className="flex-1 flex items-center justify-center transition-all"
              style={{
                height: '36px',
                borderRadius: '6px',
                background: loginType === 'client' ? '#FFFFFF' : 'transparent',
                boxShadow: loginType === 'client' ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: loginType === 'client' ? '#111827' : '#6B7280',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Store Owner
            </button>

            {/* Employee Tab */}
            <button
              type="button"
              onClick={() => setLoginType('employee')}
              className="flex-1 flex items-center justify-center transition-all"
              style={{
                height: '36px',
                borderRadius: '6px',
                background: loginType === 'employee' ? '#FFFFFF' : 'transparent',
                boxShadow: loginType === 'employee' ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: loginType === 'employee' ? '#111827' : '#6B7280',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Employee
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className="flex-1 flex items-center justify-center transition-all"
              style={{
                height: '36px',
                borderRadius: '6px',
                background: loginType === 'admin' ? '#FFFFFF' : 'transparent',
                boxShadow: loginType === 'admin' ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: loginType === 'admin' ? '#111827' : '#6B7280',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>

          {/* Login Type Description */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#6B7280',
              textAlign: 'center',
            }}
          >
            {getLoginTypeDescription(loginType)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '24px' }}>
          {/* Email Input */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label
              htmlFor="email"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginType === 'client' ? 'store@example.com' : 'employee@company.com'}
              className="w-full outline-none focus:ring-2 focus:ring-[#003450]/20"
              style={{
                height: '40px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                padding: '10px 14px',
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none focus:ring-2 focus:ring-[#003450]/20"
              style={{
                height: '40px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                padding: '10px 14px',
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#003450]"
                style={{
                  borderRadius: '4px',
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                Remember me
              </label>
            </div>
            <a
              href="#"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#003450',
                textDecoration: 'none',
              }}
              className="hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center transition-colors hover:opacity-90"
            style={{
              height: '38px',
              borderRadius: '6px',
              padding: '9px 17px',
              background: '#003450',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
