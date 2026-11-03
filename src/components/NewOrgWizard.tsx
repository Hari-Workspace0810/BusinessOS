import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  MapPin,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Organization, CurrencyCode } from '../types';

interface NewOrgWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrg: (org: Partial<Organization>) => void;
}

export const NewOrgWizard: React.FC<NewOrgWizardProps> = ({
  isOpen,
  onClose,
  onCreateOrg,
}) => {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [category, setCategory] = useState<Organization['category']>('manufacturing');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState<Organization['plan']>('professional');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateOrg({
      name,
      legalName: legalName || `${name} Private Limited`,
      category,
      currency,
      gstin: gstin || '29AAAAA0000A1Z5',
      email: email || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: phone || '+91 80 4455 6677',
      address: address || `${city} Business District`,
      plan,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Register Tenant Organization</span>
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Multi-tenant isolated workspace creation with initial branch
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Trade Brand Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solaris Robotics"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Corporate Legal Entity</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Solaris Robotics Pvt Ltd"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Industry Sector</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 capitalize"
              >
                <option value="retail">Retail & Direct-to-Consumer</option>
                <option value="manufacturing">Manufacturing & Heavy Industry</option>
                <option value="services">Professional Services & Consulting</option>
                <option value="technology">Technology, SaaS & Software</option>
                <option value="wholesale">Wholesale & B2B Distribution</option>
                <option value="healthcare">Healthcare, Biotech & Clinics</option>
                <option value="logistics">Logistics, Freight & Supply Chain</option>
                <option value="hospitality">Hospitality, Food & Leisure</option>
                <option value="nonprofit">Non-Profit & Humanitarian</option>
                <option value="education">Education & Academic Institutions</option>
                <option value="construction">Construction & Civil Contracting</option>
                <option value="ecommerce">E-Commerce & Digital Merchandising</option>
                <option value="other">Other / Specialized Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="CHF">CHF (Fr) - Swiss Franc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Indian GSTIN / Tax ID</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Initial HQ City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Subscription Plan</label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {(['free', 'starter', 'professional', 'enterprise'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`p-2.5 rounded-lg border uppercase font-bold transition-all ${
                    plan === p
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs"
            >
              Provision Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
