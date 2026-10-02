import { db } from '../db';
import {
  Drink,
  Modifier,
  ExpenseShortcut,
  PersonalSpendShortcut,
  SaleEntry,
  KossorEntry,
  PurchaseEntry,
  PersonalSpendEntry,
  DebtPaymentEntry,
  DailyRecord,
} from '../types';

export function getTodayId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function clearAllTransactionData(): Promise<void> {
  await db.sales.clear();
  await db.kossor.clear();
  await db.purchases.clear();
  await db.personalSpend.clear();
  await db.debtPayments.clear();
  await db.dailyRecords.clear();
  await DailyRecordRepository.getOrCreateRecord(getTodayId());
}

export const DrinkRepository = {
  async getAll(): Promise<Drink[]> {
    return await db.drinks.toArray();
  },

  async getActive(): Promise<Drink[]> {
    return await db.drinks.filter((d) => d.active).toArray();
  },

  async save(drink: Drink): Promise<string> {
    await db.drinks.put(drink);
    return drink.id;
  },

  async toggleActive(id: string): Promise<void> {
    const drink = await db.drinks.get(id);
    if (drink) {
      await db.drinks.update(id, { active: !drink.active });
    }
  },

  async getAllModifiers(): Promise<Modifier[]> {
    return await db.modifiers.toArray();
  },

  async saveModifier(mod: Modifier): Promise<string> {
    await db.modifiers.put(mod);
    return mod.id;
  },
};

export const ExpenseShortcutRepository = {
  async getAll(): Promise<ExpenseShortcut[]> {
    return await db.expenseShortcuts.toArray();
  },

  async getActive(): Promise<ExpenseShortcut[]> {
    return await db.expenseShortcuts.filter((e) => e.active).toArray();
  },

  async save(shortcut: ExpenseShortcut): Promise<string> {
    await db.expenseShortcuts.put(shortcut);
    return shortcut.id;
  },

  async delete(id: string): Promise<void> {
    await db.expenseShortcuts.delete(id);
  },

  async toggleActive(id: string): Promise<void> {
    const shortcut = await db.expenseShortcuts.get(id);
    if (shortcut) {
      await db.expenseShortcuts.update(id, { active: !shortcut.active });
    }
  },

  async updatePrice(id: string, newCostMAD: number): Promise<void> {
    await db.expenseShortcuts.update(id, { defaultCostMAD: newCostMAD });
  },
};

export const PersonalShortcutRepository = {
  async getAll(): Promise<PersonalSpendShortcut[]> {
    return await db.personalShortcuts.toArray();
  },

  async getActive(): Promise<PersonalSpendShortcut[]> {
    return await db.personalShortcuts.filter((p) => p.active).toArray();
  },

  async save(shortcut: PersonalSpendShortcut): Promise<string> {
    await db.personalShortcuts.put(shortcut);
    return shortcut.id;
  },

  async delete(id: string): Promise<void> {
    await db.personalShortcuts.delete(id);
  },
};

