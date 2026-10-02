import { Drink, Modifier, ExpenseShortcut, PersonalSpendShortcut } from '../types';

export const INITIAL_DRINKS: Drink[] = [
  // Hot Coffee & Espresso
  { id: 'drink_exp', name: 'Espresso', category: 'hot', defaultPriceMAD: 12, costToMakeMAD: 3.5, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_db_exp', name: 'Double Espresso', category: 'hot', defaultPriceMAD: 18, costToMakeMAD: 6.5, beanWeightGrams: 18, isEspressoBased: true, active: true },
  { id: 'drink_ness', name: 'Ness Ness', category: 'hot', defaultPriceMAD: 13, costToMakeMAD: 4.2, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_cream', name: 'Café Crème', category: 'hot', defaultPriceMAD: 14, costToMakeMAD: 4.8, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_cap', name: 'Cappuccino', category: 'hot', defaultPriceMAD: 16, costToMakeMAD: 5.5, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_tea', name: 'Thé Marocain (Tea)', category: 'hot', defaultPriceMAD: 10, costToMakeMAD: 2.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_hot_choc', name: 'Hot Chocolate', category: 'hot', defaultPriceMAD: 18, costToMakeMAD: 6.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_blk_choc', name: 'Black Chocolate', category: 'hot', defaultPriceMAD: 20, costToMakeMAD: 7.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Cold Coffee & Drinks
  { id: 'drink_iced_latte', name: 'Iced Latte', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_iced_cap', name: 'Iced Cappuccino', category: 'cold', defaultPriceMAD: 22, costToMakeMAD: 7.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_iced_mocha', name: 'Iced Mocha', category: 'cold', defaultPriceMAD: 24, costToMakeMAD: 8.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_frap', name: 'Frappuccino', category: 'cold', defaultPriceMAD: 24, costToMakeMAD: 8.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_milkshake', name: 'Milkshake', category: 'cold', defaultPriceMAD: 25, costToMakeMAD: 9.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_smoothie', name: 'Smoothie', category: 'cold', defaultPriceMAD: 25, costToMakeMAD: 9.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Mojitos
  { id: 'drink_moj_chef', name: 'Mojito Chefchaouen', category: 'mojito', defaultPriceMAD: 25, costToMakeMAD: 8.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_moj_zahra', name: 'Mojito Zahra', category: 'mojito', defaultPriceMAD: 25, costToMakeMAD: 8.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_moj_classic', name: 'Mojito Classic', category: 'mojito', defaultPriceMAD: 22, costToMakeMAD: 7.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Water & Refreshment
  { id: 'drink_water', name: 'Water (Eau)', category: 'water_other', defaultPriceMAD: 5, costToMakeMAD: 1.8, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_goblet', name: 'Gobelet Emporter', category: 'water_other', defaultPriceMAD: 2, costToMakeMAD: 0.4, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_hic', name: 'HIC / Canette', category: 'water_other', defaultPriceMAD: 10, costToMakeMAD: 6.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_hawaii', name: 'Hawaii Soda', category: 'water_other', defaultPriceMAD: 12, costToMakeMAD: 5.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
];

export const INITIAL_MODIFIERS: Modifier[] = [
  { id: 'mod_caramel', name: 'Caramel', priceUpchargeMAD: 0, active: true },
  { id: 'mod_vanilla', name: 'Vanilla', priceUpchargeMAD: 0, active: true },
  { id: 'mod_chocolate', name: 'Chocolate', priceUpchargeMAD: 0, active: true },
  { id: 'mod_pistachio', name: 'Pistachio', priceUpchargeMAD: 0, active: true },
  { id: 'mod_extra_shot', name: 'Extra Shot Espresso', priceUpchargeMAD: 5, active: true },
  { id: 'mod_oat_milk', name: 'Oat Milk', priceUpchargeMAD: 4, active: true },
];

export const INITIAL_EXPENSE_SHORTCUTS: ExpenseShortcut[] = [
  { id: 'exp_milk_uht', name: '1L Milk UHT (Lait UHT)', defaultCostMAD: 10, category: 'dairy', active: true },
  { id: 'exp_milk_norm', name: '1L Milk Normal (Lait Frais)', defaultCostMAD: 8, category: 'dairy', active: true },
  { id: 'exp_banana', name: '1Kg Banana (Banane)', defaultCostMAD: 12, category: 'fruit', active: true },
  { id: 'exp_coffee_beans', name: 'Coffee Beans 1kg (Café Grain)', defaultCostMAD: 180, category: 'beans', active: true },
  { id: 'exp_sugar', name: 'Sugar 5kg (Sucre)', defaultCostMAD: 35, category: 'other', active: true },
  { id: 'exp_cups', name: 'Cups 8oz (Gobelets 100pcs)', defaultCostMAD: 45, category: 'packaging', active: true },
  { id: 'exp_ice', name: 'Ice Bag 5kg (Glaçons)', defaultCostMAD: 25, category: 'other', active: true },
  { id: 'exp_syrup', name: 'Syrup Bottle (Sirop Monin)', defaultCostMAD: 65, category: 'syrup', active: true },
];

export const INITIAL_PERSONAL_SHORTCUTS: PersonalSpendShortcut[] = [
  { id: 'ps_lunch', label: 'Owner Lunch (Déjeuner)', defaultAmountMAD: 30, category: 'lunch', active: true },
  { id: 'ps_coffee', label: 'Personal Coffee / Drinks', defaultAmountMAD: 10, category: 'coffee', active: true },
  { id: 'ps_taxi', label: 'Taxi / Transport', defaultAmountMAD: 20, category: 'transport', active: true },
  { id: 'ps_cigs', label: 'Personal Cigarettes / Misc', defaultAmountMAD: 35, category: 'other', active: true },
  { id: 'ps_draw', label: 'Personal Cash Withdrawal', defaultAmountMAD: 100, category: 'personal_draw', active: true },
];
