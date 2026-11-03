import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  Shield,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Database,
  Users2,
  Layers,
  Zap,
  Plus,
  X,
  Briefcase,
  Globe,
} from 'lucide-react';
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  loginAnonymously,
  logoutUser,
} from '../services/firebase';
import {
  fetchOrganizationsFromFirestore,
  saveOrganizationToFirestore,
  logAuditEvent,
} from '../services/firestoreService';
import { Organization, User, CurrencyCode, OrganizationCategory } from '../types';
import { INITIAL_ORGANIZATIONS } from '../data/mockDatabase';

interface AuthWrapperProps {
  children: (props: {
    authenticatedUser: FirebaseUser;
    mappedUser: User;
    initialOrg: Organization;
    onSignOut: () => Promise<void>;
  }) => React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Organization list from Firestore + seeds
  const [orgList, setOrgList] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(INITIAL_ORGANIZATIONS[0].id);

  // Email form state
  const [email, setEmail] = useState<string>('executive@apexglobal.com');
  const [password, setPassword] = useState<string>('BusinessOS2025!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Organization Registration Modal state
  const [isRegisterOrgOpen, setIsRegisterOrgOpen] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    legalName: '',
    category: 'retail' as OrganizationCategory,
    currency: 'USD' as CurrencyCode,
    email: '',
    phone: '',
    address: '',
    plan: 'enterprise' as const,
  });

  // Fetch organizations from Firestore on mount
  useEffect(() => {
    fetchOrganizationsFromFirestore()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          // Merge unique organizations
          const map = new Map<string, Organization>();
          INITIAL_ORGANIZATIONS.forEach((o) => map.set(o.id, o));
          orgs.forEach((o) => map.set(o.id, o));
          const merged = Array.from(map.values());
          setOrgList(merged);
        }
      })
      .catch((err) => {
        console.warn('Failed to load organizations in AuthWrapper:', err);
      });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state listener error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Google authentication was cancelled or restricted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email / Password Login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error('Email login failed:', err);
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Demo Sandbox Access
  const handleDemoSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginAnonymously();
    } catch (err: any) {
      console.error('Demo login failed:', err);
      setAuthError(err.message || 'Could not launch demo session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Handle Registration of a custom organization
  const handleCreateNewOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name.trim()) return;

    const newOrgId = `org-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newOrg: Organization = {
      id: newOrgId,
      name: newOrgForm.name.trim(),
      legalName: newOrgForm.legalName.trim() || `${newOrgForm.name.trim()} Corp.`,
      category: newOrgForm.category,
      currency: newOrgForm.currency,
      email: newOrgForm.email.trim() || `admin@${newOrgForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: newOrgForm.phone.trim() || '+1 800 555 0199',
      address: newOrgForm.address.trim() || 'Global Headquarters',
      plan: newOrgForm.plan,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      await saveOrganizationToFirestore(newOrg);
      await logAuditEvent({
        organizationId: newOrg.id,
        action: 'TENANT_ORGANIZATION_REGISTERED',
        category: 'governance',
        actorId: 'registration-flow',
        actorName: 'Enterprise Onboarding',
        targetEntity: 'Organization',
        targetEntityId: newOrg.id,
        description: `New tenant organization registered: ${newOrg.name} (${newOrg.category.toUpperCase()} / ${newOrg.currency}).`,
        details: { category: newOrg.category, currency: newOrg.currency, plan: newOrg.plan },
        severity: 'info',
      });
    } catch (err) {
      console.warn('Firestore newOrg fallback:', err);
    }

    setOrgList((prev) => [newOrg, ...prev]);
    setSelectedOrgId(newOrg.id);
    setIsRegisterOrgOpen(false);
    setNewOrgForm({
      name: '',
      legalName: '',
      category: 'retail',
      currency: 'USD',
      email: '',
      phone: '',
      address: '',
      plan: 'enterprise',
    });
  };

  // Initial loading splash
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
          B·OS
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Authenticating Enterprise Session...
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">Verifying Firestore Security Context</p>
      </div>
    );
  }

  // If authenticated, render children with scoped context
  if (firebaseUser) {
    const chosenOrg =
      orgList.find((o) => o.id === selectedOrgId) || orgList[0] || INITIAL_ORGANIZATIONS[0];

    const mappedUser: User = {
      id: firebaseUser.uid,
      organizationId: chosenOrg.id,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Executive Officer',
      email: firebaseUser.email || 'authenticated-user@businessos.internal',
      role: 'org_owner',
      avatar:
        firebaseUser.photoURL ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      permissions: ['*'],
    };

    return (
      <>
        {children({
          authenticatedUser: firebaseUser,
          mappedUser,
          initialOrg: chosenOrg,
          onSignOut: handleSignOut,
        })}
      </>
    );
  }

  // If unauthenticated: Enforce Login Screen
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 select-none">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Col: Brand Presentation & Enterprise Highlights (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-lg shadow-emerald-500/25">
                B·OS
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight block">
                  BusinessOS
                </span>
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">
                  Enterprise Cloud
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-100 leading-snug mb-3">
              One Operating System for Every Business Ecosystem.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Universal multi-tenant platform supporting Retail, Manufacturing, Healthcare, Logistics, SaaS, Professional Services, and all commercial organizations worldwide.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cloud Firestore Scoped Persistence</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Real-Time Audit Trail & Integrity Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open to All Organization Types & Currencies</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <span className="text-[10px] font-mono text-slate-500 block">
              DATABASE ID: ai-studio-businessos-68303b3d-b820-4979-8c6b-b983609000e7
            </span>
          </div>
        </div>

        {/* Right Col: Authentication Form (7 cols) */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Enterprise Sign In</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select or register your organization workspace to access isolated operations.
            </p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 leading-relaxed">
              {authError}
            </div>
          )}

          {/* Organization Tenant Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
                Select Workspace Tenant
              </label>
              <button
                type="button"
                onClick={() => setIsRegisterOrgOpen(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Register New Organization</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {orgList.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedOrgId === org.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold block truncate text-slate-200">{org.name}</span>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono truncate">
                    {org.currency} &bull; {org.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action: Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Or Corporate Credentials</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Corporate Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>Sign In with Corporate Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Instant Sandbox Evaluation Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-950 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Launch Instant Demo Executive Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Organization Registration Modal */}
      {isRegisterOrgOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRegisterOrgOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Register Any Enterprise Workspace
                </h3>
                <p className="text-xs text-slate-400">
                  Provision an isolated tenant environment for any industry sector.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewOrg} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Brand / Organization Trade Name
                </label>
                <input
                  type="text"
                  required
                  value={newOrgForm.name}
                  onChange={(e) =>
                    setNewOrgForm({
                      ...newOrgForm,
                      name: e.target.value,
                      legalName: newOrgForm.legalName || `${e.target.value} Corp.`,
                    })
                  }
                  placeholder="e.g. Apex Biotech, Sterling Logistics, Summit Retail"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Legal Entity Name
                </label>
                <input
                  type="text"
                  value={newOrgForm.legalName}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, legalName: e.target.value })}
                  placeholder="e.g. Sterling Logistics Services LLC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Industry Domain
                  </label>
                  <select
                    value={newOrgForm.category}
                    onChange={(e) =>
                      setNewOrgForm({
                        ...newOrgForm,
                        category: e.target.value as OrganizationCategory,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="retail">Retail & Direct-to-Consumer</option>
                    <option value="manufacturing">Manufacturing & Heavy Industry</option>
                    <option value="services">Professional Services & Consulting</option>
                    <option value="technology">Technology & SaaS</option>
                    <option value="wholesale">Wholesale & B2B Distribution</option>
                    <option value="healthcare">Healthcare & Biotech</option>
                    <option value="logistics">Logistics & Supply Chain</option>
                    <option value="hospitality">Hospitality & Food Services</option>
                    <option value="nonprofit">Non-Profit & NGO</option>
                    <option value="education">Education & Academics</option>
                    <option value="construction">Construction & Contracting</option>
                    <option value="ecommerce">E-Commerce & Online Store</option>
                    <option value="other">Other Commercial Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Operating Currency
                  </label>
                  <select
                    value={newOrgForm.currency}
                    onChange={(e) =>
                      setNewOrgForm({
                        ...newOrgForm,
                        currency: e.target.value as CurrencyCode,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
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
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={newOrgForm.email}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Corporate Phone
                  </label>
                  <input
                    type="text"
                    value={newOrgForm.phone}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, phone: e.target.value })}
                    placeholder="+1 800 555 0100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOrgOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Create Workspace & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuthWrapper;
