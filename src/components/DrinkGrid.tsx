import React, { useState } from 'react';
import { Drink, DrinkCategory, Modifier } from '../types';
import { Plus, Check, Undo2, Flame, Snowflake, Citrus, Droplets, Sparkles, AlertCircle, Sparkle, X } from 'lucide-react';

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
  const [showCustomModModal, setShowCustomModModal] = useState(false);

  // Default +3 DH Flavor Modifier
  const defaultFlavorMod: Modifier = modifiers.find((m) => m.id === 'mod_flavor_joy') || {
    id: 'mod_flavor_joy',
    name: 'Flavor (+3 MAD)',
    priceUpchargeMAD: 3,
    active: true,
  };

  const isFlavorActive = activeModifiers.some((m) => m.id === defaultFlavorMod.id);

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

  const toggleFlavor = () => {
    if (isFlavorActive) {
      setActiveModifiers((prev) => prev.filter((m) => m.id !== defaultFlavorMod.id));
    } else {
      setActiveModifiers((prev) => [...prev, defaultFlavorMod]);
    }
  };

  const toggleCustomModifier = (mod: Modifier) => {
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

      {/* SLEEK MINIMALIST MODIFIER BAR: Single Flavor (+3 DH) Pill + Custom Modifiers Option */}
      <div className="flex items-center justify-between gap-2 bg-stone-900/90 border border-stone-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          {/* Main Clean Flavor Button (+3 DH) */}
          <button
            type="button"
            onClick={toggleFlavor}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow ${
              isFlavorActive
                ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105 shadow-amber-500/20'
                : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:text-amber-300'
            }`}
          >
            <Sparkle className={`w-4 h-4 ${isFlavorActive ? 'fill-stone-950' : 'text-amber-400'}`} />
            <span>Add Flavor (+3 DH)</span>
            {isFlavorActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Active Custom Modifier Badges */}
          {activeModifiers
            .filter((m) => m.id !== defaultFlavorMod.id)
            .map((mod) => (
              <span
                key={mod.id}
                className="bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <span>{mod.name}</span>
                <button
                  type="button"
                  onClick={() => toggleCustomModifier(mod)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>

        {/* Custom Modifier Trigger Button */}
        <button
          type="button"
          onClick={() => setShowCustomModModal(!showCustomModModal)}
          className="text-xs text-stone-400 hover:text-stone-200 font-medium px-2 py-1 rounded-lg hover:bg-stone-800 transition-all flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>More Mods</span>
        </button>
      </div>

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
                      <span className="text-xs font-semibold text-emerald-500">DH</span>
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-rose-400">KOSSOR (FREE)</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Cost: {drink.costToMakeMAD} DH
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

      {/* Custom Modifier Modal / Drawer */}
      {showCustomModModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 className="font-bold text-stone-100 text-sm">Select Custom Modifiers</h4>
              <button
                onClick={() => setShowCustomModModal(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {modifiers.map((mod) => {
                const isSelected = activeModifiers.some((m) => m.id === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleCustomModifier(mod)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-400 shadow'
                        : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>{mod.name}</span>
                    <span className="font-mono">{mod.priceUpchargeMAD > 0 ? `+${mod.priceUpchargeMAD} DH` : 'Free'}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCustomModModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
