import {
  SaleEntry,
  KossorEntry,
  PurchaseEntry,
  PersonalSpendEntry,
  DebtPaymentEntry,
  DailyRecord,
  DailySummary,
} from '../../types';

/**
 * Calculates Gross Revenue (MAD) from paid sales.
 * Ignores voided sales.
 */
export function calculateGrossRevenue(sales: SaleEntry[]): number {
  return sales
    .filter((s) => !s.voided)
    .reduce((sum, s) => sum + (s.priceMAD || 0), 0);
}

/**
 * Calculates Kossor Cost (MAD) for staff/free/comp drinks.
 * Tracked strictly at ingredient cost-to-make (loss), zero revenue.
 * Ignores voided kossor entries.
 */
export function calculateKossorCost(kossor: KossorEntry[]): number {
  return kossor
    .filter((k) => !k.voided)
    .reduce((sum, k) => sum + (k.costMAD || 0), 0);
}

/**
 * Calculates total cash spent on purchases / restocking.
 */
export function calculatePurchasesTotal(purchases: PurchaseEntry[]): number {
  return purchases.reduce((sum, p) => sum + (p.costMAD || 0), 0);
}

/**
 * Calculates total owner personal cash withdrawals.
 */
export function calculatePersonalSpendTotal(personal: PersonalSpendEntry[]): number {
  return personal.reduce((sum, p) => sum + (p.amountMAD || 0), 0);
}

/**
 * Calculates total debt payments made from cash box.
 */
export function calculateDebtPaymentsTotal(debt: DebtPaymentEntry[]): number {
  return debt.reduce((sum, d) => sum + (d.amountMAD || 0), 0);
}

/**
 * Calculates bean consumption in grams (Molan Start - Molan End).
 * If Molan End is not set yet, returns 0.
 */
export function calculateBeanConsumptionGrams(
  molanStartGrams: number,
  molanEndGrams?: number
): number {
  if (molanEndGrams === undefined || molanEndGrams === null) return 0;
  const consumed = molanStartGrams - molanEndGrams;
  return Math.max(0, consumed);
}

/**
 * Calculates bean cost in MAD based on consumption in grams and cost per kg.
 */
export function calculateBeanCostMAD(
  consumptionGrams: number,
  beanCostPerKgMAD: number
): number {
  const kg = consumptionGrams / 1000;
  return Math.round(kg * beanCostPerKgMAD * 100) / 100;
}

/**
 * Calculates bean efficiency ratio: grams of beans consumed per espresso-based drink sold/comped.
 */
export function calculateBeanEfficiency(
  consumptionGrams: number,
  espressoDrinksCount: number
): number {
  if (espressoDrinksCount <= 0 || consumptionGrams <= 0) return 0;
  return Math.round((consumptionGrams / espressoDrinksCount) * 10) / 10;
}

/**
 * Calculates Expected Cash in the register at close.
 * Formula: Gross Revenue (paid) - Restocking Purchases - Personal Spending - Debt Payments
 */
export function calculateExpectedCash(
  grossRevenue: number,
  purchasesTotal: number,
  personalSpend: number = 0,
  debtPayments: number = 0
): number {
  return Math.max(0, grossRevenue - purchasesTotal - personalSpend - debtPayments);
}

/**
 * Calculates Cash Variance = Actual Counted Cash - Expected Cash.
 * Positive = Surplus
 * Negative = Shortage
 */
export function calculateCashVariance(
  actualCashCounted?: number,
  expectedCash: number = 0
): number | undefined {
  if (actualCashCounted === undefined || actualCashCounted === null) return undefined;
  return actualCashCounted - expectedCash;
}

/**
 * Calculates Net Cash Position for the day.
 * Formula: Gross Sales Revenue - Purchases - Kossor Cost - Personal Withdrawals - Debt Payments
 */
export function calculateNetCashPosition(
  grossRevenue: number,
  purchasesTotal: number,
  kossorCost: number,
  personalSpend: number = 0,
  debtPayments: number = 0
): number {
  return grossRevenue - purchasesTotal - kossorCost - personalSpend - debtPayments;
}

/**
 * Centralized Summary Builder that computes all metrics for a given day.
 */
export function computeDailySummary(
  record: DailyRecord,
  sales: SaleEntry[],
  kossor: KossorEntry[],
  purchases: PurchaseEntry[],
  personalSpend: PersonalSpendEntry[] = [],
  debtPayments: DebtPaymentEntry[] = [],
  espressoDrinkIds: Set<string> = new Set()
): DailySummary {
  const activeSales = sales.filter((s) => !s.voided);
  const activeKossor = kossor.filter((k) => !k.voided);

  const grossRevenueMAD = calculateGrossRevenue(activeSales);
  const paidDrinksCount = activeSales.length;
  
  const kossorCostMAD = calculateKossorCost(activeKossor);
  const kossorDrinksCount = activeKossor.length;

  const purchasesTotalMAD = calculatePurchasesTotal(purchases);
  const personalSpendTotalMAD = calculatePersonalSpendTotal(personalSpend);
  const debtPaymentsTotalMAD = calculateDebtPaymentsTotal(debtPayments);

  const molanStartGrams = record.molanStartGrams || 0;
  const molanEndGrams = record.molanEndGrams ?? molanStartGrams;
  const beanConsumptionGrams = calculateBeanConsumptionGrams(molanStartGrams, record.molanEndGrams);
  const beanConsumptionKg = Math.round((beanConsumptionGrams / 1000) * 100) / 100;
  const beanCostMAD = calculateBeanCostMAD(beanConsumptionGrams, record.beanCostPerKgMAD || 180);

  // Calculate total espresso drinks (paid + comps)
  const paidEspressoCount = activeSales.filter((s) => espressoDrinkIds.has(s.drinkId)).length;
  const compEspressoCount = activeKossor.filter((k) => espressoDrinkIds.has(k.drinkId)).length;
  const espressoDrinksCount = paidEspressoCount + compEspressoCount;

  const beanEfficiencyGramsPerDrink = calculateBeanEfficiency(
    beanConsumptionGrams,
    espressoDrinksCount
  );

  const expectedCashMAD = calculateExpectedCash(
    grossRevenueMAD,
    purchasesTotalMAD,
    personalSpendTotalMAD,
    debtPaymentsTotalMAD
  );

  const cashVarianceMAD = calculateCashVariance(
    record.actualCashCountedMAD,
    expectedCashMAD
  );

  const netCashPositionMAD = calculateNetCashPosition(
    grossRevenueMAD,
    purchasesTotalMAD,
    kossorCostMAD,
    personalSpendTotalMAD,
    debtPaymentsTotalMAD
  );

  return {
    dayId: record.dayId,
    grossRevenueMAD,
    paidDrinksCount,
    kossorCostMAD,
    kossorDrinksCount,
    purchasesTotalMAD,
    personalSpendTotalMAD,
    debtPaymentsTotalMAD,
    molanStartGrams,
    molanEndGrams,
    beanConsumptionGrams,
    beanConsumptionKg,
    beanCostMAD,
    espressoDrinksCount,
    beanEfficiencyGramsPerDrink,
    expectedCashMAD,
    actualCashCountedMAD: record.actualCashCountedMAD,
    cashVarianceMAD,
    netCashPositionMAD,
    isClosed: record.status === 'closed',
  };
}
