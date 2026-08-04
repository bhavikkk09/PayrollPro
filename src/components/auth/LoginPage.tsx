import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Building2,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export interface AuthUser {
  email: string;
  name: string;
  role: 'company_admin' | 'super_admin';
  tenantId: string;
  tenantName?: string;
  token: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  initialTenantCode?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, initialTenantCode }) => {
  const [loginRole, setLoginRole] = useState<'company' | 'superadmin'>('company');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantCode, setTenantCode] = useState(initialTenantCode || 'apex');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your work email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    let loginResult: any = null;

    try {
      loginResult = await api.login(email, password, loginRole === 'superadmin' ? 'platform_master' : tenantCode);
    } catch (err: any) {
      console.error('Login API fetch failed:', err);
      setIsLoading(false);
      setErrorMsg('Could not connect to backend server. Please verify network connection.');
      return;
    }

    setIsLoading(false);

    if (loginResult && loginResult.success && loginResult.user) {
      if (loginResult.user.tenantId && loginResult.user.tenantId !== 'platform_master') {
        sessionStorage.setItem('payrollpro_active_tenant', loginResult.user.tenantId);
        localStorage.setItem('payrollpro_active_tenant', loginResult.user.tenantId);
      }
      onLoginSuccess(loginResult.user);
    } else {
      setErrorMsg(loginResult?.message || 'Invalid email or password. Please check your credentials.');
    }
  };

  const handleQuickDemoLogin = (role: 'company' | 'superadmin') => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'superadmin') {
        onLoginSuccess({
          email: 'superadmin@payrollpro.com',
          name: 'Super Admin Operator',
          role: 'super_admin',
          tenantId: 'platform_master',
          token: `token_demo_${Date.now()}`
        });
      } else {
        const activeTenant = (tenantCode || 'smit').toLowerCase().replace(/[^a-z0-9-]/g, '');
        sessionStorage.setItem('payrollpro_active_tenant', activeTenant);
        localStorage.setItem('payrollpro_active_tenant', activeTenant);

        const knownNames: Record<string, string> = {
          apex: 'Apex Enterprises India Pvt. Ltd.',
          smit: 'Smit Infotech',
          abc_mfg: 'ABC Manufacturing Pvt. Ltd.',
          kaveri: 'Kaveri Logistics Pvt. Ltd.'
        };
        const tenantTitle = knownNames[activeTenant] || (activeTenant.charAt(0).toUpperCase() + activeTenant.slice(1) + ' Pvt. Ltd.');

        onLoginSuccess({
          email: `hr@${activeTenant}.in`,
          name: `${activeTenant.toUpperCase()} HR Admin`,
          role: 'company_admin',
          tenantId: activeTenant,
          tenantName: tenantTitle,
          token: `token_demo_${Date.now()}`
        });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Animated Gradient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-extrabold text-xl">
            P
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white font-serif">
              PayrollPro
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Enterprise HRMS & Statutory Suite
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border border-slate-800 rounded-full px-3 py-1 bg-slate-900/60 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit Encrypted Session • 1-Hour Auto Lock</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative">
          
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-white mb-1 font-serif">
              Sign In to Your HR Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Enter your company domain and user credentials
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Code / Workspace Domain
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value)}
                  placeholder="e.g. abcmfg or company-code"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abcmfg.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-slate-500">
        PayrollPro Suite &copy; {new Date().getFullYear()} • Automated 1-Hour Session Security Active
      </footer>
    </div>
  );
};
