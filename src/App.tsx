import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  PlusCircle, 
  Printer, 
  Wifi, 
  User, 
  Lock, 
  Server, 
  Hash, 
  Type as TypeIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MikroTikUser {
  username: string;
  password?: string;
  profile: string;
}

interface Profile {
  name: string;
  '.id': string;
}

export default function App() {
  const [host, setHost] = useState('');
  const [user, setUser] = useState('admin');
  const [password, setPassword] = useState('');
  const [port, setPort] = useState('8728');
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [length, setLength] = useState(6);
  const [type, setType] = useState<'user_only' | 'user_pass'>('user_only');
  const [mode, setMode] = useState<'hotspot' | 'usermanager'>('hotspot');
  
  const [generatedUsers, setGeneratedUsers] = useState<MikroTikUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const printRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mikrotik/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, user, password, port, mode }),
      });
      const data = await response.json();
      if (data.success) {
        setProfiles(data.profiles);
        if (data.profiles.length > 0) setSelectedProfile(data.profiles[0].name);
      } else {
        setError(data.error || 'Failed to connect to MikroTik');
      }
    } catch (err) {
      setError('Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateCards = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/mikrotik/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          host, user, password, port, 
          count, profile: selectedProfile, prefix, length, type, mode 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedUsers(data.users);
        setSuccess(true);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Network error during generation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Cards</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
            .card-print {
              width: 5cm;
              height: 3cm;
              border: 1px solid #ccc;
              margin: 5px;
              padding: 10px;
              display: inline-block;
              vertical-align: top;
              font-family: sans-serif;
              position: relative;
              overflow: hidden;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="p-4">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Wifi className="text-indigo-600" size={32} />
              MikroTik Card Gen
            </h1>
            <p className="text-slate-500 mt-1">Generate and print professional hotspot cards</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setGeneratedUsers([])}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
              title="Clear all"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={handlePrint}
              disabled={generatedUsers.length === 0}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Printer size={18} />
              Print Cards
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Configuration */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Mode Selection */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <LayoutGrid size={14} />
                System Mode
              </h2>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setMode('hotspot')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mode === 'hotspot' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Hotspot
                </button>
                <button 
                  onClick={() => setMode('usermanager')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mode === 'usermanager' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  User Manager
                </button>
              </div>
            </section>

            {/* Connection Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Server size={14} />
                Router Connection
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Host / IP Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="192.168.88.1"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm"
                    />
                    <Settings className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Port</label>
                    <input 
                      type="text" 
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>
                <button 
                  onClick={fetchProfiles}
                  disabled={loading || !host}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  Fetch Profiles
                </button>
              </div>
            </section>

            {/* Generation Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <PlusCircle size={14} />
                Card Parameters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">User Profile</label>
                  <select 
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
                  >
                    {profiles.length === 0 && <option>Fetch profiles first...</option>}
                    {profiles.map(p => (
                      <option key={p['.id']} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Length</label>
                    <input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prefix (Optional)</label>
                  <input 
                    type="text" 
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. WIFI-"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Card Type</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setType('user_only')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${type === 'user_only' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      User = Pass
                    </button>
                    <button 
                      onClick={() => setType('user_pass')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${type === 'user_pass' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      User & Pass
                    </button>
                  </div>
                </div>
                <button 
                  onClick={generateCards}
                  disabled={loading || !selectedProfile}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                  Generate Cards
                </button>
              </div>
            </section>
          </aside>

          {/* Main Content - Preview */}
          <main className="lg:col-span-8 space-y-6">
            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-center gap-3"
                >
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-medium">Successfully generated {generatedUsers.length} users in MikroTik!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-bottom border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-700">Card Preview</h3>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 min-h-[400px]">
                {generatedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                    <Printer size={48} strokeWidth={1} className="mb-4 opacity-20" />
                    <p className="text-sm">Generated cards will appear here</p>
                  </div>
                ) : (
                  <div 
                    ref={printRef}
                    className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}
                  >
                    {generatedUsers.map((user, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={idx}
                        className={`relative border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Wifi size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Hotspot Card</p>
                            <p className="text-xs font-semibold text-slate-600">{user.profile}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">User</span>
                            <span className="text-sm font-mono font-bold text-slate-800">{user.username}</span>
                          </div>
                          {user.password && user.password !== user.username && (
                            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Pass</span>
                              <span className="text-sm font-mono font-bold text-slate-800">{user.password}</span>
                            </div>
                          )}
                        </div>

                        {/* Print-only styles for the card */}
                        <div className="hidden print:block card-print">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>WIFI ACCESS</div>
                            <div style={{ marginLeft: 'auto', fontSize: '10px' }}>{user.profile}</div>
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <span style={{ fontSize: '10px', color: '#666' }}>USERNAME:</span>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>{user.username}</div>
                          </div>
                          {user.password && user.password !== user.username && (
                            <div>
                              <span style={{ fontSize: '10px', color: '#666' }}>PASSWORD:</span>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>{user.password}</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
