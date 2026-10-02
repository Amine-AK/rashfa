import React, { useState } from 'react';
import { DailySummary } from '../types';
import { Coffee, Lock, DollarSign, Gift, Layers, BarChart3, Receipt, Settings, ShoppingBag, Cloud, Check, X } from 'lucide-react';
import { syncToNeonDB } from '../db/neon';
import { db } from '../db';

interface HeaderProps {
  summary: DailySummary;
  activeTab: 'grid' | 'expenses' | 'closing' | 'dashboard' | 'ledger' | 'catalog';
  setActiveTab: (tab: 'grid' | 'expenses' | 'closing' | 'dashboard' | 'ledger' | 'catalog') => void;
  isKossorMode: boolean;
  setIsKossorMode: (mode: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  activeTab,
  setActiveTab,
  isKossorMode,
  setIsKossorMode,
}) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [neonUrl, setNeonUrl] = useState(import.meta.env.VITE_DATABASE_URL || '');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToNeon = async () => {
    if (!neonUrl.trim()) {
      alert('Please enter your Neon PostgreSQL Connection String (DATABASE_URL).');
      return;
    }
    try {
      setIsSyncing(true);
      setSyncStatus('Connecting to Neon DB...');
      const drinks = await db.drinks.toArray();
      const records = await db.dailyRecords.toArray();
      const sales = await db.sales.toArray();
      const purchases = await db.purchases.toArray();

      await syncToNeonDB(neonUrl.trim(), drinks, records, sales, purchases);
      setSyncStatus('Successfully backed up to Neon DB!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Sync Error: ${err.message || 'Failed to sync'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-stone-800 shadow-xl">
      {/* Top Bar: Revenue, Net Cash, Mode Switch, Neon Cloud Sync */}
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Status */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-100 text-sm tracking-tight">RASHFA</span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    summary.isClosed
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {summary.isClosed ? 'Closed' : 'Live'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">{summary.dayId}</p>
            </div>
          </div>

          {/* Core Numbers - Header Financial Truth */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl">
              <div className="text-right">
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Gross Sales</p>
                <p className="text-base font-extrabold text-emerald-400 font-mono leading-none">
                  {summary.grossRevenueMAD} <span className="text-xs font-normal">MAD</span>
                </p>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div className="text-right">
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">Net Cash</p>
                <p className="text-base font-extrabold text-amber-400 font-mono leading-none">
                  {summary.netCashPositionMAD} <span className="text-xs font-normal">MAD</span>
                </p>
              </div>
            </div>

            {/* Neon Cloud Sync Button */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-cyan-400 border border-cyan-800/60 transition-all shadow"
              title="Neon PostgreSQL Cloud Backup"
            >
              <Cloud className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector & Navigation */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Mode Switch: Sales vs Kossor (Comp) Mode */}
          <div className="grid grid-cols-2 p-1 bg-stone-900 rounded-xl border border-stone-800 w-48 shadow-inner">
            <button
              onClick={() => setIsKossorMode(false)}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isKossorMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Paid Sale</span>
            </button>
            <button
              onClick={() => setIsKossorMode(true)}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isKossorMode
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Kossor</span>
            </button>
          </div>

          {/* Quick Nav Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'grid'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Log Drinks</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('closing')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'closing'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Close Day</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Neon DB Backup Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-cyan-500/40 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-stone-100 text-sm">Neon PostgreSQL Backup & Sync</h4>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-400 leading-relaxed">
                Connect your free <strong className="text-stone-200">Neon.tech</strong> PostgreSQL database to backup all sales, expenses, and daily closings to the cloud.
              </p>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Neon DATABASE_URL</label>
                <input
                  type="password"
                  placeholder="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
                  value={neonUrl}
                  onChange={(e) => setNeonUrl(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {syncStatus && (
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs font-mono text-cyan-300">
                  {syncStatus}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncToNeon}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>{isSyncing ? 'Syncing...' : 'Sync to Neon DB'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
