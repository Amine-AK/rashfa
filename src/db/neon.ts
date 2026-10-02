import { neon } from '@neondatabase/serverless';
import { Drink, SaleEntry, KossorEntry, PurchaseEntry, DailyRecord } from '../types';

/**
 * Neon PostgreSQL Client & Cloud Backup Sync Helper for Vercel
 */
export function getNeonSql(connectionString?: string) {
  const url = connectionString || import.meta.env.VITE_DATABASE_URL || '';
  if (!url) return null;
  return neon(url);
}

/**
 * Initializes tables in Neon PostgreSQL if they don't exist yet
 */
export async function initNeonTables(connectionString: string) {
  const sql = getNeonSql(connectionString);
  if (!sql) throw new Error('Database URL is required');

  await sql`
    CREATE TABLE IF NOT EXISTS drinks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_price_mad NUMERIC NOT NULL,
      cost_to_make_mad NUMERIC NOT NULL,
      bean_weight_grams NUMERIC NOT NULL,
      is_espresso_based BOOLEAN NOT NULL,
      active BOOLEAN NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_records (
      day_id TEXT PRIMARY KEY,
      molan_start_grams NUMERIC NOT NULL,
      molan_end_grams NUMERIC,
      bean_cost_per_kg_mad NUMERIC NOT NULL,
      actual_cash_counted_mad NUMERIC,
      status TEXT NOT NULL,
      closed_at TEXT,
      notes TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL,
      drink_id TEXT NOT NULL,
      drink_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_mad NUMERIC NOT NULL,
      timestamp TEXT NOT NULL,
      voided BOOLEAN NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL,
      item TEXT NOT NULL,
      cost_mad NUMERIC NOT NULL,
      category TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `;
}

/**
 * Pushes local IndexedDB snapshot to Neon PostgreSQL Database
 */
export async function syncToNeonDB(
  connectionString: string,
  drinks: Drink[],
  records: DailyRecord[],
  sales: SaleEntry[],
  purchases: PurchaseEntry[]
) {
  const sql = getNeonSql(connectionString);
  if (!sql) throw new Error('Invalid Neon Connection String');

  await initNeonTables(connectionString);

  // Sync drinks
  for (const d of drinks) {
    await sql`
      INSERT INTO drinks (id, name, category, default_price_mad, cost_to_make_mad, bean_weight_grams, is_espresso_based, active)
      VALUES (${d.id}, ${d.name}, ${d.category}, ${d.defaultPriceMAD}, ${d.costToMakeMAD}, ${d.beanWeightGrams}, ${d.isEspressoBased}, ${d.active})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        default_price_mad = EXCLUDED.default_price_mad,
        cost_to_make_mad = EXCLUDED.cost_to_make_mad;
    `;
  }

  // Sync records
  for (const r of records) {
    await sql`
      INSERT INTO daily_records (day_id, molan_start_grams, molan_end_grams, bean_cost_per_kg_mad, actual_cash_counted_mad, status, closed_at, notes)
      VALUES (${r.dayId}, ${r.molanStartGrams}, ${r.molanEndGrams ?? null}, ${r.beanCostPerKgMAD}, ${r.actualCashCountedMAD ?? null}, ${r.status}, ${r.closedAt ?? null}, ${r.notes ?? null})
      ON CONFLICT (day_id) DO UPDATE SET
        actual_cash_counted_mad = EXCLUDED.actual_cash_counted_mad,
        status = EXCLUDED.status;
    `;
  }

  // Sync sales
  for (const s of sales) {
    await sql`
      INSERT INTO sales (id, day_id, drink_id, drink_name, category, price_mad, timestamp, voided)
      VALUES (${s.id}, ${s.dayId}, ${s.drinkId}, ${s.drinkName}, ${s.category}, ${s.priceMAD}, ${s.timestamp}, ${s.voided})
      ON CONFLICT (id) DO UPDATE SET voided = EXCLUDED.voided;
    `;
  }

  // Sync purchases
  for (const p of purchases) {
    await sql`
      INSERT INTO purchases (id, day_id, item, cost_mad, category, timestamp)
      VALUES (${p.id}, ${p.dayId}, ${p.item}, ${p.costMAD}, ${p.category}, ${p.timestamp})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  return true;
}
