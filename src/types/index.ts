export type DrinkCategory = 'hot' | 'cold' | 'mojito' | 'water_other';
export type ExpenseCategory = 'dairy' | 'beans' | 'fruit' | 'packaging' | 'syrup' | 'other';
export type PersonalCategory = 'lunch' | 'coffee' | 'transport' | 'personal_draw' | 'other';

export interface Drink {
  id: string;
  name: string;             // Drink name (e.g. French/Darija/English: "Ness Ness", "Espresso", "Mojito Chefchaouen")
  category: DrinkCategory;
  defaultPriceMAD: number;  // Menu sales price in MAD
  costToMakeMAD: number;    // Estimated ingredient cost per drink in MAD
  beanWeightGrams: number;  // Estimated bean weight per drink (e.g. 9g for single espresso, 18g double)
  isEspressoBased: boolean; // Flag to calculate bean efficiency ratio (g / espresso drink)
  active: boolean;
}

export interface Modifier {
  id: string;
  name: string;              // e.g. "Caramel", "Vanilla", "Chocolate", "Pistachio"
  priceUpchargeMAD: number;  // Default 0 MAD unless explicitly configured
  active: boolean;
}

export interface ExpenseShortcut {
  id: string;
  name: string;              // e.g. "1L Milk UHT", "1L Milk Normal", "1Kg Banana"
  defaultCostMAD: number;    // Default expense cost in MAD/DH
  category: ExpenseCategory;
  supplier?: string;
  active: boolean;
}

export interface PersonalSpendShortcut {
  id: string;
  label: string;             // e.g. "Owner Lunch", "Personal Coffee", "Taxi / Transport"
  defaultAmountMAD: number;
  category: PersonalCategory;
  active: boolean;
}

export interface SaleEntry {
  id: string;
  dayId: string;             // YYYY-MM-DD
  drinkId: string;
  drinkName: string;
  category: DrinkCategory;
  modifierIds: string[];
  modifierNames?: string[];
  priceMAD: number;          // Paid price
  timestamp: string;         // ISO timestamp
  voided: boolean;           // True if reverted/undo
}

export interface KossorEntry {
  id: string;
  dayId: string;             // YYYY-MM-DD
  drinkId: string;
  drinkName: string;
  category: DrinkCategory;
  modifierIds: string[];
  modifierNames?: string[];
  costMAD: number;           // Ingredient cost (loss, zero revenue)
  reason: 'staff' | 'comp' | 'waste';
  timestamp: string;         // ISO timestamp
  voided: boolean;           // True if reverted/undo
}

export interface PurchaseEntry {
  id: string;
  dayId: string;             // YYYY-MM-DD
  item: string;              // e.g., "1L Milk UHT", "Coffee Beans (5kg)", "1Kg Banana"
  supplier?: string;
  costMAD: number;           // Cash outflow in MAD/DH
  category: ExpenseCategory;
  timestamp: string;
}

export interface PersonalSpendEntry {
  id: string;
  dayId: string;             // YYYY-MM-DD
  description: string;       // Owner personal cash withdrawal (e.g. "Owner Lunch", "Personal Coffee")
  category?: PersonalCategory;
  amountMAD: number;
  timestamp: string;
}

export interface DebtPaymentEntry {
  id: string;
  dayId: string;             // YYYY-MM-DD
  description: string;       // Debt or loan payment made from cash box
  amountMAD: number;
  timestamp: string;
}

export interface DailyRecord {
  dayId: string;                // YYYY-MM-DD primary key
  molanStartGrams: number;      // Coffee bean hopper start level in grams
  molanEndGrams?: number;       // Coffee bean hopper end level in grams
  beanCostPerKgMAD: number;     // Cost of coffee beans per kg (e.g. 180 MAD/kg)
  actualCashCountedMAD?: number;// Physical cash counted in register at close
  status: 'open' | 'closed';
  closedAt?: string;
  notes?: string;
}

export interface DailySummary {
  dayId: string;
  grossRevenueMAD: number;         // Total paid sales revenue
  paidDrinksCount: number;         // Number of paid drinks sold
  kossorCostMAD: number;           // Total Kossor loss at ingredient cost
  kossorDrinksCount: number;       // Number of comp/staff drinks given away
  purchasesTotalMAD: number;       // Cash spent on supplies/restocking
  personalSpendTotalMAD: number;   // Owner cash withdrawals
  debtPaymentsTotalMAD: number;    // Debt payments from register
  molanStartGrams: number;
  molanEndGrams: number;
  beanConsumptionGrams: number;    // molanStart - molanEnd
  beanConsumptionKg: number;
  beanCostMAD: number;             // (consumptionGrams / 1000) * beanCostPerKg
  espressoDrinksCount: number;     // Number of espresso drinks sold + comps
  beanEfficiencyGramsPerDrink: number; // beanConsumptionGrams / espressoDrinksCount
  expectedCashMAD: number;         // grossRevenue - purchasesTotal - personalSpend - debtPayments
  actualCashCountedMAD?: number;
  cashVarianceMAD?: number;        // actualCashCounted - expectedCash
  netCashPositionMAD: number;      // grossRevenue - purchasesTotal - kossorCost - personalSpend - debtPayments
  isClosed: boolean;
}

export interface ProductConsumptionStats {
  drinkId: string;
  drinkName: string;
  category: DrinkCategory;
  totalQuantitySold: number;
  totalRevenueMAD: number;
  peakDayId: string;
  peakDayQuantity: number;
  dailyBreakdown: { dayId: string; quantity: number; revenueMAD: number }[];
}
