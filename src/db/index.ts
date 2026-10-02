import Dexie, { Table } from 'dexie';
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
import { INITIAL_DRINKS, INITIAL_MODIFIERS, INITIAL_EXPENSE_SHORTCUTS, INITIAL_PERSONAL_SHORTCUTS } from './seed';

export class RashfaDatabase extends Dexie {
  drinks!: Table<Drink, string>;
  modifiers!: Table<Modifier, string>;
  expenseShortcuts!: Table<ExpenseShortcut, string>;
  personalShortcuts!: Table<PersonalSpendShortcut, string>;
  sales!: Table<SaleEntry, string>;
  kossor!: Table<KossorEntry, string>;
  purchases!: Table<PurchaseEntry, string>;
  personalSpend!: Table<PersonalSpendEntry, string>;
  debtPayments!: Table<DebtPaymentEntry, string>;
  dailyRecords!: Table<DailyRecord, string>;

  constructor() {
    super('RashfaDB');
    this.version(4).stores({
      drinks: 'id, category, active',
      modifiers: 'id, active',
      expenseShortcuts: 'id, category, active',
      personalShortcuts: 'id, category, active',
      sales: 'id, dayId, drinkId, category, voided, timestamp',
      kossor: 'id, dayId, drinkId, category, voided, timestamp',
      purchases: 'id, dayId, category, timestamp',
      personalSpend: 'id, dayId, category, timestamp',
      debtPayments: 'id, dayId, timestamp',
      dailyRecords: 'dayId, status',
    });
  }

  async seedIfEmpty() {
    // Clear and update drink catalog to match real menu JSON
    const existingDrinks = await this.drinks.toArray();
    const hasOldSeed = existingDrinks.some((d) => d.id === 'drink_exp' && d.defaultPriceMAD === 12);
    if (existingDrinks.length === 0 || hasOldSeed) {
      await this.drinks.clear();
      await this.drinks.bulkAdd(INITIAL_DRINKS);
      await this.modifiers.clear();
      await this.modifiers.bulkAdd(INITIAL_MODIFIERS);
    }

    const shortcutCount = await this.expenseShortcuts.count();
    if (shortcutCount === 0) {
      await this.expenseShortcuts.bulkAdd(INITIAL_EXPENSE_SHORTCUTS);
    }
    const psCount = await this.personalShortcuts.count();
    if (psCount === 0) {
      await this.personalShortcuts.bulkAdd(INITIAL_PERSONAL_SHORTCUTS);
    }
  }
}

export const db = new RashfaDatabase();

// Seed initial catalog asynchronously
db.seedIfEmpty().catch((err) => {
  console.error('Failed to seed database:', err);
});
