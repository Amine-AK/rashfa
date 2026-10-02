import React, { useState, useEffect } from 'react';
import { DailyRecord, DailySummary, PurchaseEntry, PersonalSpendEntry, DebtPaymentEntry } from '../types';
import { Lock, Unlock, Scale, ShoppingBag, Wallet, AlertTriangle, CheckCircle2, Plus, Trash2, ArrowRight } from 'lucide-react';

interface ClosingRoutineProps {
  record: DailyRecord;
  summary: DailySummary;
  purchases: PurchaseEntry[];
  personalSpend: PersonalSpendEntry[];
  debtPayments: DebtPaymentEntry[];
  onUpdateMolanEnd: (grams: number) => Promise<void>;
  onAddPurchase: (item: string, costMAD: number, category: PurchaseEntry['category']) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  onAddPersonalSpend: (description: string, amountMAD: number) => Promise<void>;
  onDeletePersonalSpend: (id: string) => Promise<void>;
  onAddDebtPayment: (description: string, amountMAD: number) => Promise<void>;
  onDeleteDebtPayment: (id: string) => Promise<void>;
  onCloseDay: (actualCashMAD: number, molanEndGrams: number, notes?: string) => Promise<void>;
  onReopenDay: () => Promise<void>;
}

const COMMON_PURCHASES = [
  { item: 'Milk 10L (Lait)', costMAD: 80, category: 'dairy' as const },
  { item: 'Coffee Beans 5kg (Café Grain)', costMAD: 900, category: 'beans' as const },
  { item: 'Sugar 5kg (Sucre)', costMAD: 35, category: 'other' as const },
  { item: 'Cups 8oz (Gobelets 100pcs)', costMAD: 45, category: 'packaging' as const },
  { item: 'Ice Bag 5kg (Glaçons)', costMAD: 25, category: 'other' as const },
  { item: 'Syrup Bottle (Sirop)', costMAD: 65, category: 'syrup' as const },
];

