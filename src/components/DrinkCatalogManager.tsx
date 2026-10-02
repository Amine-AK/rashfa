import React, { useState } from 'react';
import { Drink, DrinkCategory, ExpenseShortcut, ExpenseCategory } from '../types';
import { Settings, Plus, Edit2, Check, Coffee, Eye, EyeOff, Tag, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { clearAllTransactionData } from '../repositories';

interface DrinkCatalogManagerProps {
  drinks: Drink[];
  shortcuts: ExpenseShortcut[];
  onSaveDrink: (drink: Drink) => Promise<void>;
  onToggleActiveDrink: (id: string) => Promise<void>;
  onSaveShortcut: (shortcut: ExpenseShortcut) => Promise<void>;
  onDeleteShortcut: (id: string) => Promise<void>;
  onToggleActiveShortcut: (id: string) => Promise<void>;
}

export const DrinkCatalogManager: React.FC<DrinkCatalogManagerProps> = ({
  drinks,
  shortcuts,
  onSaveDrink,
  onToggleActiveDrink,
  onSaveShortcut,
  onDeleteShortcut,
  onToggleActiveShortcut,
}) => {
  const [catalogTab, setCatalogTab] = useState<'drinks' | 'expenses'>('drinks');
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  // Drink Form State
  const [isCreatingDrink, setIsCreatingDrink] = useState(false);
  const [editingDrinkId, setEditingDrinkId] = useState<string | null>(null);
  const [drinkName, setDrinkName] = useState('');
  const [drinkCategory, setDrinkCategory] = useState<DrinkCategory>('hot');
  const [priceMAD, setPriceMAD] = useState('');
  const [costToMakeMAD, setCostToMakeMAD] = useState('');
  const [beanWeightGrams, setBeanWeightGrams] = useState('9');
  const [isEspressoBased, setIsEspressoBased] = useState(true);

  // Expense Shortcut Form State
  const [isCreatingShortcut, setIsCreatingShortcut] = useState(false);
  const [editingShortcutId, setEditingShortcutId] = useState<string | null>(null);
  const [scName, setScName] = useState('');
  const [scDefaultCost, setScDefaultCost] = useState('');
  const [scCategory, setScCategory] = useState<ExpenseCategory>('dairy');

  // Drink Handlers
  const startEditDrink = (drink: Drink) => {
    setEditingDrinkId(drink.id);
    setDrinkName(drink.name);
    setDrinkCategory(drink.category);
    setPriceMAD(String(drink.defaultPriceMAD));
    setCostToMakeMAD(String(drink.costToMakeMAD));
    setBeanWeightGrams(String(drink.beanWeightGrams));
    setIsEspressoBased(drink.isEspressoBased);
    setIsCreatingDrink(false);
  };

  const startCreateDrink = () => {
    setEditingDrinkId(null);
    setDrinkName('');
    setDrinkCategory('hot');
    setPriceMAD('');
    setCostToMakeMAD('');
    setBeanWeightGrams('9');
    setIsEspressoBased(true);
    setIsCreatingDrink(true);
  };

  const handleSaveDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceMAD);
    const cost = parseFloat(costToMakeMAD) || 0;
    const beanWeight = parseFloat(beanWeightGrams) || 0;

    if (!drinkName.trim() || isNaN(price) || price < 0) {
      alert('Please enter a valid drink name and price.');
      return;
    }

    const newDrink: Drink = {
      id: editingDrinkId || `drink_custom_${Date.now()}`,
      name: drinkName.trim(),
      category: drinkCategory,
      defaultPriceMAD: price,
      costToMakeMAD: cost,
      beanWeightGrams: beanWeight,
      isEspressoBased,
      active: true,
    };

    await onSaveDrink(newDrink);
    setIsCreatingDrink(false);
    setEditingDrinkId(null);
  };

  // Expense Shortcut Handlers
  const startEditShortcut = (s: ExpenseShortcut) => {
    setEditingShortcutId(s.id);
    setScName(s.name);
    setScDefaultCost(String(s.defaultCostMAD));
    setScCategory(s.category);
    setIsCreatingShortcut(false);
  };

  const startCreateShortcut = () => {
    setEditingShortcutId(null);
    setScName('');
    setScDefaultCost('');
    setScCategory('dairy');
    setIsCreatingShortcut(true);
  };

  const handleSaveShortcut = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultCost = parseFloat(scDefaultCost);
    if (!scName.trim() || isNaN(defaultCost) || defaultCost < 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    const newShortcut: ExpenseShortcut = {
      id: editingShortcutId || `exp_sc_${Date.now()}`,
      name: scName.trim(),
      defaultCostMAD: defaultCost,
      category: scCategory,
      active: true,
    };

    await onSaveShortcut(newShortcut);
    setIsCreatingShortcut(false);
    setEditingShortcutId(null);
  };

  // Clear DB Data (Except Drink Menu Catalog)
  const handleConfirmClearDbData = async () => {
    try {
      await clearAllTransactionData();
      setClearStatus('Sales and transaction data cleared! Your drink menu catalog is preserved.');
      setTimeout(() => {
        setClearStatus(null);
        setShowClearModal(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert(`Error clearing data: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 pb-28 space-y-4">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-stone-100">Master Catalog & Database Management</h2>
            <p className="text-xs text-stone-400">Manage drinks menu, prices, and test data reset</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setCatalogTab('drinks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                catalogTab === 'drinks'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Drinks Catalog</span>
            </button>
            <button
              onClick={() => setCatalogTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                catalogTab === 'expenses'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Expense Shortcuts</span>
            </button>
          </div>

          {/* TEST BUTTON TO CLEAR DB DATA (PRESERVING MENU) */}
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow"
            title="Reset Sales & Expense Data (Keep Menu)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sales Data</span>
          </button>
        </div>
      </div>

      {/* DRINKS CATALOG TAB */}
      {catalogTab === 'drinks' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-300">Drinks Catalog ({drinks.length} items)</h3>
            <button
              onClick={startCreateDrink}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Drink</span>
            </button>
          </div>

          {/* Add / Edit Form Drawer */}
          {(isCreatingDrink || editingDrinkId) && (
            <form onSubmit={handleSaveDrink} className="bg-stone-900 border border-amber-600/40 p-4 rounded-2xl space-y-3 shadow-xl">
              <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>{isCreatingDrink ? 'Create Custom Drink' : 'Edit Drink Catalog Entry'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Drink Name (French/Darija/English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Avocado Smoothie"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Category</label>
                  <select
                    value={drinkCategory}
                    onChange={(e) => setDrinkCategory(e.target.value as DrinkCategory)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="hot">Hot Coffee & Tea</option>
                    <option value="cold">Cold Coffee & Shakes</option>
                    <option value="mojito">Mojitos</option>
                    <option value="water_other">Water & Refreshment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Menu Sales Price (MAD)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 15"
                    value={priceMAD}
                    onChange={(e) => setPriceMAD(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Cost-To-Make (Ingredient MAD)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.5"
                    value={costToMakeMAD}
                    onChange={(e) => setCostToMakeMAD(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-rose-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Bean Weight Per Drink (Grams)</label>
                  <input
                    type="number"
                    placeholder="9"
                    value={beanWeightGrams}
                    onChange={(e) => setBeanWeightGrams(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isEspresso"
                    checked={isEspressoBased}
                    onChange={(e) => setIsEspressoBased(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="isEspresso" className="text-xs text-stone-300 font-medium cursor-pointer">
                    Espresso-Based (Track bean ratio)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingDrink(false);
                    setEditingDrinkId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold"
                >
                  Save Drink
                </button>
              </div>
            </form>
          )}

          {/* Catalog Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow">
            <div className="divide-y divide-stone-800">
              {drinks.map((drink) => (
                <div
                  key={drink.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    !drink.active ? 'opacity-40 bg-stone-950/40' : 'hover:bg-stone-850/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-sm">{drink.name}</span>
                      <span className="text-[10px] uppercase font-mono bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">
                        {drink.category}
                      </span>
                      {drink.isEspressoBased && (
                        <span className="text-[10px] bg-stone-800 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                          {drink.beanWeightGrams}g beans
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-mono mt-0.5">
                      <span>Price: <strong className="text-emerald-400">{drink.defaultPriceMAD} MAD</strong></span>
                      <span>Cost: <strong className="text-rose-400">{drink.costToMakeMAD} MAD</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditDrink(drink)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleActiveDrink(drink.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        drink.active
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-stone-800 border-stone-700 text-stone-500'
                      }`}
                    >
                      {drink.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE SHORTCUTS CATALOG TAB */}
      {catalogTab === 'expenses' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-300">Expense Shortcuts Catalog ({shortcuts.length} items)</h3>
            <button
              onClick={startCreateShortcut}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense Shortcut</span>
            </button>
          </div>

          {/* Add / Edit Form Drawer */}
          {(isCreatingShortcut || editingShortcutId) && (
            <form onSubmit={handleSaveShortcut} className="bg-stone-900 border border-emerald-600/40 p-4 rounded-2xl space-y-3 shadow-xl">
              <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>{isCreatingShortcut ? 'Create Expense Shortcut' : 'Edit Expense Shortcut'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Item Name (e.g. 1L Milk UHT, 1Kg Banana)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1L Milk UHT"
                    value={scName}
                    onChange={(e) => setScName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Default Cost (DH / MAD)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 10"
                    value={scDefaultCost}
                    onChange={(e) => setScDefaultCost(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">Category</label>
                  <select
                    value={scCategory}
                    onChange={(e) => setScCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dairy">Dairy (Lait)</option>
                    <option value="fruit">Fruit (Banane/Citron)</option>
                    <option value="beans">Coffee Beans (Café)</option>
                    <option value="packaging">Packaging (Gobelets)</option>
                    <option value="syrup">Syrups & Flavors</option>
                    <option value="other">Other Supplies</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingShortcut(false);
                    setEditingShortcutId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          )}

          {/* Shortcuts Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow">
            <div className="divide-y divide-stone-800">
              {shortcuts.map((sc) => (
                <div
                  key={sc.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    !sc.active ? 'opacity-40 bg-stone-950/40' : 'hover:bg-stone-850/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-sm">{sc.name}</span>
                      <span className="text-[10px] uppercase font-mono bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">
                        {sc.category}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      Default Price: <strong className="text-emerald-400">{sc.defaultCostMAD} MAD / DH</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditShortcut(sc)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleActiveShortcut(sc.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        sc.active
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-stone-800 border-stone-700 text-stone-500'
                      }`}
                    >
                      {sc.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteShortcut(sc.id)}
                      className="p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLEAR TEST DATA CONFIRMATION MODAL (PRESERVES MENU) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-600/40 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-stone-100 text-sm">Reset All Sales & Transaction Data</h4>
              </div>
              <button onClick={() => setShowClearModal(false)} className="text-stone-400 hover:text-stone-200">
                <Trash2 className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
              <p>
                This will clear all logged <strong className="text-stone-100">Sales, Kossor comps, Purchases, Personal Withdrawals, and Daily Closing records</strong>.
              </p>
              <p className="bg-emerald-950/80 border border-emerald-800 p-2.5 rounded-xl text-emerald-300 font-medium">
                ✓ Your full Drink Menu Catalog & Expense Shortcuts will remain completely intact.
              </p>
              {clearStatus && (
                <p className="font-mono text-emerald-400 font-bold bg-stone-950 p-2 rounded-lg">
                  {clearStatus}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearDbData}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
