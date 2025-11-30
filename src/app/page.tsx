'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, redirect to dashboard with any credentials
    if (user && password) {
      router.push('/dashboard');
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '24px' }}>
          {/* User Input */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label
              htmlFor="user"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
              }}
            >
              User
            </label>
            <input
              type="text"
              id="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
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
