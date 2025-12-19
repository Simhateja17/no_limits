import { api } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    employeeId?: string | null;
    department?: string | null;
    client?: any;
  };
  accessToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role?: string;
  companyName?: string;
  phone?: string;
  address?: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('📡 Calling login API:', credentials.email);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Login API error:', response.status, data.error);
      throw new Error(data.error || 'Login failed');
    }

    console.log('✅ Login API success:', data.user.email, data.user.role);
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    console.log('📡 Calling logout API');
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('⚠️ Logout API warning:', response.status);
    } else {
      console.log('✅ Logout API success');
    }

    localStorage.removeItem('accessToken');
  },

  // Get current user
  getCurrentUser: async () => {
    console.log('📡 Calling getCurrentUser API');
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('⚠️ No access token found');
      throw new Error('No access token');
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ getCurrentUser API error:', response.status, data.error);
      throw new Error(data.error || 'Failed to get user');
    }

    console.log('✅ getCurrentUser API success:', data.user.email);
    return data;
  },

  // Register (admin only)
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    console.log('📡 Calling register API:', userData.email);
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Register API error:', response.status, data.error);
      throw new Error(data.error || 'Registration failed');
    }

    console.log('✅ Register API success:', data.user.email);
    return data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    console.log('📡 Calling changePassword API');
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ changePassword API error:', response.status, data.error);
      throw new Error(data.error || 'Failed to change password');
    }

    console.log('✅ changePassword API success');
  },

  // Refresh token
  refreshToken: async (): Promise<{ accessToken: string }> => {
    console.log('📡 Calling refreshToken API');
    
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ refreshToken API error:', response.status, data.error);
      throw new Error(data.error || 'Failed to refresh token');
    }

    console.log('✅ refreshToken API success');
    return data;
  },
};
