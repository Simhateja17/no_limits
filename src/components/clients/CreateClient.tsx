'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface CreateClientProps {
  backUrl: string;
}

// Reusable input field component
interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
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
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  const [clientCompanyName, setClientCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Form state - Pricing
  const [pricingCompanyName, setPricingCompanyName] = useState('');
  const [pricingEmail, setPricingEmail] = useState('');
  
  // Send quotation toggle
  const [sendAgreementPricing, setSendAgreementPricing] = useState(false);

  const handleBack = () => {
    router.push(backUrl);
  };

  const handleSave = () => {
    // In a real app, save the client data to the API
    console.log('Creating client:', { 
      clientCompanyName, 
      clientEmail, 
      pricingCompanyName, 
      pricingEmail, 
      sendAgreementPricing 
    });
    // Navigate back to clients list after save
    router.push(backUrl);
  };

  return (
    <div 
      className="w-full min-h-screen"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-[3.8%] py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            style={{
              height: 'clamp(36px, 2.8vw, 38px)',
              padding: '9px 17px 9px 15px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(13px, 1.03vw, 14px)',
              lineHeight: '20px',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            {tCommon('back')}
          </button>
        </div>

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
              {t('clientInformation')}
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
              {t('clientInformationDescription')}
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
            <Field
              label={t('companyOrClientName')}
              value={clientCompanyName}
              onChange={setClientCompanyName}
              placeholder=""
            />
            <Field
              label={t('emailAddress')}
              value={clientEmail}
              onChange={setClientEmail}
              placeholder=""
            />
          </div>
        </div>

        {/* Pricing Section */}
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
              {t('pricing')}
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
              {t('pricingDescription')}
            </p>
          </div>

          {/* Right: Pricing Form */}
          <div
            className="rounded-lg p-6 space-y-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Field
              label={t('companyOrClientName')}
              value={pricingCompanyName}
              onChange={setPricingCompanyName}
              placeholder=""
            />
            <Field
              label={t('emailAddress')}
              value={pricingEmail}
              onChange={setPricingEmail}
              placeholder=""
            />
          </div>
        </div>

        {/* Send Quotation Section */}
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
              {t('sendQuotation')}
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
              {t('sendQuotationDescription')}
            </p>
          </div>

          {/* Right: Toggle Section */}
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleBack}
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
              cursor: 'pointer',
            }}
          >
            {tCommon('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={!clientCompanyName.trim()}
            style={{
              height: '38px',
              padding: '9px 17px',
              borderRadius: '6px',
              backgroundColor: clientCompanyName.trim() ? '#4F46E5' : '#9CA3AF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#FFFFFF',
              cursor: clientCompanyName.trim() ? 'pointer' : 'not-allowed',
              border: 'none',
            }}
          >
            {tCommon('save') || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}