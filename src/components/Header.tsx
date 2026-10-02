import React from 'react';
import { DailySummary } from '../types';
import { Coffee, Lock, DollarSign, Gift, Layers, BarChart3, Receipt, Settings, ShoppingBag } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-stone-800 shadow-xl">
      {/* Top Bar: Revenue, Net Cash, Mode Switch */}
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
    </header>
  );
};
