import React, { useState } from 'react';
import { DailySummary } from '../types';
import { TrendingUp, BarChart2, Award, LineChart } from 'lucide-react';

interface ProgressChartsProps {
  summaries: DailySummary[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ summaries }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | 'all'>('7d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sort chronologically ascending for linear trend charts
  const sortedSummaries = [...summaries]
    .sort((a, b) => a.dayId.localeCompare(b.dayId))
    .slice(timeframe === '7d' ? -7 : timeframe === '14d' ? -14 : -30);

  if (sortedSummaries.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl text-center text-stone-400 text-xs">
        No historical records available to display linear progress charts.
      </div>
    );
  }

  // Calculate scaling bounds for SVG linear chart
  const maxVal = Math.max(
    ...sortedSummaries.flatMap((s) => [
      s.grossRevenueMAD,
      Math.max(0, s.netCashPositionMAD),
      s.purchasesTotalMAD + s.kossorCostMAD,
    ]),
    200
  );

  const bestDay = [...sortedSummaries].sort((a, b) => b.grossRevenueMAD - a.grossRevenueMAD)[0];

  // SVG Chart Geometry
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 25;
  const paddingY = 20;

  const pointsCount = sortedSummaries.length;

  const getX = (idx: number) => {
    if (pointsCount <= 1) return chartWidth / 2;
    return paddingX + (idx / (pointsCount - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, val);
    const usableHeight = chartHeight - paddingY * 2;
    return chartHeight - paddingY - (clamped / maxVal) * usableHeight;
  };

  // Build SVG polyline paths
  const revenuePolyline = sortedSummaries
    .map((s, idx) => `${getX(idx)},${getY(s.grossRevenueMAD)}`)
    .join(' ');

  const netProfitPolyline = sortedSummaries
    .map((s, idx) => `${getX(idx)},${getY(Math.max(0, s.netCashPositionMAD))}`)
    .join(' ');

  const expensesPolyline = sortedSummaries
    .map((s, idx) => `${getX(idx)},${getY(s.purchasesTotalMAD + s.kossorCostMAD)}`)
    .join(' ');

  const activeHoverItem = hoverIndex !== null ? sortedSummaries[hoverIndex] : sortedSummaries[sortedSummaries.length - 1];

  return (
    <div className="space-y-4">
      {/* Header & Timeframe Switch */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-stone-100 text-sm">Linear Financial Trend Charts</h3>
            <p className="text-xs text-stone-400">Track Revenue, Net Profit, and Expenses over time</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          {(['7d', '14d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                timeframe === t
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Best Day Spotlight Card */}
      {bestDay && (
        <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-stone-900 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between shadow">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Best Revenue Day</span>
              <span className="font-bold text-stone-100 text-sm font-mono">{bestDay.dayId}</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-emerald-400 font-extrabold text-lg block">{bestDay.grossRevenueMAD} MAD</span>
            <span className="text-[10px] text-stone-400 block">{bestDay.paidDrinksCount} drinks sold</span>
          </div>
        </div>
      )}

      {/* LINEAR SVG TREND CHART */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3 shadow-lg">
        {/* Legend */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 text-xs">
          <span className="font-bold text-stone-200">Financial Performance Lines</span>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-1 rounded bg-emerald-500" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-1 rounded bg-amber-500" /> Net Profit
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-1 rounded bg-rose-500" /> Expenses
            </span>
          </div>
        </div>

        {/* Hovered Date Data Card */}
        {activeHoverItem && (
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div>
              <span className="text-[10px] text-stone-400 block">Revenue ({activeHoverItem.dayId})</span>
              <span className="font-black text-emerald-400 text-sm">{activeHoverItem.grossRevenueMAD} MAD</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Net Profit</span>
              <span className="font-black text-amber-400 text-sm">{activeHoverItem.netCashPositionMAD} MAD</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Expenses & Comps</span>
              <span className="font-black text-rose-400 text-sm">
                {activeHoverItem.purchasesTotalMAD + activeHoverItem.kossorCostMAD} MAD
              </span>
            </div>
          </div>
        )}

        {/* SVG Multi-Line Chart Container */}
        <div className="relative pt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-48 overflow-visible select-none"
          >
            {/* Grid Horizontal Guide Lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = getY(maxVal * ratio);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              );
            })}

            {/* Revenue Line (Emerald) */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={revenuePolyline}
            />

            {/* Net Profit Line (Amber) */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={netProfitPolyline}
            />

            {/* Expenses Line (Rose) */}
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={expensesPolyline}
            />

            {/* Interactive Data Points (Circles) */}
            {sortedSummaries.map((s, idx) => {
              const x = getX(idx);
              const yRev = getY(s.grossRevenueMAD);
              const yNet = getY(Math.max(0, s.netCashPositionMAD));
              const yExp = getY(s.purchasesTotalMAD + s.kossorCostMAD);
              const isHovered = hoverIndex === idx;

              return (
                <g
                  key={s.dayId}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onClick={() => setHoverIndex(idx)}
                >
                  {/* Vertical Hover Guide */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={chartHeight - paddingY}
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Revenue Point */}
                  <circle
                    cx={x}
                    cy={yRev}
                    r={isHovered ? '6' : '4'}
                    fill="#10b981"
                    stroke="#09090b"
                    strokeWidth="2"
                  />

                  {/* Net Profit Point */}
                  <circle
                    cx={x}
                    cy={yNet}
                    r={isHovered ? '6' : '4'}
                    fill="#f59e0b"
                    stroke="#09090b"
                    strokeWidth="2"
                  />

                  {/* Expenses Point */}
                  <circle
                    cx={x}
                    cy={yExp}
                    r={isHovered ? '5' : '3'}
                    fill="#f43f5e"
                    stroke="#09090b"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* X-Axis Date Labels */}
          <div className="flex justify-between px-2 pt-1 font-mono text-[9px] text-stone-500">
            {sortedSummaries.map((s, idx) => (
              <span
                key={s.dayId}
                onClick={() => setHoverIndex(idx)}
                className={`cursor-pointer ${
                  hoverIndex === idx ? 'text-amber-400 font-bold' : ''
                }`}
              >
                {s.dayId.slice(5)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
