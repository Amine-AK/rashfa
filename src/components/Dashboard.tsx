import React, { useState } from 'react';
import { DailySummary, SaleEntry, KossorEntry, Drink } from '../types';
import { ProgressCharts } from './ProgressCharts';
import { ProductAnalytics } from './ProductAnalytics';
import { TrendingUp, TrendingDown, DollarSign, Gift, Scale, Wallet, Download, Calendar, BarChart3, Citrus } from 'lucide-react';

interface DashboardProps {
  summary: DailySummary;
  sales: SaleEntry[];
  kossor: KossorEntry[];
  historicalSummaries: DailySummary[];
  drinks: Drink[];
  allSales: SaleEntry[];
  onExportCSV: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  sales,
  kossor,
  historicalSummaries,
  drinks,
  allSales,
  onExportCSV,
}) => {
  const [dashboardTab, setDashboardTab] = useState<'insights' | 'charts' | 'products'>('insights');

  // Aggregate sales by drink name for today
  const salesByDrink: Record<string, { count: number; revenue: number }> = {};
  sales
    .filter((s) => !s.voided)
    .forEach((s) => {
      if (!salesByDrink[s.drinkName]) {
        salesByDrink[s.drinkName] = { count: 0, revenue: 0 };
      }
      salesByDrink[s.drinkName].count += 1;
      salesByDrink[s.drinkName].revenue += s.priceMAD;
    });

  const sortedTopDrinks = Object.entries(salesByDrink)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Compare today vs yesterday (if historical data exists)
  const yesterdaySummary = historicalSummaries.find((h) => h.dayId < summary.dayId);
  const revenueDiffPercent = yesterdaySummary && yesterdaySummary.grossRevenueMAD > 0
    ? Math.round(((summary.grossRevenueMAD - yesterdaySummary.grossRevenueMAD) / yesterdaySummary.grossRevenueMAD) * 100)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 pb-28 space-y-4">
      {/* Top Navigation Bar inside Insights */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h2 className="text-lg font-extrabold text-stone-100 flex items-center gap-2">
            <span>Decision Support & Analytics</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            10-second insights, progress charts, and product consumption tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="grid grid-cols-3 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs font-bold">
            <button
              onClick={() => setDashboardTab('insights')}
              className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                dashboardTab === 'insights'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
            <button
              onClick={() => setDashboardTab('charts')}
              className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                dashboardTab === 'charts'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Progress</span>
            </button>
            <button
              onClick={() => setDashboardTab('products')}
              className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                dashboardTab === 'products'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Citrus className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TODAY'S 10-SECOND INSIGHTS */}
      {dashboardTab === 'insights' && (
        <div className="space-y-4">
          {/* Question 1: How much did I really sell today? */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-stone-100">1. Paid Sales Revenue</h3>
              </div>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {summary.grossRevenueMAD} <span className="text-xs font-normal">MAD</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Total Paid Drinks Sold: <strong className="text-stone-200 font-mono">{summary.paidDrinksCount}</strong></span>
              {revenueDiffPercent !== null && (
                <div className="flex items-center gap-1 font-mono">
                  {revenueDiffPercent >= 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +{revenueDiffPercent}% vs yesterday
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {revenueDiffPercent}% vs yesterday
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Top 5 Drinks Breakdown */}
            {sortedTopDrinks.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Top Selling Drinks Today:</p>
                <div className="space-y-1">
                  {sortedTopDrinks.map(([name, data]) => (
                    <div key={name} className="bg-stone-950 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-200">{name}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-stone-400">{data.count} sold</span>
                        <span className="font-bold text-emerald-400">{data.revenue} MAD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question 2: How much did Kossor (free/staff drinks) cost me? */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm text-stone-100">2. Kossor Cost (Comp & Staff Drinks)</h3>
              </div>
              <span className="text-2xl font-black text-rose-400 font-mono">
                {summary.kossorCostMAD} <span className="text-xs font-normal">MAD</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block">Total Kossor Drinks:</span>
                <span className="font-bold text-stone-200 font-mono text-sm">{summary.kossorDrinksCount} drinks</span>
              </div>
              <div>
                <span className="text-stone-400 block">Financial Impact:</span>
                <span className="font-bold text-rose-400">Pure Ingredient Loss</span>
              </div>
            </div>
          </div>

          {/* Question 3: Coffee Bean Consumption & Efficiency Ratio */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-stone-100">3. Coffee Bean Consumption & Efficiency</h3>
              </div>
              <span className="text-xl font-extrabold text-amber-300 font-mono">
                {summary.beanConsumptionGrams}g <span className="text-xs font-normal">({summary.beanConsumptionKg} kg)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-xl border border-stone-850">
              <div>
                <span className="text-stone-400 block">Efficiency Ratio:</span>
                <span className="font-black text-amber-300 font-mono text-sm">
                  {summary.beanEfficiencyGramsPerDrink} g / drink
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Calculated Bean Cost:</span>
                <span className="font-bold text-stone-200 font-mono text-sm">{summary.beanCostMAD} MAD</span>
              </div>
            </div>
          </div>

          {/* Question 4: Net Cash Position & Register Variance */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-stone-100">4. Cash Flow & Register Variance</h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-stone-400 block">Net Position</span>
                <span className="text-2xl font-black text-amber-400">{summary.netCashPositionMAD} MAD</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850">
                <span className="text-stone-400 block text-[11px]">Expected Register Cash:</span>
                <span className="font-bold text-stone-200 text-sm">{summary.expectedCashMAD} MAD</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850">
                <span className="text-stone-400 block text-[11px]">Actual Counted Cash:</span>
                <span className="font-bold text-stone-200 text-sm">
                  {summary.actualCashCountedMAD !== undefined ? `${summary.actualCashCountedMAD} MAD` : 'Not counted yet'}
                </span>
              </div>
            </div>

            {summary.cashVarianceMAD !== undefined && (
              <div className={`px-3 py-2 rounded-xl text-xs flex justify-between items-center font-mono ${
                summary.cashVarianceMAD >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}>
                <span>Register Variance:</span>
                <span className="font-bold text-sm">
                  {summary.cashVarianceMAD >= 0 ? '+' : ''}{summary.cashVarianceMAD} MAD
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROGRESS CHARTS */}
      {dashboardTab === 'charts' && (
        <ProgressCharts summaries={[summary, ...historicalSummaries]} />
      )}

      {/* SUB-TAB 3: PRODUCT CONSUMPTION ANALYTICS */}
      {dashboardTab === 'products' && (
        <ProductAnalytics drinks={drinks} allSales={allSales} />
      )}
    </div>
  );
};
