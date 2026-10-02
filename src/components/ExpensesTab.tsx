import React, { useState } from 'react';
import { ExpenseShortcut, PurchaseEntry, PersonalSpendShortcut, PersonalSpendEntry, ExpenseCategory, PersonalCategory } from '../types';
import { ShoppingBag, Plus, Trash2, Edit2, Check, X, Tag, Settings, Wallet, User, Coffee, Utensils, Car } from 'lucide-react';

interface ExpensesTabProps {
  shortcuts: ExpenseShortcut[];
  purchases: PurchaseEntry[];
  personalShortcuts: PersonalSpendShortcut[];
  personalSpend: PersonalSpendEntry[];
  onAddPurchase: (item: string, costMAD: number, category: ExpenseCategory) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  onSaveShortcut: (shortcut: ExpenseShortcut) => Promise<void>;
  onDeleteShortcut: (id: string) => Promise<void>;
  onAddPersonalSpend: (description: string, amountMAD: number, category?: PersonalCategory) => Promise<void>;
  onDeletePersonalSpend: (id: string) => Promise<void>;
  onSavePersonalShortcut: (shortcut: PersonalSpendShortcut) => Promise<void>;
  onDeletePersonalShortcut: (id: string) => Promise<void>;
  isDayClosed: boolean;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  shortcuts,
  purchases,
  personalShortcuts,
  personalSpend,
  onAddPurchase,
  onDeletePurchase,
  onSaveShortcut,
  onDeleteShortcut,
  onAddPersonalSpend,
  onDeletePersonalSpend,
  onSavePersonalShortcut,
  onDeletePersonalShortcut,
  isDayClosed,
}) => {
  const [activeSection, setActiveSection] = useState<'business' | 'personal'>('business');

  // Quick Log State for Business Expenses
  const [selectedShortcut, setSelectedShortcut] = useState<ExpenseShortcut | null>(null);
  const [overrideCost, setOverrideCost] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Custom Business Expense Form
  const [customItem, setCustomItem] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customCategory, setCustomCategory] = useState<ExpenseCategory>('other');

  // Personal Spend Quick Log Modal State
  const [selectedPersonalShortcut, setSelectedPersonalShortcut] = useState<PersonalSpendShortcut | null>(null);
  const [personalOverrideAmount, setPersonalOverrideAmount] = useState<string>('');

  // Custom Personal Spend Form
  const [personalDesc, setPersonalDesc] = useState('');
  const [personalAmount, setPersonalAmount] = useState('');

  // Shortcut Catalog Management Toggle
  const [showCatalogEditor, setShowCatalogEditor] = useState(false);

  const totalBusinessExpenses = purchases.reduce((sum, p) => sum + p.costMAD, 0);
  const totalPersonalSpend = personalSpend.reduce((sum, p) => sum + p.amountMAD, 0);

  const activeBusinessShortcuts = shortcuts.filter((s) => s.active);
  const activePersonalShortcuts = personalShortcuts.filter((s) => s.active);

  // Business Expense Handlers
  const handleOpenShortcutModal = (shortcut: ExpenseShortcut) => {
    if (isDayClosed) return;
    setSelectedShortcut(shortcut);
    setOverrideCost(String(shortcut.defaultCostMAD));
    setQuantity(1);
  };

  const handleConfirmShortcutLog = async () => {
    if (!selectedShortcut) return;
    const unitCost = parseFloat(overrideCost);
    if (isNaN(unitCost) || unitCost <= 0 || quantity <= 0) return;

    const totalCost = Math.round(unitCost * quantity * 100) / 100;
    const itemName = quantity > 1 ? `${quantity}x ${selectedShortcut.name}` : selectedShortcut.name;

    await onAddPurchase(itemName, totalCost, selectedShortcut.category);
    setSelectedShortcut(null);
  };

  const handleAddCustomPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDayClosed) return;
    const cost = parseFloat(customCost);
    if (!customItem.trim() || isNaN(cost) || cost <= 0) return;

    await onAddPurchase(customItem.trim(), cost, customCategory);
    setCustomItem('');
    setCustomCost('');
  };

  // Personal Spend Handlers
  const handleOpenPersonalModal = (ps: PersonalSpendShortcut) => {
    if (isDayClosed) return;
    setSelectedPersonalShortcut(ps);
    setPersonalOverrideAmount(String(ps.defaultAmountMAD));
  };

  const handleConfirmPersonalLog = async () => {
    if (!selectedPersonalShortcut) return;
    const amt = parseFloat(personalOverrideAmount);
    if (isNaN(amt) || amt <= 0) return;

    await onAddPersonalSpend(selectedPersonalShortcut.label, amt, selectedPersonalShortcut.category);
    setSelectedPersonalShortcut(null);
  };

  const handleAddCustomPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDayClosed) return;
    const amt = parseFloat(personalAmount);
    if (!personalDesc.trim() || isNaN(amt) || amt <= 0) return;

    await onAddPersonalSpend(personalDesc.trim(), amt, 'other');
    setPersonalDesc('');
    setPersonalAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 pb-28 space-y-4">
      {/* Header Summary Banner */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-100">Expenses & Cash Outflows</h2>
            <p className="text-xs text-stone-400">Track supplies, milk, coffee beans, and personal owner spending</p>
          </div>
        </div>

        {/* Section Switcher & Total Header */}
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs font-bold">
            <button
              onClick={() => setActiveSection('business')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'business'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Restocking ({totalBusinessExpenses} DH)
            </button>
            <button
              onClick={() => setActiveSection('personal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'personal'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Personal ({totalPersonalSpend} DH)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: BUSINESS RESTOCKING EXPENSES */}
      {activeSection === 'business' && (
        <div className="space-y-4">
          {/* QUICK BUSINESS EXPENSE SHORTCUTS TAP GRID */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Restocking Expense Shortcuts</span>
              </h3>
              <span className="text-[11px] text-stone-400">Tap to log milk, coffee beans, fruit</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {activeBusinessShortcuts.map((sc) => (
                <button
                  key={sc.id}
                  disabled={isDayClosed}
                  onClick={() => handleOpenShortcutModal(sc)}
                  className="bg-stone-950 hover:bg-emerald-950/40 border border-stone-800 hover:border-emerald-700/60 p-3 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95 min-h-[80px]"
                >
                  <span className="font-bold text-xs text-stone-100 leading-snug line-clamp-2">
                    {sc.name}
                  </span>
                  <div className="flex items-end justify-between mt-2 pt-1 border-t border-stone-800/60">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {sc.defaultCostMAD} <span className="text-[10px] font-semibold text-emerald-500">DH</span>
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Ad-hoc Expense Form */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-stone-100 border-b border-stone-800 pb-2">
              Add Custom Restocking Expense
            </h3>
            <form onSubmit={handleAddCustomPurchase} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Item description (e.g. Napkins)"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="sm:col-span-2 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.5"
                placeholder="Cost (MAD/DH)"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-rose-400 font-bold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isDayClosed}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </form>
          </div>

          {/* Itemized Expenses Today */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-stone-100">Logged Restocking Expenses Today</h3>
              <span className="text-xs font-mono font-bold text-rose-400">{purchases.length} items</span>
            </div>

            {purchases.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">No restocking expenses logged yet today.</p>
            ) : (
              <div className="space-y-1.5">
                {purchases.map((p) => {
                  const timeStr = new Date(p.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={p.id}
                      className="bg-stone-950 border border-stone-850 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-200">{p.item}</span>
                        <span className="text-[10px] text-stone-500 font-mono block">
                          {p.category} | {timeStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-rose-400 font-mono text-sm">-{p.costMAD} MAD</span>
                        {!isDayClosed && (
                          <button
                            onClick={() => onDeletePurchase(p.id)}
                            className="text-stone-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: PERSONAL EXPENSES & CASH WITHDRAWALS */}
      {activeSection === 'personal' && (
        <div className="space-y-4">
          {/* QUICK PERSONAL EXPENSE SHORTCUTS TAP GRID */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Personal Expenses & Owner Withdrawals</span>
              </h3>
              <span className="text-[11px] text-amber-400 font-mono">Lunch, Coffee, Taxi, Cash Draw</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {activePersonalShortcuts.map((ps) => (
                <button
                  key={ps.id}
                  disabled={isDayClosed}
                  onClick={() => handleOpenPersonalModal(ps)}
                  className="bg-stone-950 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-700/60 p-3 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-95 min-h-[80px]"
                >
                  <span className="font-bold text-xs text-stone-100 leading-snug line-clamp-2">
                    {ps.label}
                  </span>
                  <div className="flex items-end justify-between mt-2 pt-1 border-t border-stone-800/60">
                    <span className="text-sm font-black font-mono text-amber-400">
                      {ps.defaultAmountMAD} <span className="text-[10px] font-semibold text-amber-500">DH</span>
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Personal Spend Form */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-stone-100 border-b border-stone-800 pb-2">
              Add Custom Personal Withdrawal
            </h3>
            <form onSubmit={handleAddCustomPersonal} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Reason (e.g. Personal Lunch / Taxi)"
                value={personalDesc}
                onChange={(e) => setPersonalDesc(e.target.value)}
                className="sm:col-span-2 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                step="0.5"
                placeholder="Amount (MAD/DH)"
                value={personalAmount}
                onChange={(e) => setPersonalAmount(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isDayClosed}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Withdrawal</span>
              </button>
            </form>
          </div>

          {/* Itemized Personal Withdrawals Today */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-stone-100">Logged Personal Expenses Today</h3>
              <span className="text-xs font-mono font-bold text-amber-400">{personalSpend.length} items</span>
            </div>

            {personalSpend.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">No personal expenses logged today.</p>
            ) : (
              <div className="space-y-1.5">
                {personalSpend.map((ps) => {
                  const timeStr = new Date(ps.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={ps.id}
                      className="bg-stone-950 border border-stone-850 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-200">{ps.description}</span>
                        <span className="text-[10px] text-stone-500 font-mono block">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-400 font-mono text-sm">-{ps.amountMAD} MAD</span>
                        {!isDayClosed && (
                          <button
                            onClick={() => onDeletePersonalSpend(ps.id)}
                            className="text-stone-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Expense Quick Modal */}
      {selectedShortcut && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-emerald-600/40 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 className="font-bold text-stone-100 text-sm">{selectedShortcut.name}</h4>
              <button onClick={() => setSelectedShortcut(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1">Unit Price (DH / MAD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={overrideCost}
                  onChange={(e) => setOverrideCost(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-stone-800 text-stone-200 font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono font-bold text-xl text-stone-100">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-stone-800 text-stone-200 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-xl flex justify-between text-xs font-mono">
                <span className="text-stone-400">Total Expense:</span>
                <span className="font-black text-rose-400 text-base">
                  {Math.round((parseFloat(overrideCost) || 0) * quantity * 100) / 100} MAD
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedShortcut(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShortcutLog}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Spend Quick Modal */}
      {selectedPersonalShortcut && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 className="font-bold text-stone-100 text-sm">{selectedPersonalShortcut.label}</h4>
              <button onClick={() => setSelectedPersonalShortcut(null)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1">Amount (DH / MAD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={personalOverrideAmount}
                  onChange={(e) => setPersonalOverrideAmount(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-lg font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPersonalShortcut(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPersonalLog}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Log Personal Spend</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
