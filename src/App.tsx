import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { seedHistoricalSampleData } from './db/sampleData';
import {
  DrinkRepository,
  ExpenseShortcutRepository,
  PersonalShortcutRepository,
  SalesRepository,
  KossorRepository,
  PurchaseRepository,
  PersonalSpendRepository,
  DebtPaymentRepository,
  DailyRecordRepository,
  getTodayId,
} from './repositories';
import { computeDailySummary } from './lib/calculations';
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
  DailySummary,
  ExpenseCategory,
  PersonalCategory,
} from './types';
import { Header } from './components/Header';
import { DrinkGrid } from './components/DrinkGrid';
import { ExpensesTab } from './components/ExpensesTab';
import { ClosingRoutine } from './components/ClosingRoutine';
import { Dashboard } from './components/Dashboard';
import { AuditLedger } from './components/AuditLedger';
import { DrinkCatalogManager } from './components/DrinkCatalogManager';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export const App: React.FC = () => {
  const todayId = getTodayId();
  const [activeTab, setActiveTab] = useState<'grid' | 'expenses' | 'closing' | 'dashboard' | 'ledger' | 'catalog'>('grid');
  const [isKossorMode, setIsKossorMode] = useState(false);
  const [lastLoggedActionText, setLastLoggedActionText] = useState<string | undefined>();
  const [lastLoggedId, setLastLoggedId] = useState<{ id: string; type: 'sale' | 'kossor' } | null>(null);

  // Initialize sample data & ensure active day record exists on mount
  useEffect(() => {
    async function init() {
      await seedHistoricalSampleData();
      await DailyRecordRepository.getOrCreateRecord(todayId);
    }
    init().catch(console.error);
  }, [todayId]);

  // Dexie Reactive Live Queries
  const drinks = useLiveQuery(() => db.drinks.toArray(), []) || [];
  const modifiers = useLiveQuery(() => db.modifiers.toArray(), []) || [];
  const shortcuts = useLiveQuery(() => db.expenseShortcuts.toArray(), []) || [];
  const personalShortcuts = useLiveQuery(() => db.personalShortcuts.toArray(), []) || [];
  const activeRecord = useLiveQuery(() => db.dailyRecords.get(todayId), [todayId]);
  const sales = useLiveQuery(() => db.sales.where('dayId').equals(todayId).toArray(), [todayId]) || [];
  const kossor = useLiveQuery(() => db.kossor.where('dayId').equals(todayId).toArray(), [todayId]) || [];
  const purchases = useLiveQuery(() => db.purchases.where('dayId').equals(todayId).toArray(), [todayId]) || [];
  const personalSpend = useLiveQuery(() => db.personalSpend.where('dayId').equals(todayId).toArray(), [todayId]) || [];
  const debtPayments = useLiveQuery(() => db.debtPayments.where('dayId').equals(todayId).toArray(), [todayId]) || [];
  const allDailyRecords = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const allSales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const allKossor = useLiveQuery(() => db.kossor.toArray(), []) || [];
  const allPurchases = useLiveQuery(() => db.purchases.toArray(), []) || [];

  // Default record if loading
  const record: DailyRecord = activeRecord || {
    dayId: todayId,
    molanStartGrams: 3000,
    beanCostPerKgMAD: 180,
    status: 'open',
  };

  // Set of espresso drink IDs for efficiency ratio calculation
  const espressoDrinkIds = new Set(
    drinks.filter((d) => d.isEspressoBased).map((d) => d.id)
  );

  // Centralized Daily Financial Summary Computation
  const summary: DailySummary = computeDailySummary(
    record,
    sales,
    kossor,
    purchases,
    personalSpend,
    debtPayments,
    espressoDrinkIds
  );

  // Historical Summaries for trend analysis
  const historicalSummaries: DailySummary[] = allDailyRecords
    .filter((r) => r.dayId !== todayId)
    .sort((a, b) => b.dayId.localeCompare(a.dayId))
    .map((r) => {
      const daySales = allSales.filter((s) => s.dayId === r.dayId);
      const dayKossor = allKossor.filter((k) => k.dayId === r.dayId);
      const dayPurchases = allPurchases.filter((p) => p.dayId === r.dayId);
      return computeDailySummary(r, daySales, dayKossor, dayPurchases, [], [], espressoDrinkIds);
    });

  // Action Handlers
  const handleLogSale = async (drink: Drink, selectedModifiers: Modifier[]) => {
    const modifierUpcharge = selectedModifiers.reduce((sum, m) => sum + m.priceUpchargeMAD, 0);
    const finalPrice = drink.defaultPriceMAD + modifierUpcharge;

    const newSale = await SalesRepository.logSale({
      dayId: todayId,
      drinkId: drink.id,
      drinkName: drink.name,
      category: drink.category,
      modifierIds: selectedModifiers.map((m) => m.id),
      modifierNames: selectedModifiers.map((m) => m.name),
      priceMAD: finalPrice,
    });

    setLastLoggedId({ id: newSale.id, type: 'sale' });
    const modText = selectedModifiers.length > 0 ? ` (${selectedModifiers.map((m) => m.name).join(', ')})` : '';
    setLastLoggedActionText(`Logged Paid Sale: ${drink.name}${modText} — ${finalPrice} MAD`);
  };

  const handleLogKossor = async (
    drink: Drink,
    selectedModifiers: Modifier[],
    reason: 'staff' | 'comp' | 'waste'
  ) => {
    const newKossor = await KossorRepository.logKossor({
      dayId: todayId,
      drinkId: drink.id,
      drinkName: drink.name,
      category: drink.category,
      modifierIds: selectedModifiers.map((m) => m.id),
      modifierNames: selectedModifiers.map((m) => m.name),
      costMAD: drink.costToMakeMAD,
      reason,
    });

    setLastLoggedId({ id: newKossor.id, type: 'kossor' });
    setLastLoggedActionText(`Logged Kossor (${reason.toUpperCase()}): ${drink.name} — Cost: ${drink.costToMakeMAD} MAD`);
  };

  const handleUndoLastAction = async () => {
    if (!lastLoggedId) return;
    if (lastLoggedId.type === 'sale') {
      await SalesRepository.voidSale(lastLoggedId.id);
    } else {
      await KossorRepository.voidKossor(lastLoggedId.id);
    }
    setLastLoggedActionText(undefined);
    setLastLoggedId(null);
  };

  const handleUpdateMolanEnd = async (grams: number) => {
    await DailyRecordRepository.updateRecord({ dayId: todayId, molanEndGrams: grams });
  };

  const handleAddPurchase = async (item: string, costMAD: number, category: ExpenseCategory) => {
    await PurchaseRepository.addPurchase({ dayId: todayId, item, costMAD, category });
  };

  const handleDeletePurchase = async (id: string) => {
    await PurchaseRepository.deletePurchase(id);
  };

  const handleSaveShortcut = async (shortcut: ExpenseShortcut) => {
    await ExpenseShortcutRepository.save(shortcut);
  };

  const handleDeleteShortcut = async (id: string) => {
    await ExpenseShortcutRepository.delete(id);
  };

  const handleToggleActiveShortcut = async (id: string) => {
    await ExpenseShortcutRepository.toggleActive(id);
  };

  const handleAddPersonalSpend = async (description: string, amountMAD: number, category?: PersonalCategory) => {
    await PersonalSpendRepository.addPersonalSpend({ dayId: todayId, description, amountMAD, category });
  };

  const handleDeletePersonalSpend = async (id: string) => {
    await PersonalSpendRepository.deletePersonalSpend(id);
  };

  const handleSavePersonalShortcut = async (shortcut: PersonalSpendShortcut) => {
    await PersonalShortcutRepository.save(shortcut);
  };

  const handleDeletePersonalShortcut = async (id: string) => {
    await PersonalShortcutRepository.delete(id);
  };

  const handleAddDebtPayment = async (description: string, amountMAD: number) => {
    await DebtPaymentRepository.addDebtPayment({ dayId: todayId, description, amountMAD });
  };

  const handleDeleteDebtPayment = async (id: string) => {
    await DebtPaymentRepository.deleteDebtPayment(id);
  };

  const handleCloseDay = async (actualCashMAD: number, molanEndGrams: number, notes?: string) => {
    await DailyRecordRepository.closeDay(todayId, actualCashMAD, molanEndGrams, notes);
    setActiveTab('dashboard');
  };

  const handleReopenDay = async () => {
    await DailyRecordRepository.reopenDay(todayId);
  };

  const handleSaveDrink = async (drink: Drink) => {
    await DrinkRepository.save(drink);
  };

  const handleToggleActiveDrink = async (id: string) => {
    await DrinkRepository.toggleActive(id);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Unit'],
      ['Date', summary.dayId, ''],
      ['Gross Revenue (Paid Sales)', summary.grossRevenueMAD, 'MAD'],
      ['Paid Drinks Sold', summary.paidDrinksCount, 'units'],
      ['Kossor Cost (Free/Staff)', summary.kossorCostMAD, 'MAD'],
      ['Kossor Drinks Count', summary.kossorDrinksCount, 'units'],
      ['Restocking Purchases Total', summary.purchasesTotalMAD, 'MAD'],
      ['Personal Withdrawals', summary.personalSpendTotalMAD, 'MAD'],
      ['Debt Payments', summary.debtPaymentsTotalMAD, 'MAD'],
      ['Molan Hopper Start', summary.molanStartGrams, 'grams'],
      ['Molan Hopper End', summary.molanEndGrams, 'grams'],
      ['Bean Consumption', summary.beanConsumptionGrams, 'grams'],
      ['Bean Consumption', summary.beanConsumptionKg, 'kg'],
      ['Bean Efficiency Ratio', summary.beanEfficiencyGramsPerDrink, 'grams/espresso drink'],
      ['Expected Register Cash', summary.expectedCashMAD, 'MAD'],
      ['Actual Counted Cash', summary.actualCashCountedMAD ?? 'N/A', 'MAD'],
      ['Cash Variance', summary.cashVarianceMAD ?? 'N/A', 'MAD'],
      ['Net Cash Position', summary.netCashPositionMAD, 'MAD'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rashfa_Financial_Report_${summary.dayId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Header with Fixed Financial Summary */}
      <Header
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isKossorMode={isKossorMode}
        setIsKossorMode={setIsKossorMode}
      />

      {/* Main Screen Router */}
      <main className="flex-1">
        {activeTab === 'grid' && (
          <DrinkGrid
            drinks={drinks}
            modifiers={modifiers}
            isKossorMode={isKossorMode}
            onLogSale={handleLogSale}
            onLogKossor={handleLogKossor}
            onUndoLastAction={handleUndoLastAction}
            lastLoggedActionText={lastLoggedActionText}
            isDayClosed={summary.isClosed}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            shortcuts={shortcuts}
            purchases={purchases}
            personalShortcuts={personalShortcuts}
            personalSpend={personalSpend}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            onSaveShortcut={handleSaveShortcut}
            onDeleteShortcut={handleDeleteShortcut}
            onAddPersonalSpend={handleAddPersonalSpend}
            onDeletePersonalSpend={handleDeletePersonalSpend}
            onSavePersonalShortcut={handleSavePersonalShortcut}
            onDeletePersonalShortcut={handleDeletePersonalShortcut}
            isDayClosed={summary.isClosed}
          />
        )}

        {activeTab === 'closing' && (
          <ClosingRoutine
            record={record}
            summary={summary}
            purchases={purchases}
            personalSpend={personalSpend}
            debtPayments={debtPayments}
            onUpdateMolanEnd={handleUpdateMolanEnd}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            onAddPersonalSpend={handleAddPersonalSpend}
            onDeletePersonalSpend={handleDeletePersonalSpend}
            onAddDebtPayment={handleAddDebtPayment}
            onDeleteDebtPayment={handleDeleteDebtPayment}
            onCloseDay={handleCloseDay}
            onReopenDay={handleReopenDay}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            summary={summary}
            sales={sales}
            kossor={kossor}
            historicalSummaries={historicalSummaries}
            drinks={drinks}
            allSales={allSales}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'ledger' && (
          <AuditLedger
            sales={sales}
            kossor={kossor}
            purchases={purchases}
            onVoidSale={SalesRepository.voidSale}
            onUnvoidSale={SalesRepository.unvoidSale}
            onVoidKossor={KossorRepository.voidKossor}
            onUnvoidKossor={KossorRepository.unvoidKossor}
            isDayClosed={summary.isClosed}
          />
        )}

        {activeTab === 'catalog' && (
          <DrinkCatalogManager
            drinks={drinks}
            shortcuts={shortcuts}
            onSaveDrink={handleSaveDrink}
            onToggleActiveDrink={handleToggleActiveDrink}
            onSaveShortcut={handleSaveShortcut}
            onDeleteShortcut={handleDeleteShortcut}
            onToggleActiveShortcut={handleToggleActiveShortcut}
          />
        )}
      </main>

      {/* Floating PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
};

export default App;
