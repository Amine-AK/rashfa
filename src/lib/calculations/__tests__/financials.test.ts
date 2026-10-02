import { describe, it, expect } from 'vitest';
import {
  calculateGrossRevenue,
  calculateKossorCost,
  calculatePurchasesTotal,
  calculateBeanConsumptionGrams,
  calculateBeanCostMAD,
  calculateExpectedCash,
  calculateCashVariance,
  calculateNetCashPosition,
  calculateBeanEfficiency,
  computeDailySummary,
} from '../index';
import {
  SaleEntry,
  KossorEntry,
  PurchaseEntry,
  DailyRecord,
} from '../../../types';

describe('Rashfa Financial Calculation Engine', () => {
  it('correctly calculates Gross Sales Revenue ignoring voided sales', () => {
    const sales: SaleEntry[] = [
      { id: '1', dayId: '2026-08-24', drinkId: 'exp', drinkName: 'Espresso', category: 'hot', modifierIds: [], priceMAD: 12, timestamp: '', voided: false },
      { id: '2', dayId: '2026-08-24', drinkId: 'ness', drinkName: 'Ness Ness', category: 'hot', modifierIds: [], priceMAD: 15, timestamp: '', voided: false },
      { id: '3', dayId: '2026-08-24', drinkId: 'moj', drinkName: 'Mojito Chefchaouen', category: 'mojito', modifierIds: [], priceMAD: 25, timestamp: '', voided: true }, // voided
    ];
    expect(calculateGrossRevenue(sales)).toBe(27);
  });

  it('correctly calculates Kossor Cost (free/staff drinks) at ingredient cost', () => {
    const kossor: KossorEntry[] = [
      { id: 'k1', dayId: '2026-08-24', drinkId: 'exp', drinkName: 'Espresso', category: 'hot', modifierIds: [], costMAD: 3.5, reason: 'staff', timestamp: '', voided: false },
      { id: 'k2', dayId: '2026-08-24', drinkId: 'cap', drinkName: 'Cappuccino', category: 'hot', modifierIds: [], costMAD: 6.0, reason: 'comp', timestamp: '', voided: false },
      { id: 'k3', dayId: '2026-08-24', drinkId: 'water', drinkName: 'Water', category: 'water_other', modifierIds: [], costMAD: 1.5, reason: 'waste', timestamp: '', voided: true },
    ];
    expect(calculateKossorCost(kossor)).toBe(9.5);
  });

  it('correctly calculates restocking purchases total', () => {
    const purchases: PurchaseEntry[] = [
      { id: 'p1', dayId: '2026-08-24', item: 'Milk 10L', costMAD: 80, category: 'dairy', timestamp: '' },
      { id: 'p2', dayId: '2026-08-24', item: 'Coffee Beans 5kg', costMAD: 900, category: 'beans', timestamp: '' },
    ];
    expect(calculatePurchasesTotal(purchases)).toBe(980);
  });

  it('correctly calculates bean consumption and cost in MAD', () => {
    const startGrams = 3000;
    const endGrams = 1800;
    const beanCostPerKg = 200; // MAD

    const consumptionGrams = calculateBeanConsumptionGrams(startGrams, endGrams);
    expect(consumptionGrams).toBe(1200); // 1.2 kg

    const costMAD = calculateBeanCostMAD(consumptionGrams, beanCostPerKg);
    expect(costMAD).toBe(240); // 1.2 * 200 = 240 MAD
  });

  it('correctly calculates Expected Cash, Variance, and Net Cash Position', () => {
    const grossRevenue = 1500;
    const purchasesTotal = 300;
    const kossorCost = 45;
    const personalSpend = 100;
    const debtPayments = 50;

    // Expected Cash = Revenue - Purchases - Personal - Debt = 1500 - 300 - 100 - 50 = 1050
    const expectedCash = calculateExpectedCash(grossRevenue, purchasesTotal, personalSpend, debtPayments);
    expect(expectedCash).toBe(1050);

    // Actual Cash Counted = 1040 (Shortage of -10 MAD)
    const variance = calculateCashVariance(1040, expectedCash);
    expect(variance).toBe(-10);

    // Net Cash Position = Revenue - Purchases - Kossor - Personal - Debt = 1500 - 300 - 45 - 100 - 50 = 1005 MAD
    const netCash = calculateNetCashPosition(grossRevenue, purchasesTotal, kossorCost, personalSpend, debtPayments);
    expect(netCash).toBe(1005);
  });

  it('correctly calculates bean efficiency (grams per espresso drink)', () => {
    const consumptionGrams = 900; // 900g consumed
    const espressoDrinksCount = 90; // 90 espresso drinks sold
    expect(calculateBeanEfficiency(consumptionGrams, espressoDrinksCount)).toBe(10); // 10g per drink
  });

  it('computes complete daily summary correctly', () => {
    const record: DailyRecord = {
      dayId: '2026-08-24',
      molanStartGrams: 2000,
      molanEndGrams: 1000,
      beanCostPerKgMAD: 180,
      actualCashCountedMAD: 600,
      status: 'closed',
    };

    const sales: SaleEntry[] = [
      { id: 's1', dayId: '2026-08-24', drinkId: 'd1', drinkName: 'Espresso', category: 'hot', modifierIds: [], priceMAD: 12, timestamp: '', voided: false },
      { id: 's2', dayId: '2026-08-24', drinkId: 'd1', drinkName: 'Espresso', category: 'hot', modifierIds: [], priceMAD: 12, timestamp: '', voided: false },
      { id: 's3', dayId: '2026-08-24', drinkId: 'd2', drinkName: 'Tea', category: 'hot', modifierIds: [], priceMAD: 10, timestamp: '', voided: false },
    ];

    const kossor: KossorEntry[] = [
      { id: 'k1', dayId: '2026-08-24', drinkId: 'd1', drinkName: 'Espresso', category: 'hot', modifierIds: [], costMAD: 3.5, reason: 'staff', timestamp: '', voided: false },
    ];

    const purchases: PurchaseEntry[] = [
      { id: 'p1', dayId: '2026-08-24', item: 'Milk', costMAD: 20, category: 'dairy', timestamp: '' },
    ];

    const espressoIds = new Set(['d1']);

    const summary = computeDailySummary(record, sales, kossor, purchases, [], [], espressoIds);

    expect(summary.grossRevenueMAD).toBe(34);
    expect(summary.paidDrinksCount).toBe(3);
    expect(summary.kossorCostMAD).toBe(3.5);
    expect(summary.kossorDrinksCount).toBe(1);
    expect(summary.purchasesTotalMAD).toBe(20);
    expect(summary.expectedCashMAD).toBe(14); // 34 - 20 = 14
    expect(summary.cashVarianceMAD).toBe(586); // 600 - 14 = 586
    expect(summary.netCashPositionMAD).toBe(10.5); // 34 - 20 - 3.5 = 10.5
    expect(summary.beanConsumptionGrams).toBe(1000);
    expect(summary.espressoDrinksCount).toBe(3); // 2 paid espresso + 1 comp espresso
    expect(summary.beanEfficiencyGramsPerDrink).toBe(333.3); // 1000 / 3
  });
});
