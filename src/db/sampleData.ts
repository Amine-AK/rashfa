import { db } from './index';
import { INITIAL_DRINKS } from './seed';
import { DailyRecord, SaleEntry, KossorEntry, PurchaseEntry } from '../types';

export async function seedHistoricalSampleData() {
  const existingRecords = await db.dailyRecords.count();
  if (existingRecords > 0) return; // Already seeded

  const now = new Date();
  
  // Seed past 5 days
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayId = `${year}-${month}-${day}`;

    // Record
    const startBean = 3500 - (5 - i) * 100;
    const consumedBean = 950 + Math.floor(Math.random() * 200);
    const endBean = startBean - consumedBean;

    const baseRevenue = 1200 + (5 - i) * 150 + Math.floor(Math.random() * 100);
    const purchasesAmt = i % 2 === 0 ? 150 : 0;
    const expectedCash = baseRevenue - purchasesAmt;
    const actualCash = expectedCash + (Math.random() > 0.5 ? 10 : -15);

    const record: DailyRecord = {
      dayId,
      molanStartGrams: startBean,
      molanEndGrams: endBean,
      beanCostPerKgMAD: 180,
      actualCashCountedMAD: actualCash,
      status: 'closed',
      closedAt: new Date(d.getTime() + 14 * 3600 * 1000).toISOString(),
    };

    await db.dailyRecords.add(record);

    // Sales
    const salesList: SaleEntry[] = [];
    let currentRevenue = 0;
    let saleCounter = 1;

    while (currentRevenue < baseRevenue) {
      const drink = INITIAL_DRINKS[Math.floor(Math.random() * INITIAL_DRINKS.length)];
      salesList.push({
        id: `sample_sale_${dayId}_${saleCounter++}`,
        dayId,
        drinkId: drink.id,
        drinkName: drink.name,
        category: drink.category,
        modifierIds: [],
        priceMAD: drink.defaultPriceMAD,
        timestamp: new Date(d.getTime() + Math.random() * 12 * 3600 * 1000).toISOString(),
        voided: false,
      });
      currentRevenue += drink.defaultPriceMAD;
    }
    await db.sales.bulkAdd(salesList);

    // Kossor (Staff/Comp drinks: 3 to 6 per day)
    const kossorList: KossorEntry[] = [];
    for (let k = 0; k < 4; k++) {
      const drink = INITIAL_DRINKS[Math.floor(Math.random() * 6)]; // hot drinks
      kossorList.push({
        id: `sample_kossor_${dayId}_${k}`,
        dayId,
        drinkId: drink.id,
        drinkName: drink.name,
        category: drink.category,
        modifierIds: [],
        costMAD: drink.costToMakeMAD,
        reason: k === 0 ? 'staff' : 'comp',
        timestamp: new Date(d.getTime() + Math.random() * 12 * 3600 * 1000).toISOString(),
        voided: false,
      });
    }
    await db.kossor.bulkAdd(kossorList);

    // Purchases
    if (purchasesAmt > 0) {
      const purchase: PurchaseEntry = {
        id: `sample_purch_${dayId}`,
        dayId,
        item: 'Milk 10L & Sugar 5kg',
        supplier: 'Jaouda',
        costMAD: purchasesAmt,
        category: 'dairy',
        timestamp: new Date(d.getTime() + 4 * 3600 * 1000).toISOString(),
      };
      await db.purchases.add(purchase);
    }
  }
}
