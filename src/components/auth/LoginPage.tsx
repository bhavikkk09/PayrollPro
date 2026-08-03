import React, { useState } from 'react';
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

        onLoginSuccess({
          email: `hr@${activeTenant}.in`,
          name: `${activeTenant.toUpperCase()} HR Admin`,
          role: 'company_admin',
          tenantId: activeTenant,
          tenantName: `${activeTenant.toUpperCase()} Enterprises Pvt. Ltd.`,
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
          
          {/* Top Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginRole('company');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                loginRole === 'company'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Tenant</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRole('superadmin');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                loginRole === 'superadmin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-white mb-1 font-serif">
              {loginRole === 'company' ? 'Sign In to Your HR Workspace' : 'Super Admin Control Plane'}
            </h1>
            <p className="text-xs text-slate-400">
              {loginRole === 'company'
                ? 'Enter your company domain and user credentials'
                : 'Master authentication for multi-tenant portal management'}
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
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Tenant Code (Company Login Only) */}
            {loginRole === 'company' && (
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
                    placeholder="e.g. apex or company-code"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {loginRole === 'company' ? 'Work Email Address' : 'Super Admin Username / Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginRole === 'company' ? 'hr@apexenterprises.in' : 'admin@payrollpro.com'}
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
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loginRole === 'company'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/30'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{loginRole === 'company' ? 'Sign In to Workspace' : 'Access Control Plane'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant 1-Click Demo Login</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('company')}
                className="py-2 px-3 bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-[11px] font-semibold text-indigo-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Demo Tenant HR</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('superadmin')}
                className="py-2 px-3 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-[11px] font-semibold text-emerald-300 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Demo SuperAdmin</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-slate-500">
        PayrollPro Suite &copy; {new Date().getFullYear()} • Automated 1-Hour Session Security Active
      </footer>
    </div>
  );
};
