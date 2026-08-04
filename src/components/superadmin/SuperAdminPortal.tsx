import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Lock,
  Download,
  Terminal,
  Clock,
  Eye,
  Settings,
  X,
  Play,
  Copy,
  TrendingUp,
  DollarSign,
  Users,
  Globe,
  Radio,
  ExternalLink,
  Link2,
  ArrowLeftRight,
  Shield
} from 'lucide-react';
import { api } from '../../services/api';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: 'Starter' | 'Growth' | 'Business' | 'Enterprise';
  status: 'Active' | 'Trial' | 'Suspended' | 'Expired';
  employeeCount: number;
  maxEmployees: number;
  storageUsedMb: number;
  dbSizeMb: number;
  createdDate: string;
  expiryDate: string;
  lastBackup: string;
  frappeVersion: string;
  nodeRegion: string;
  adminEmail: string;
}

const mockTenants: Tenant[] = [
  {
    id: 'TNT-001',
    name: 'Apex Global Logistics Pvt Ltd',
    subdomain: 'localhost:3000/?tenant=apexlogistics',
    customDomain: 'apexlogistics.localhost:3000',
    plan: 'Enterprise',
    status: 'Active',
    employeeCount: 480,
    maxEmployees: 1000,
    storageUsedMb: 4120,
    dbSizeMb: 850,
    createdDate: '2024-01-15',
    expiryDate: '2027-01-15',
    lastBackup: '10 mins ago',
    frappeVersion: 'v15.2.0 (HRMS v15.1.2)',
    nodeRegion: 'local-dev-mumbai',
    adminEmail: 'admin@apexlogistics.local'
  },
  {
    id: 'TNT-002',
    name: 'TechVista Innovations',
    subdomain: 'localhost:3000/?tenant=techvista',
    customDomain: 'techvista.localhost:3000',
    plan: 'Growth',
    status: 'Active',
    employeeCount: 125,
    maxEmployees: 250,
    storageUsedMb: 1240,
    dbSizeMb: 320,
    createdDate: '2024-03-10',
    expiryDate: '2025-03-10',
    lastBackup: '2 hours ago',
    frappeVersion: 'v15.2.0 (HRMS v15.1.2)',
    nodeRegion: 'local-dev-mumbai',
    adminEmail: 'hr@techvista.local'
  },
  {
    id: 'TNT-003',
    name: 'Kaveri Textiles & Exports',
    subdomain: 'localhost:3000/?tenant=kaveri',
    customDomain: 'kaveri.localhost:3000',
    plan: 'Starter',
    status: 'Trial',
    employeeCount: 38,
    maxEmployees: 50,
    storageUsedMb: 450,
    dbSizeMb: 110,
    createdDate: '2024-07-12',
    expiryDate: '2024-08-12',
    lastBackup: '1 day ago',
    frappeVersion: 'v15.2.0 (HRMS v15.1.2)',
    nodeRegion: 'local-dev-mumbai',
    adminEmail: 'payroll@kaveri.local'
  }
];

