import React, { useState } from 'react';
import { SaleEntry, KossorEntry, PurchaseEntry } from '../types';
import { Receipt, Undo2, Check, Ban, DollarSign, Gift, ShoppingBag } from 'lucide-react';

interface AuditLedgerProps {
  sales: SaleEntry[];
  kossor: KossorEntry[];
  purchases: PurchaseEntry[];
  onVoidSale: (id: string) => Promise<void>;
  onUnvoidSale: (id: string) => Promise<void>;
  onVoidKossor: (id: string) => Promise<void>;
  onUnvoidKossor: (id: string) => Promise<void>;
  isDayClosed: boolean;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({
  sales,
  kossor,
  purchases,
  onVoidSale,
  onUnvoidSale,
  onVoidKossor,
  onUnvoidKossor,
  isDayClosed,
}) => {
  const [filter, setFilter] = useState<'all' | 'sales' | 'kossor' | 'purchases'>('all');

  // Combine entries into a unified timeline
  const combinedTimeline = [
    ...sales.map((s) => ({ ...s, entryType: 'sale' as const })),
    ...kossor.map((k) => ({ ...k, entryType: 'kossor' as const })),
    ...purchases.map((p) => ({ ...p, entryType: 'purchase' as const, voided: false })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredTimeline = combinedTimeline.filter((item) => {
    if (filter === 'sales') return item.entryType === 'sale';
    if (filter === 'kossor') return item.entryType === 'kossor';
    if (filter === 'purchases') return item.entryType === 'purchase';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 pb-28 space-y-3">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-stone-100">Live Audit Ledger</h2>
            <p className="text-xs text-stone-400">Reversible logging history & entry corrections</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          {(['all', 'sales', 'kossor', 'purchases'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all ${
                filter === f
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {filteredTimeline.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 p-8 rounded-2xl text-center text-stone-500 text-sm">
          No entries recorded for this filter yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTimeline.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            if (item.entryType === 'sale') {
              const sale = item as SaleEntry & { entryType: 'sale' };
              return (
                <div
                  key={sale.id}
                  className={`bg-stone-900 border px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                    sale.voided ? 'border-stone-800 opacity-40 line-through' : 'border-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100 text-sm">{sale.drinkName}</span>
                        {sale.modifierNames && sale.modifierNames.length > 0 && (
                          <span className="text-[10px] bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded">
                            {sale.modifierNames.join(', ')}
                          </span>
                        )}
                        {sale.voided && (
                          <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Voided
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">{timeStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-extrabold text-emerald-400 text-base">+{sale.priceMAD} MAD</span>
                    {!isDayClosed && (
                      <button
                        onClick={() => (sale.voided ? onUnvoidSale(sale.id) : onVoidSale(sale.id))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          sale.voided
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800'
                        }`}
                      >
                        {sale.voided ? 'Restore' : 'Void'}
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            if (item.entryType === 'kossor') {
              const kossorItem = item as KossorEntry & { entryType: 'kossor' };
              return (
                <div
                  key={kossorItem.id}
                  className={`bg-stone-900 border px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                    kossorItem.voided ? 'border-stone-800 opacity-40 line-through' : 'border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center font-bold">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100 text-sm">{kossorItem.drinkName}</span>
                        <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Kossor ({kossorItem.reason})
                        </span>
                        {kossorItem.voided && (
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Voided
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">{timeStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-rose-400 text-sm">
                      Loss: -{kossorItem.costMAD} MAD
                    </span>
                    {!isDayClosed && (
                      <button
                        onClick={() =>
                          kossorItem.voided ? onUnvoidKossor(kossorItem.id) : onVoidKossor(kossorItem.id)
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          kossorItem.voided
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800'
                        }`}
                      >
                        {kossorItem.voided ? 'Restore' : 'Void'}
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            if (item.entryType === 'purchase') {
              const purch = item as PurchaseEntry & { entryType: 'purchase' };
              return (
                <div
                  key={purch.id}
                  className="bg-stone-900 border border-stone-800 px-4 py-3 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-stone-100 text-sm">{purch.item}</span>
                      <span className="text-[11px] text-stone-500 font-mono block">{timeStr}</span>
                    </div>
                  </div>
                  <span className="font-bold text-rose-400 text-sm font-mono">-{purch.costMAD} MAD</span>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};
