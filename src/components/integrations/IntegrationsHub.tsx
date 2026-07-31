import React, { useState } from 'react';
import {
  Plug,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Building2,
  Sliders,
  Activity,
  Plus,
  Server,
  Key,
  Send,
  Check,
  X,
  Clock,
  Radio,
  FileSpreadsheet,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../../services/api';

export interface IntegrationCard {
  id: string;
  name: string;
  category: 'Hardware & Attendance' | 'Banking & Disbursal' | 'Government Statutory' | 'Messaging & Alerts' | 'ERP & Accounting';
  status: 'Connected & Active' | 'Syncing...' | 'Pending Setup' | 'Disconnected';
  desc: string;
  lastSync: string;
  endpointUrl?: string;
  apiKey?: string;
  syncInterval?: string;
  recordsSyncedMtd?: number;
  iconName: string;
}

const initialIntegrations: IntegrationCard[] = [
  {
    id: 'int-01',
    name: 'Matrix & ZKTeco Biometric Hardware Sync',
    category: 'Hardware & Attendance',
    status: 'Connected & Active',
    desc: 'Real-time attendance punch log ingestion over REST API / Push protocol with IP terminal validation.',
    lastSync: '2 minutes ago',
    endpointUrl: 'http://192.168.1.105:8080/api/v2/punch-ingest',
    apiKey: 'bk_live_9948271039481920',
    syncInterval: 'Real-time Push Webhook',
    recordsSyncedMtd: 14250,
    iconName: 'Server'
  },
  {
    id: 'int-02',
    name: 'HDFC & Razorpay Corporate Banking API',
    category: 'Banking & Disbursal',
    status: 'Connected & Active',
    desc: '1-click direct salary disbursal file transfer to HDFC, ICICI, SBI & Kotak corporate accounts.',
    lastSync: 'Today, 09:30 AM',
    endpointUrl: 'https://api.razorpay.com/v1/payouts/batch',
    apiKey: 'rzp_live_secret_key_8839210',
    syncInterval: 'Batch On-Demand Disbursal',
    recordsSyncedMtd: 142,
    iconName: 'Building2'
  },
  {
    id: 'int-03',
    name: 'EPFO Unified Employer Portal Sync',
    category: 'Government Statutory',
    status: 'Connected & Active',
    desc: 'Direct text file payload generation & validation for monthly Provident Fund ECR filing.',
    lastSync: 'July 25, 2026',
    endpointUrl: 'https://unifiedportal-emp.epfindia.gov.in/ecr/upload',
    apiKey: 'epf_est_code_MH_BAN_0049281',
    syncInterval: 'Monthly ECR Export',
    recordsSyncedMtd: 142,
    iconName: 'ShieldCheck'
  },
  {
    id: 'int-04',
    name: 'WhatsApp HR Assistant & Notification Bot',
    category: 'Messaging & Alerts',
    status: 'Connected & Active',
    desc: 'Automated WhatsApp PDF payslip delivery, birthday wishes & real-time leave status updates.',
    lastSync: 'Real-time Webhook',
    endpointUrl: 'https://graph.facebook.com/v18.0/1092837192/messages',
    apiKey: 'EAAOx99281039182039182039',
    syncInterval: 'Instant Trigger',
    recordsSyncedMtd: 850,
    iconName: 'Smartphone'
  },
  {
    id: 'int-05',
    name: 'Tally Prime ERP Payroll Voucher Integration',
    category: 'ERP & Accounting',
    status: 'Connected & Active',
    desc: 'Automated journal voucher posting for monthly salary expenses, PF, ESI & TDS ledger liabilities.',
    lastSync: 'July 28, 2026',
    endpointUrl: 'http://localhost:9000/tally-xml-gateway',
    apiKey: 'tally_license_78291039',
    syncInterval: 'End-of-Month Auto Post',
    recordsSyncedMtd: 12,
    iconName: 'FileSpreadsheet'
  }
];

export const IntegrationsHub: React.FC = () => {
  const [integrationsList, setIntegrationsList] = useState<IntegrationCard[]>(initialIntegrations);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCard | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAddConnectorModalOpen, setIsAddConnectorModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Config form state
  const [configForm, setConfigForm] = useState({
    endpointUrl: '',
    apiKey: '',
    syncInterval: 'Real-time'
  });

  // New Connector form state
  const [newConnectorForm, setNewConnectorForm] = useState({
    name: '',
    category: 'Hardware & Attendance' as any,
    desc: '',
    endpointUrl: '',
    apiKey: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerManualSync = async (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setIntegrationsList(prev => prev.map(item => item.id === id ? { ...item, lastSync: 'Just now' } : item));
      showToast(`Manual API synchronization completed for "${name}"!`);
    }, 1200);
  };

  const handleOpenConfig = (item: IntegrationCard) => {
    setSelectedIntegration(item);
    setConfigForm({
      endpointUrl: item.endpointUrl || '',
      apiKey: item.apiKey || '',
      syncInterval: item.syncInterval || 'Real-time'
    });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    setIntegrationsList(prev => prev.map(item => {
      if (item.id === selectedIntegration.id) {
        return {
          ...item,
          endpointUrl: configForm.endpointUrl,
          apiKey: configForm.apiKey,
          syncInterval: configForm.syncInterval
        };
      }
      return item;
    }));

    setIsConfigModalOpen(false);
    showToast(`Integration parameters updated for "${selectedIntegration.name}"!`);
  };

  const handleAddConnectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnectorForm.name.trim()) return;

    const created: IntegrationCard = {
      id: `int-0${integrationsList.length + 1}`,
      name: newConnectorForm.name,
      category: newConnectorForm.category,
      status: 'Connected & Active',
      desc: newConnectorForm.desc || 'Custom configured integration endpoint.',
      lastSync: 'Just now',
      endpointUrl: newConnectorForm.endpointUrl || 'https://api.connector.local/v1',
      apiKey: newConnectorForm.apiKey || 'key_live_custom',
      syncInterval: 'Real-time Webhook',
      recordsSyncedMtd: 0,
      iconName: 'Plug'
    };

    setIntegrationsList([created, ...integrationsList]);
    setIsAddConnectorModalOpen(false);
    showToast(`New API Connector "${created.name}" deployed successfully!`);
  };

  const handleTestAllConnectors = () => {
    setSyncingId('ALL');
    setTimeout(() => {
      setSyncingId(null);
      showToast("All 5 Active API Connectors pinged successfully (Average Latency: 18ms)!");
    }, 1500);
  };

  const filteredIntegrations = integrationsList.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Plug className="w-5 h-5 text-indigo-600" />
            Integrations & Enterprise API Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Biometric terminal ingestion, Razorpay/HDFC direct disbursal, EPFO portal ECR & WhatsApp notification bots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestAllConnectors}
            disabled={syncingId === 'ALL'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${syncingId === 'ALL' ? 'animate-spin' : ''}`} />
            {syncingId === 'ALL' ? 'Testing API Connectors...' : 'Ping All APIs'}
          </button>

          <button
            onClick={() => setIsAddConnectorModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add API Connector
          </button>
        </div>
      </div>

      {/* Live System Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Connectors</span>
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <div className="text-xl font-black text-slate-900">{integrationsList.length} Connected</div>
          <div className="text-[11px] text-emerald-600 font-semibold">100% Operational Uptime</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Biometric Punch Ingest</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900">14,250 MTD</div>
          <div className="text-[11px] text-slate-500">Real-time Push Listener</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Banking Direct Payouts</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900">₹71.20 Lakhs</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Ready for 1-Click Disbursal</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>WhatsApp Bot Alerts</span>
            <Smartphone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">850 Delivered</div>
          <div className="text-[11px] text-slate-500">Payslip PDF & Leave Status</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-400 text-[11px] px-2">Category:</span>
        {[
          'All',
          'Hardware & Attendance',
          'Banking & Disbursal',
          'Government Statutory',
          'Messaging & Alerts',
          'ERP & Accounting'
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIntegrations.map((item) => {
          const isSyncing = syncingId === item.id;

          return (
            <div
              key={item.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                      <Plug className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                      <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {item.status}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">{item.desc}</p>

                {/* API Info Pill */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="text-slate-800 font-bold truncate max-w-[220px]">{item.endpointUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sync Mode:</span>
                    <span className="text-indigo-700 font-bold">{item.syncInterval}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Synced: <span className="font-bold text-slate-700">{item.lastSync}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerManualSync(item.id, item.name)}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] cursor-pointer transition-colors border border-slate-200"
                  >
                    <RefreshCw className={`w-3 h-3 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>

                  <button
                    onClick={() => handleOpenConfig(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] shadow-xs cursor-pointer transition-colors"
                  >
                    <Sliders className="w-3 h-3" /> Configure
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIGURATION MODAL */}
      {isConfigModalOpen && selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Configure API Settings
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xs">
                  {selectedIntegration.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Endpoint URL</label>
                <input
                  type="text"
                  required
                  value={configForm.endpointUrl}
                  onChange={(e) => setConfigForm({ ...configForm, endpointUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Key / Secret Token</label>
                <input
                  type="password"
                  required
                  value={configForm.apiKey}
                  onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sync Frequency Mode</label>
                <select
                  value={configForm.syncInterval}
                  onChange={(e) => setConfigForm({ ...configForm, syncInterval: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="Real-time Push Webhook">Real-time Push Webhook</option>
                  <option value="Every 15 Minutes Polling">Every 15 Minutes Polling</option>
                  <option value="Hourly Automated Batch">Hourly Automated Batch</option>
                  <option value="Daily Scheduled Sync">Daily Scheduled Sync</option>
                  <option value="Manual On-Demand Only">Manual On-Demand Only</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONNECTOR MODAL */}
      {isAddConnectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  Deploy New API Connector
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Connect third-party biometric hardware, ERPs, or messaging Webhooks
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddConnectorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddConnectorSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Connector Name *</label>
                <input
                  type="text"
                  required
                  value={newConnectorForm.name}
                  onChange={(e) => setNewConnectorForm({ ...newConnectorForm, name: e.target.value })}
                  placeholder="e.g. Slack HR Bot / Zoho Books ERP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Integration Category *</label>
                  <select
                    value={newConnectorForm.category}
                    onChange={(e) => setNewConnectorForm({ ...newConnectorForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="Hardware & Attendance">Hardware & Attendance</option>
                    <option value="Banking & Disbursal">Banking & Disbursal</option>
                    <option value="Government Statutory">Government Statutory</option>
                    <option value="Messaging & Alerts">Messaging & Alerts</option>
                    <option value="ERP & Accounting">ERP & Accounting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">API Endpoint URL</label>
                  <input
                    type="text"
                    value={newConnectorForm.endpointUrl}
                    onChange={(e) => setNewConnectorForm({ ...newConnectorForm, endpointUrl: e.target.value })}
                    placeholder="https://api.service.com/v1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newConnectorForm.desc}
                  onChange={(e) => setNewConnectorForm({ ...newConnectorForm, desc: e.target.value })}
                  placeholder="Briefly describe what data this API connector exchanges..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddConnectorModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Deploy Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
