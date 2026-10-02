import React, { useState } from 'react';
import { Drink, DrinkCategory, Modifier } from '../types';
import { Plus, Check, Undo2, Flame, Snowflake, Citrus, Droplets, Sparkles, AlertCircle } from 'lucide-react';

interface DrinkGridProps {
  drinks: Drink[];
  modifiers: Modifier[];
  isKossorMode: boolean;
  onLogSale: (drink: Drink, selectedModifiers: Modifier[]) => Promise<void>;
  onLogKossor: (drink: Drink, selectedModifiers: Modifier[], reason: 'staff' | 'comp' | 'waste') => Promise<void>;
  onUndoLastAction: () => Promise<void>;
  lastLoggedActionText?: string;
  isDayClosed: boolean;
}

export const DrinkGrid: React.FC<DrinkGridProps> = ({
  drinks,
  modifiers,
  isKossorMode,
  onLogSale,
  onLogKossor,
  onUndoLastAction,
  lastLoggedActionText,
  isDayClosed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | 'all'>('all');
  const [activeModifiers, setActiveModifiers] = useState<Modifier[]>([]);
  const [kossorReason, setKossorReason] = useState<'staff' | 'comp' | 'waste'>('staff');
  const [tappedDrinkId, setTappedDrinkId] = useState<string | null>(null);

  const categories: { id: DrinkCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Drinks', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'hot', label: 'Hot Drinks', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'cold', label: 'Cold Drinks', icon: <Snowflake className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'mojito', label: 'Mojitos', icon: <Citrus className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'water_other', label: 'Water & Misc', icon: <Droplets className="w-3.5 h-3.5 text-blue-400" /> },
  ];

  const filteredDrinks = drinks.filter(
    (d) => d.active && (selectedCategory === 'all' || d.category === selectedCategory)
  );

  const toggleModifier = (mod: Modifier) => {
    setActiveModifiers((prev) =>
      prev.some((m) => m.id === mod.id)
        ? prev.filter((m) => m.id !== mod.id)
        : [...prev, mod]
    );
  };

  const handleDrinkTap = async (drink: Drink) => {
    if (isDayClosed) return;
    setTappedDrinkId(drink.id);
    setTimeout(() => setTappedDrinkId(null), 300);

    if (!isKossorMode) {
      await onLogSale(drink, activeModifiers);
    } else {
      await onLogKossor(drink, activeModifiers, kossorReason);
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-24 max-w-7xl mx-auto px-3 pt-2">
      {/* Day Closed Alert Banner */}
      {isDayClosed && (
        <div className="bg-amber-950/90 border border-amber-700/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>This day is closed. Logging is locked. Reopen in "Close Day" tab to make edits.</span>
          </div>
        </div>
      )}

      {/* Kossor Banner & Reason Selector when in Kossor Mode */}
      {isKossorMode && (
        <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wide">Kossor Mode (Free / Staff Drink)</span>
          </div>
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-lg border border-rose-900 text-xs font-semibold">
            {(['staff', 'comp', 'waste'] as const).map((reason) => (
              <button
                key={reason}
                onClick={() => setKossorReason(reason)}
                className={`px-2.5 py-1 rounded capitalize transition-all ${
                  kossorReason === reason
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Undo & Confirmation Bar */}
      {lastLoggedActionText && (
        <div className="bg-emerald-950/90 border border-emerald-700/80 px-3 py-2 rounded-xl flex items-center justify-between text-emerald-200 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{lastLoggedActionText}</span>
          </div>
          <button
            onClick={onUndoLastAction}
            className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Modifier Selector Bar (Tap to toggle before tapping drink) */}
      {modifiers.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Modifiers:
          </span>
          {modifiers.map((mod) => {
            const isSelected = activeModifiers.some((m) => m.id === mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => toggleModifier(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md font-bold'
                    : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                {mod.name}
                {mod.priceUpchargeMAD > 0 && ` (+${mod.priceUpchargeMAD} MAD)`}
              </button>
            );
          })}
        </div>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-5 gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-bold shadow-md'
                : 'bg-stone-900/80 text-stone-400 border-stone-800/80 hover:bg-stone-800'
            }`}
          >
            {cat.icon}
            <span className="text-[10px] mt-1 truncate w-full font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-3s Tap-to-Log Drink Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mt-1">
        {filteredDrinks.map((drink) => {
          const isTapped = tappedDrinkId === drink.id;
          const upcharge = activeModifiers.reduce((sum, m) => sum + m.priceUpchargeMAD, 0);
          const finalPrice = drink.defaultPriceMAD + upcharge;

          return (
            <button
              key={drink.id}
              disabled={isDayClosed}
              onClick={() => handleDrinkTap(drink)}
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-100 select-none active:scale-95 min-h-[96px] ${
                isDayClosed
                  ? 'bg-stone-900/40 border-stone-800 opacity-50 cursor-not-allowed'
                  : isTapped
                  ? isKossorMode
                    ? 'bg-rose-600 border-rose-400 scale-95 shadow-lg text-white'
                    : 'bg-emerald-600 border-emerald-400 scale-95 shadow-lg text-white'
                  : isKossorMode
                  ? 'bg-stone-900 hover:bg-rose-950/40 border-stone-800 hover:border-rose-700/60 text-stone-100 shadow'
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-amber-600/50 text-stone-100 shadow'
              }`}
            >
              {/* Drink Name */}
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-sm tracking-tight leading-snug line-clamp-2">
                  {drink.name}
                </span>
                {drink.isEspressoBased && (
                  <span className="text-[10px] bg-stone-800 text-amber-300 font-mono px-1.5 py-0.5 rounded shrink-0 border border-stone-700">
                    {drink.beanWeightGrams}g
                  </span>
                )}
              </div>

              {/* Pricing Details */}
              <div className="flex items-end justify-between mt-2 pt-1 border-t border-stone-800/60">
                <div>
                  {!isKossorMode ? (
                    <span className="text-lg font-black font-mono text-emerald-400 group-hover:text-emerald-300">
                      {finalPrice}{' '}
                      <span className="text-xs font-semibold text-emerald-500">MAD</span>
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-rose-400">KOSSOR (FREE)</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Cost: {drink.costToMakeMAD} MAD
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black transition-all ${
                    isKossorMode
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