export const SuperAdminPortal: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<'tenants' | 'billing' | 'infrastructure' | 'audit'>('tenants');

  // Tenant Provisioning Modal State
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState<number>(1);
  const [isProvisioningInProgress, setIsProvisioningInProgress] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);

  // New Tenant Form State
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    subdomain: '',
    plan: 'Growth' as Tenant['plan'],
    adminEmail: '',
    adminName: '',
    employeeLimit: 250,
    country: 'India',
    timezone: 'Asia/Kolkata (GMT +5:30)',
    demoData: false
  });

  // Action toast state
  const [actionToast, setActionToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenants() {
      const data = await api.getTenants();
      if (data && data.tenants) {
        const mapped: Tenant[] = data.tenants.map((t: any) => ({
          id: t.id,
          name: t.name,
          subdomain: t.domain,
          plan: t.plan.includes('Enterprise') ? 'Enterprise' : 'Growth',
          status: t.status,
          employeeCount: t.activeEmployees || 1,
          maxEmployees: t.maxEmployees || 500,
          storageUsedMb: 1200,
          dbSizeMb: 350,
          createdDate: '2026-07-28',
          expiryDate: '2027-07-28',
          lastBackup: t.lastBackup || 'Just now',
          frappeVersion: 'v15.2.0 (HRMS v15.1.2)',
          nodeRegion: t.region || 'gcp-asia-south1-a',
          adminEmail: `admin@${t.domain}`
        }));
        setTenants(mapped);
      }
    }
    loadTenants();
  }, []);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStartProvisioning = () => {
    if (!newTenantForm.name || !newTenantForm.subdomain || !newTenantForm.adminEmail) {
      alert('Please fill out all required fields (Company Name, Subdomain, Admin Email)');
      return;
    }

    setIsProvisioningInProgress(true);
    setProvisioningLogs(['[00:00.1] Initiating Local Dev Multi-Tenant Provisioning Pipeline...']);

    const targetLocalDomain = `localhost:3000/?tenant=${newTenantForm.subdomain}`;

    const steps = [
      '[00:00.8] Initializing Isolated Local Database Schema (db_tnt_' + Math.floor(Math.random() * 8999 + 1000) + ')...',
      '[00:02.1] Creating Local Tenant Directory & Site Config: ' + targetLocalDomain + '...',
      '[00:03.5] Mounting Local Dev Module Containers & Route Handlers...',
      '[00:05.2] Installing Frappe HRMS Core Engine & Custom Salary Components...',
      '[00:07.1] Running Database Schema Migrations & Default Fixtures...',
      '[00:08.8] Configuring Local Auth Token & Dev Secret Keys...',
      '[00:10.2] Provisioning Administrator Account (' + newTenantForm.adminEmail + ')...',
      '[00:11.5] Initializing Local Background Queue Workers & Scheduler...',
      '[00:12.8] Tenant Provisioning Complete! Local Target URL: http://' + targetLocalDomain
    ];

    steps.forEach((logMessage, index) => {
      setTimeout(async () => {
        setProvisioningLogs((prev) => [...prev, logMessage]);
        if (index === steps.length - 1) {
          setIsProvisioningInProgress(false);
          setProvisioningStep(3);

          const createdTenant: Tenant = {
            id: `TNT-${Math.floor(Math.random() * 899 + 100)}`,
            name: newTenantForm.name,
            subdomain: `localhost:3000/?tenant=${newTenantForm.subdomain}`,
            customDomain: `${newTenantForm.subdomain}.localhost:3000`,
            plan: newTenantForm.plan,
            status: 'Active',
            employeeCount: newTenantForm.demoData ? 5 : 0,
            maxEmployees: newTenantForm.employeeLimit,
            storageUsedMb: 120,
            dbSizeMb: 45,
            createdDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lastBackup: 'Just now',
            frappeVersion: 'v15.2.0 (HRMS Local Dev)',
            nodeRegion: 'local-dev-mumbai',
            adminEmail: newTenantForm.adminEmail
          };

          setTenants((prev) => [createdTenant, ...prev]);

          // Notify REST API
          await api.createTenant({
            name: newTenantForm.name,
            domain: `localhost:3000/?tenant=${newTenantForm.subdomain}`,
            plan: newTenantForm.plan,
            region: 'local-dev-mumbai',
            maxEmployees: newTenantForm.employeeLimit
          });
        }
      }, (index + 1) * 1200);
    });
  };

  const handleToggleTenantStatus = async (id: string) => {
    let nextStatus = 'Active';
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextStatus = t.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`Tenant ${t.name} status updated to ${nextStatus}`);
          return { ...t, status: nextStatus as any };
        }
        return t;
      })
    );

    await api.updateTenantStatus(id, nextStatus);
  };

  const handleTriggerBackup = (tenantName: string) => {
    showToast(`Automated DB + File Backup initiated for ${tenantName}`);
  };

  const handleImpersonate = async (subdomain: string, tenantName?: string) => {
    let cleanCode = subdomain.includes('tenant=') ? subdomain.split('tenant=')[1] : subdomain;
    cleanCode = cleanCode.replace(/^https?:\/\//, '').replace(/\/+$/, '').split('/')[0];
    cleanCode = cleanCode.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'abc_mfg';
    if (cleanCode.includes('abcmfg')) cleanCode = 'abc_mfg';

    const companyTitle = tenantName || (cleanCode.charAt(0).toUpperCase() + cleanCode.slice(1) + ' Pvt. Ltd.');

    // Fetch valid signed session token from backend API
    const res = await api.impersonateTenant(cleanCode);
    const validToken = res?.token || `jwt_token_secure_usr-${cleanCode}_${Date.now()}`;
    const userPayload = res?.user || {
      id: `usr-${cleanCode}`,
      email: `admin@${cleanCode.replace(/_/g, '')}.com`,
      name: `${companyTitle} (HR Manager)`,
      role: 'hr_admin',
      tenantId: cleanCode,
      tenantName: companyTitle
    };

    const authPayload = JSON.stringify({
      ...userPayload,
      token: validToken
    });

    sessionStorage.setItem('payrollpro_token', validToken);
    sessionStorage.setItem('payrollpro_active_tenant', cleanCode);
    sessionStorage.setItem('payrollpro_auth_user', authPayload);

    localStorage.setItem('payrollpro_token', validToken);
    localStorage.setItem('payrollpro_active_tenant', cleanCode);
    localStorage.setItem('payrollpro_auth_user', authPayload);

    const targetUrl = `http://localhost:3000/${cleanCode}/dashboard`;
    showToast(`Opening Tenant Workspace: ${companyTitle} (${targetUrl})`);
    setTimeout(() => {
      window.open(targetUrl, '_blank');
    }, 200);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Zap className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-medium">{actionToast}</span>
        </div>
      )}

      {/* Standalone Control-Plane Browser URL Header Bar */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* URL Address Bar Simulation */}
          <div className="flex-1 w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2.5 font-mono text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-bold">http://</span>
            <span className="text-white font-bold bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/80">
              localhost:3000/admin
            </span>
            <span className="text-slate-400"> (Super Admin Control Plane)</span>
            <span className="ml-auto text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-sans font-semibold border border-slate-700 hidden md:inline-block">
              Environment: Localhost Dev
            </span>
          </div>

          {/* Architecture Badge */}
          <div className="flex items-center gap-2 text-xs shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-medium text-[11px]">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated Local URL Route (`/admin`)</span>
            </div>
          </div>
        </div>

        {/* Informational Alert Box */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Local Multi-Tenant Mode:</strong> Super Admin runs locally on <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">http://localhost:3000/admin</code>. Created tenants use local domain format.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Local Tenant URL:</span>
            <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
              http://localhost:3000/?tenant=acme
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Super Admin SaaS Control Panel
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              1,248 Active Sites Across GCP (asia-south1 / Mumbai)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-2 text-white flex items-center gap-2">
            Payroll Pro Cloud Architecture Engine
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Multi-Tenant Orchestration • Automated Site Provisioning • Isolated Databases • Real-time Monitoring & Billing
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => {
              setProvisioningStep(1);
              setProvisioningLogs([]);
              setIsProvisioningModalOpen(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision New Tenant
          </button>
        </div>
      </div>

      {/* High-Level SaaS Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total SaaS Tenants</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{tenants.length} Sites</h3>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +14 new this week
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Monthly Recurring Revenue (MRR)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">₹11,425,000</h3>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +18.2% YoY Growth
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Employees Managed</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">184,200 Records</h3>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Across all tenant DBs</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">System Cluster Health</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5">99.98% Uptime</h3>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> 3 Nodes Healthy
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Tenant Management ({filteredTenants.length})
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Subscription & Billing Engine
        </button>

        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'infrastructure'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Cloud Infrastructure & Redis Workers
        </button>
      </div>

      {/* TAB 1: TENANT MANAGEMENT DIRECTORY */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, subdomain, admin email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-medium text-slate-500 shrink-0">Status Filter:</span>
              {['ALL', 'Active', 'Trial', 'Suspended'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Company & Subdomain</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Employees</th>
                    <th className="p-3.5">Storage & DB Size</th>
                    <th className="p-3.5">Last Backup</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{t.name}</span>
                          <button
                            onClick={() => handleImpersonate(t.subdomain, t.name)}
                            className="text-[11px] text-indigo-600 font-mono flex items-center gap-1 hover:underline cursor-pointer text-left"
                            title="Click to launch SSO login into tenant site"
                          >
                            <Globe className="w-3 h-3 text-slate-400" />
                            {t.subdomain}
                          </button>
                          {t.customDomain && (
                            <button
                              onClick={() => handleImpersonate(t.customDomain!, t.name)}
                              className="text-[10px] text-emerald-600 font-mono hover:underline cursor-pointer text-left"
                              title="Click to open custom domain SSO"
                            >
                              Custom: {t.customDomain}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            t.plan === 'Enterprise'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : t.plan === 'Business'
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {t.plan}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleTenantStatus(t.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                            t.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : t.status === 'Trial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'Active'
                                ? 'bg-emerald-500'
                                : t.status === 'Trial'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {t.status}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {t.employeeCount} / {t.maxEmployees}
                          </span>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (t.employeeCount / t.maxEmployees) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        <div>Storage: {(t.storageUsedMb / 1024).toFixed(2)} GB</div>
                        <div>Database: {t.dbSizeMb} MB</div>
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {t.lastBackup}
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleImpersonate(t.subdomain, t.name)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-[11px] border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer font-sans"
                            title="Open Tenant Administrator Workspace"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                            Open Site
                          </button>

                          <button
                            onClick={() => setSelectedTenant(t)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Tenant Details & Actions"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Payment Gateway Webhooks</h3>
              <p className="text-xs text-slate-500 mt-1">Razorpay & Stripe Integration Status</p>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                  <span className="font-medium">Razorpay Webhook (`payment.captured`)</span>
                  <span className="font-bold">Active (100%)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                  <span className="font-medium">Stripe Billing Auto-Renew</span>
                  <span className="font-bold">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">GST Invoicing Engine</h3>
              <p className="text-xs text-slate-500 mt-1">B2B GST Compliance for Indian SaaS</p>
              <div className="mt-4 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>CGST (9%) Collected:</span>
                  <span className="font-bold text-slate-900">₹1,028,250</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%) Collected:</span>
                  <span className="font-bold text-slate-900">₹1,028,250</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST (18%) Collected:</span>
                  <span className="font-bold text-slate-900">₹450,100</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Active Plan Tiers</h3>
              <p className="text-xs text-slate-500 mt-1">Pricing Configuration</p>
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span>Starter (₹49/emp/mo):</span>
                  <span className="font-bold text-slate-900">412 Tenants</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Growth (₹89/emp/mo):</span>
                  <span className="font-bold text-slate-900">620 Tenants</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Enterprise (Custom):</span>
                  <span className="font-bold text-slate-900">216 Tenants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                GCP Cloud Cluster Monitor (`asia-south1` / Mumbai)
              </h3>
              <p className="text-xs text-slate-400">Google Kubernetes Engine (GKE Autopilot) / Cloud Run, Cloud SQL for MySQL & Cloud Memorystore Redis</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              GCP Cluster Health: 99.98%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">vCPU Utilization</span>
              <p className="text-2xl font-bold text-white mt-1">24.5%</p>
              <span className="text-[10px] text-emerald-400">Across 24 GKE Autopilot Pods / Cloud Run</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Memory Allocation</span>
              <p className="text-2xl font-bold text-white mt-1">42.1 GB / 128 GB</p>
              <span className="text-[10px] text-emerald-400">Cloud Memorystore & Containers</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Cloud Memorystore (Redis Workers)</span>
              <p className="text-2xl font-bold text-white mt-1">12 Pending Tasks</p>
              <span className="text-[10px] text-emerald-400">16 Celery Workers on Cloud Run</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Cloud SQL Instance Pool</span>
              <p className="text-2xl font-bold text-white mt-1">1,248 Tenant DBs</p>
              <span className="text-[10px] text-emerald-400">High Availability & Cloud Storage Sync</span>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION NEW TENANT MODAL */}
      {isProvisioningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  Automated Tenant Provisioning Wizard
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Creates isolated MariaDB DB, Frappe Site, Let's Encrypt SSL & Nginx Routing
                </p>
              </div>
              <button
                onClick={() => setIsProvisioningModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {provisioningStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      value={newTenantForm.name}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                      placeholder="e.g., Acme Infotech Pvt Ltd"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Local Subdomain / Tenant Code *
                      </label>
                      <input
                        type="text"
                        value={newTenantForm.subdomain}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="acme"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-mono"
                      />
                      <div className="mt-1.5 text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                        Target Local Dev URL: <strong>http://localhost:3000/?tenant={newTenantForm.subdomain || 'acme'}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select SaaS Subscription Plan
                      </label>
                      <select
                        value={newTenantForm.plan}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, plan: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                      >
                        <option value="Starter">Starter (Up to 50 employees)</option>
                        <option value="Growth">Growth (Up to 250 employees)</option>
                        <option value="Business">Business (Up to 500 employees)</option>
                        <option value="Enterprise">Enterprise (Up to 1,000+ employees)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Initial Administrator Email *
                      </label>
                      <input
                        type="email"
                        value={newTenantForm.adminEmail}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, adminEmail: e.target.value })}
                        placeholder="admin@acme.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Max Employee Limit
                      </label>
                      <input
                        type="number"
                        value={newTenantForm.employeeLimit}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, employeeLimit: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="demoDataCheckbox"
                      checked={newTenantForm.demoData}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, demoData: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="demoDataCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Populate Sample Demo Data (Uncheck for clean empty tenant with 0 employees)
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsProvisioningModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvisioningStep(2)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                    >
                      Next: Deploy & Execute →
                    </button>
                  </div>
                </div>
              )}

              {provisioningStep === 2 && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 bg-slate-950 text-slate-200 rounded-xl space-y-1.5 h-64 overflow-y-auto custom-scrollbar">
                    {provisioningLogs.map((log, idx) => (
                      <div key={idx} className="text-emerald-400">{log}</div>
                    ))}
                    {isProvisioningInProgress && (
                      <div className="text-indigo-400 animate-pulse">[Executing Bench Bench CLI & Cloud SQL Scripts...]</div>
                    )}
                  </div>

                  <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProvisioningInProgress}
                      onClick={() => setProvisioningStep(1)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={isProvisioningInProgress}
                      onClick={handleStartProvisioning}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                    >
                      {isProvisioningInProgress ? 'Provisioning...' : 'Start Cloud Provisioning'}
                    </button>
                  </div>
                </div>
              )}

              {provisioningStep === 3 && (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 text-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-950">
                    Tenant Successfully Provisioned on GCP!
                  </h3>
                  <p className="text-emerald-800">
                    Subdomain: <code className="font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">{newTenantForm.subdomain}.payrollpro.in</code>
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setIsProvisioningModalOpen(false)}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Close & Return to Fleet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