export const ClosingRoutine: React.FC<ClosingRoutineProps> = ({
  record,
  summary,
  purchases,
  personalSpend,
  debtPayments,
  onUpdateMolanEnd,
  onAddPurchase,
  onDeletePurchase,
  onAddPersonalSpend,
  onDeletePersonalSpend,
  onAddDebtPayment,
  onDeleteDebtPayment,
  onCloseDay,
  onReopenDay,
}) => {
  const [molanEndInput, setMolanEndInput] = useState<number>(
    record.molanEndGrams ?? record.molanStartGrams
  );
  const [actualCashInput, setActualCashInput] = useState<string>(
    record.actualCashCountedMAD !== undefined ? String(record.actualCashCountedMAD) : ''
  );
  const [notesInput, setNotesInput] = useState<string>(record.notes || '');

  // Custom Purchase Form
  const [customItem, setCustomItem] = useState('');
  const [customCost, setCustomCost] = useState('');

  // Custom Personal Spend Form
  const [personalDesc, setPersonalDesc] = useState('');
  const [personalAmount, setPersonalAmount] = useState('');

  useEffect(() => {
    if (record.molanEndGrams !== undefined) {
      setMolanEndInput(record.molanEndGrams);
    }
  }, [record.molanEndGrams]);

  const handleMolanChange = (newGrams: number) => {
    const valid = Math.max(0, Math.min(record.molanStartGrams, newGrams));
    setMolanEndInput(valid);
    onUpdateMolanEnd(valid);
  };

  const handleAddCustomPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customCost);
    if (customItem.trim() && !isNaN(cost) && cost > 0) {
      onAddPurchase(customItem.trim(), cost, 'other');
      setCustomItem('');
      setCustomCost('');
    }
  };

  const handleAddPersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(personalAmount);
    if (personalDesc.trim() && !isNaN(amt) && amt > 0) {
      onAddPersonalSpend(personalDesc.trim(), amt);
      setPersonalDesc('');
      setPersonalAmount('');
    }
  };

  const handleFinalSubmitClose = () => {
    const cashCount = parseFloat(actualCashInput);
    if (isNaN(cashCount) || cashCount < 0) {
      alert('Please enter a valid actual cash count.');
      return;
    }
    onCloseDay(cashCount, molanEndInput, notesInput);
  };

  const consumptionGrams = Math.max(0, record.molanStartGrams - molanEndInput);

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 pb-28 space-y-4">
      {/* Header Status Banner */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lock className={`w-5 h-5 ${summary.isClosed ? 'text-amber-400' : 'text-stone-400'}`} />
            <h2 className="text-lg font-bold text-stone-100">End of Day Closing Routine</h2>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Single-screen cash register reconciliation & inventory audit for <span className="font-mono text-amber-300 font-bold">{summary.dayId}</span>
          </p>
        </div>

        {summary.isClosed ? (
          <button
            onClick={onReopenDay}
            className="flex items-center gap-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow"
          >
            <Unlock className="w-4 h-4" />
            <span>Re-open Day for Edits</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Day is Open</span>
          </div>
        )}
      </div>

      {/* STEP 1: Molan Coffee Hopper Inventory Audit */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-stone-100">1. Molan Bean Hopper Level</h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Start: {record.molanStartGrams}g</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
          <div>
            <label className="text-xs font-medium text-stone-400 block mb-1">
              End Reading Remaining in Hopper (Grams)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMolanChange(molanEndInput - 100)}
                className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-lg border border-stone-700 active:scale-95"
              >
                -100
              </button>
              <button
                type="button"
                onClick={() => handleMolanChange(molanEndInput - 50)}
                className="w-9 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-xs border border-stone-700 active:scale-95"
              >
                -50
              </button>
              <input
                type="number"
                value={molanEndInput}
                onChange={(e) => handleMolanChange(parseInt(e.target.value) || 0)}
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-center text-xl font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleMolanChange(molanEndInput + 50)}
                className="w-9 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-xs border border-stone-700 active:scale-95"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => handleMolanChange(molanEndInput + 100)}
                className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 font-bold text-stone-200 text-lg border border-stone-700 active:scale-95"
              >
                +100
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={record.molanStartGrams}
              step={50}
              value={molanEndInput}
              onChange={(e) => handleMolanChange(parseInt(e.target.value))}
              className="w-full mt-3 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Auto-Calculated Coffee Consumption */}
          <div className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Consumed Beans Today:</span>
              <span className="font-bold text-amber-300 font-mono">
                {consumptionGrams}g ({summary.beanConsumptionKg} kg)
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Bean Efficiency Ratio:</span>
              <span className="font-bold text-amber-300 font-mono">
                {summary.beanEfficiencyGramsPerDrink} g / espresso drink
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-stone-800">
              <span className="text-stone-400">Calculated Bean Cost:</span>
              <span className="font-bold text-stone-200 font-mono">{summary.beanCostMAD} MAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Restocking Purchases / Supplies */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-stone-100">2. Restocking Purchases & Supplies</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Total: {summary.purchasesTotalMAD} MAD
          </span>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <p className="text-xs text-stone-400 mb-1.5">Tap to quick-add common expenses:</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PURCHASES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onAddPurchase(p.item, p.costMAD, p.category)}
                className="bg-stone-800 hover:bg-emerald-950 hover:border-emerald-700 text-stone-200 border border-stone-700 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>{p.item}</span>
                <span className="font-mono text-emerald-400 font-bold ml-0.5">({p.costMAD} MAD)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Purchase Entry Form */}
        <form onSubmit={handleAddCustomPurchase} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Custom item (e.g. Napkins)"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="MAD"
            value={customCost}
            onChange={(e) => setCustomCost(e.target.value)}
            className="w-24 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Purchase Itemized List */}
        {purchases.length > 0 && (
          <div className="space-y-1 mt-2">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="bg-stone-950 border border-stone-850 px-3 py-2 rounded-xl flex items-center justify-between text-xs"
              >
                <span className="text-stone-200 font-medium">{p.item}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-400 font-mono">{p.costMAD} MAD</span>
                  <button
                    onClick={() => onDeletePurchase(p.id)}
                    className="text-stone-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 3: Owner Personal Spending & Debt Payments */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-stone-100">3. Owner Cash Withdrawals & Debts</h3>
          </div>
          <span className="text-xs text-amber-400 font-mono font-bold">
            Total: {summary.personalSpendTotalMAD + summary.debtPaymentsTotalMAD} MAD
          </span>
        </div>

        <form onSubmit={handleAddPersonal} className="flex gap-2">
          <input
            type="text"
            placeholder="Reason (e.g. Owner Lunch / Taxi / Loan)"
            value={personalDesc}
            onChange={(e) => setPersonalDesc(e.target.value)}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            placeholder="MAD"
            value={personalAmount}
            onChange={(e) => setPersonalAmount(e.target.value)}
            className="w-24 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {personalSpend.length > 0 && (
          <div className="space-y-1">
            {personalSpend.map((ps) => (
              <div
                key={ps.id}
                className="bg-stone-950 border border-stone-850 px-3 py-2 rounded-xl flex items-center justify-between text-xs"
              >
                <span className="text-stone-200">{ps.description}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-400 font-mono">{ps.amountMAD} MAD</span>
                  <button
                    onClick={() => onDeletePersonalSpend(ps.id)}
                    className="text-stone-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 4 & 5: Cash Register Reconciliation (Side-by-Side Expected vs Actual) */}
      <div className="bg-stone-900 border-2 border-amber-600/40 p-5 rounded-2xl space-y-4 shadow-2xl">
        <h3 className="font-extrabold text-base text-stone-100 flex items-center gap-2">
          <span>4. Cash Register Count & Financial Reconciliation</span>
        </h3>

        {/* Expected Cash Calculation Breakdown */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-stone-300">
            <span>(+) Gross Sales Revenue (Paid):</span>
            <span className="text-emerald-400 font-bold">{summary.grossRevenueMAD} MAD</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>(-) Restocking Purchases:</span>
            <span className="text-rose-400 font-bold">-{summary.purchasesTotalMAD} MAD</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>(-) Owner Personal Withdrawals:</span>
            <span className="text-amber-400 font-bold">-{summary.personalSpendTotalMAD} MAD</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>(-) Debt Payments:</span>
            <span className="text-amber-400 font-bold">-{summary.debtPaymentsTotalMAD} MAD</span>
          </div>
          <div className="h-px bg-stone-800 my-1" />
          <div className="flex justify-between text-sm font-extrabold text-stone-100 pt-1">
            <span>EXPECTED CASH IN REGISTER:</span>
            <span className="text-amber-300 text-base">{summary.expectedCashMAD} MAD</span>
          </div>
        </div>

        {/* Actual Physical Cash Counted Input */}
        <div>
          <label className="text-xs font-bold text-stone-300 block mb-1 uppercase tracking-wider">
            Enter Actual Physical Cash Counted in Register (MAD):
          </label>
          <input
            type="number"
            placeholder="e.g. 1450"
            value={actualCashInput}
            onChange={(e) => setActualCashInput(e.target.value)}
            className="w-full bg-stone-950 border-2 border-amber-500/80 rounded-2xl px-4 py-3 text-2xl font-black font-mono text-amber-300 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Live Variance Highlight */}
        {actualCashInput !== '' && !isNaN(parseFloat(actualCashInput)) && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              summary.cashVarianceMAD !== undefined && summary.cashVarianceMAD >= 0
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border-rose-700 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {summary.cashVarianceMAD !== undefined && summary.cashVarianceMAD >= 0 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-xs uppercase tracking-wide">Cash Count Variance</p>
                <p className="text-[11px] opacity-90">
                  {summary.cashVarianceMAD !== undefined && summary.cashVarianceMAD >= 0
                    ? 'Register cash matches or exceeds expectation.'
                    : 'Register cash is lower than calculated sales minus cash outflows.'}
                </p>
              </div>
            </div>

            <div className="text-right font-mono">
              <p className="text-2xl font-black">
                {summary.cashVarianceMAD !== undefined && summary.cashVarianceMAD > 0 ? '+' : ''}
                {summary.cashVarianceMAD} <span className="text-xs">MAD</span>
              </p>
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <label className="text-xs font-medium text-stone-400 block mb-1">Closing Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="e.g. Extra busy lunch service, minor cup spill"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-stone-700"
          />
        </div>

        {/* Close Day Submit Button */}
        {!summary.isClosed ? (
          <button
            type="button"
            onClick={handleFinalSubmitClose}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98"
          >
            <Lock className="w-5 h-5" />
            <span>Lock & Close the Day</span>
          </button>
        ) : (
          <div className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-center text-xs text-amber-400 font-semibold">
            Day is locked & closed. Tap "Re-open Day for Edits" above if you need to adjust entries.
          </div>
        )}
      </div>
    </div>
  );
};