export const SalesRepository = {
  async logSale(entry: Omit<SaleEntry, 'id' | 'timestamp' | 'voided'>): Promise<SaleEntry> {
    const newEntry: SaleEntry = {
      ...entry,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      voided: false,
    };
    await db.sales.add(newEntry);
    return newEntry;
  },

  async voidSale(id: string): Promise<void> {
    await db.sales.update(id, { voided: true });
  },

  async unvoidSale(id: string): Promise<void> {
    await db.sales.update(id, { voided: false });
  },

  async getSalesForDay(dayId: string): Promise<SaleEntry[]> {
    return await db.sales.where('dayId').equals(dayId).toArray();
  },

  async getRecentSalesForDay(dayId: string, limit: number = 20): Promise<SaleEntry[]> {
    const sales = await db.sales.where('dayId').equals(dayId).toArray();
    return sales
      .filter((s) => !s.voided)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
};

export const KossorRepository = {
  async logKossor(entry: Omit<KossorEntry, 'id' | 'timestamp' | 'voided'>): Promise<KossorEntry> {
    const newEntry: KossorEntry = {
      ...entry,
      id: `kossor_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      voided: false,
    };
    await db.kossor.add(newEntry);
    return newEntry;
  },

  async voidKossor(id: string): Promise<void> {
    await db.kossor.update(id, { voided: true });
  },

  async unvoidKossor(id: string): Promise<void> {
    await db.kossor.update(id, { voided: false });
  },

  async getKossorForDay(dayId: string): Promise<KossorEntry[]> {
    return await db.kossor.where('dayId').equals(dayId).toArray();
  },
};

export const PurchaseRepository = {
  async addPurchase(entry: Omit<PurchaseEntry, 'id' | 'timestamp'>): Promise<PurchaseEntry> {
    const newEntry: PurchaseEntry = {
      ...entry,
      id: `purch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    await db.purchases.add(newEntry);
    return newEntry;
  },

  async deletePurchase(id: string): Promise<void> {
    await db.purchases.delete(id);
  },

  async getPurchasesForDay(dayId: string): Promise<PurchaseEntry[]> {
    return await db.purchases.where('dayId').equals(dayId).toArray();
  },
};

export const PersonalSpendRepository = {
  async addPersonalSpend(entry: Omit<PersonalSpendEntry, 'id' | 'timestamp'>): Promise<PersonalSpendEntry> {
    const newEntry: PersonalSpendEntry = {
      ...entry,
      id: `pspend_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    await db.personalSpend.add(newEntry);
    return newEntry;
  },

  async deletePersonalSpend(id: string): Promise<void> {
    await db.personalSpend.delete(id);
  },

  async getPersonalSpendForDay(dayId: string): Promise<PersonalSpendEntry[]> {
    return await db.personalSpend.where('dayId').equals(dayId).toArray();
  },
};

export const DebtPaymentRepository = {
  async addDebtPayment(entry: Omit<DebtPaymentEntry, 'id' | 'timestamp'>): Promise<DebtPaymentEntry> {
    const newEntry: DebtPaymentEntry = {
      ...entry,
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    await db.debtPayments.add(newEntry);
    return newEntry;
  },

  async deleteDebtPayment(id: string): Promise<void> {
    await db.debtPayments.delete(id);
  },

  async getDebtPaymentsForDay(dayId: string): Promise<DebtPaymentEntry[]> {
    return await db.debtPayments.where('dayId').equals(dayId).toArray();
  },
};

export const DailyRecordRepository = {
  async getOrCreateRecord(dayId: string = getTodayId()): Promise<DailyRecord> {
    let record = await db.dailyRecords.get(dayId);
    if (!record) {
      // Find yesterday's record to inherit Molan Start from yesterday's Molan End if available
      const allRecords = await db.dailyRecords.toArray();
      const previousClosedRecords = allRecords
        .filter((r) => r.dayId < dayId && r.molanEndGrams !== undefined)
        .sort((a, b) => b.dayId.localeCompare(a.dayId));

      const defaultMolanStart = previousClosedRecords.length > 0 && previousClosedRecords[0].molanEndGrams !== undefined
        ? previousClosedRecords[0].molanEndGrams
        : 3000; // Default 3000g (3kg hopper)

      record = {
        dayId,
        molanStartGrams: defaultMolanStart,
        beanCostPerKgMAD: 180,
        status: 'open',
      };
      await db.dailyRecords.add(record);
    }
    return record;
  },

  async updateRecord(record: Partial<DailyRecord> & { dayId: string }): Promise<void> {
    await db.dailyRecords.update(record.dayId, record);
  },

  async closeDay(dayId: string, actualCashCountedMAD: number, molanEndGrams: number, notes?: string): Promise<void> {
    await db.dailyRecords.update(dayId, {
      status: 'closed',
      closedAt: new Date().toISOString(),
      actualCashCountedMAD,
      molanEndGrams,
      notes,
    });
  },

  async reopenDay(dayId: string): Promise<void> {
    await db.dailyRecords.update(dayId, {
      status: 'open',
    });
  },

  async getAllRecords(): Promise<DailyRecord[]> {
    return await db.dailyRecords.toArray();
  },
};
