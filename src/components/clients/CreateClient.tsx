'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

interface CreateClientProps {
  backUrl: string;
}

// Reusable input field component
interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(13px, 1.03vw, 14px)',
          lineHeight: '20px',
          color: '#374151',
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          height: 'clamp(36px, 2.8vw, 38px)',
          padding: '9px 13px',
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #D1D5DB',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(13px, 1.03vw, 14px)',
          lineHeight: '20px',
          color: '#374151',
          outline: 'none',
        }}
      />
    </div>
  );
}

export function CreateClient({ backUrl }: CreateClientProps) {
  const router = useRouter();
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');

  // Form state - Client Information
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  
  // Account settings
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sendAgreementPricing, setSendAgreementPricing] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.push(backUrl);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const clientData = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        companyName: companyName.trim() || name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        isActive,
      };

      const response = await api.post('/clients', clientData);

      if (response.data.success) {
        router.push(backUrl);
      } else {
        setError(response.data.error || 'Failed to create client');
      }
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.response?.data?.error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full min-h-screen"
    >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Client Information Section */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Heading and Description */}
          <div>
            <h2
              className="mb-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.32vw, 18px)',
                lineHeight: '24px',
                color: '#111827',
              }}
            >
              Client Information
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(13px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              Basic information about the client
            </p>
          </div>

          {/* Right: Client Information Form */}
          <div
            className="rounded-lg p-6 space-y-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Client Name"
                value={name}
                onChange={setName}
                placeholder="John Doe"
                required
              />
              <Field
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
                placeholder="ACME Inc"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Email Address"
                value={email}
                onChange={setEmail}
                placeholder="client@example.com"
                type="email"
                required
              />
              <Field
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="+49 123 456789"
                type="tel"
              />
            </div>
            <Field
              label="Street Address"
              value={address}
              onChange={setAddress}
              placeholder="Hauptstraße 123"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field
                label="City"
                value={city}
                onChange={setCity}
                placeholder="Berlin"
              />
              <Field
                label="ZIP Code"
                value={zipCode}
                onChange={setZipCode}
                placeholder="10115"
              />
              <Field
                label="Country"
                value={country}
                onChange={setCountry}
                placeholder="Germany"
              />
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Heading and Description */}
          <div>
            <h2
              className="mb-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.32vw, 18px)',
                lineHeight: '24px',
                color: '#111827',
              }}
            >
              Account Settings
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(13px, 1.03vw, 14px)',
                lineHeight: '20px',
                color: '#6B7280',
              }}
            >
              Set up login credentials and account status
            </p>
          </div>

          {/* Right: Account Settings Form */}
          <div
            className="rounded-lg p-6 space-y-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              type="password"
              required
            />
            <div className="flex items-center justify-between">
              <div>
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(14px, 1.18vw, 16px)',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  Activate Account
                </h3>
                <p className="text-sm text-gray-500">
                  Allow client to login immediately
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(14px, 1.18vw, 16px)',
                    lineHeight: '24px',
                    color: '#111827',
                  }}
                >
                  {t('sendAgreementAndPricing')}
                </h3>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendAgreementPricing}
                    onChange={(e) => setSendAgreementPricing(e.target.checked)}
                    className="sr-only peer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              onClick={() => window.history.back()}
              disabled={loading}
              style={{
                height: '38px',
                padding: '9px 17px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !name.trim() || !email.trim() || !password.trim()}
              style={{
                height: '38px',
                padding: '9px 17px',
                borderRadius: '6px',
                backgroundColor: (!loading && name.trim() && email.trim() && password.trim()) ? '#4F46E5' : '#9CA3AF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#FFFFFF',
                cursor: (!loading && name.trim() && email.trim() && password.trim()) ? 'pointer' : 'not-allowed',
                border: 'none',
              }}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
      </div>
    </div>
  );
}