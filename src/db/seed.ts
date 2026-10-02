import { Drink, Modifier, ExpenseShortcut, PersonalSpendShortcut } from '../types';

export const INITIAL_DRINKS: Drink[] = [
  // Category: Coffee (Hot & Iced)
  { id: 'drink_exp', name: 'Espresso', category: 'hot', defaultPriceMAD: 7, costToMakeMAD: 2.2, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_db_exp', name: 'Double Espresso', category: 'hot', defaultPriceMAD: 12, costToMakeMAD: 4.2, beanWeightGrams: 18, isEspressoBased: true, active: true },
  { id: 'drink_hot_choc', name: 'Hot Choclate', category: 'hot', defaultPriceMAD: 7, costToMakeMAD: 2.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_ness', name: 'Ness Ness', category: 'hot', defaultPriceMAD: 7, costToMakeMAD: 2.5, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_americano', name: 'Americano', category: 'hot', defaultPriceMAD: 7, costToMakeMAD: 2.2, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_latte', name: 'Latte', category: 'hot', defaultPriceMAD: 16, costToMakeMAD: 4.5, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_cap', name: 'Cappucino', category: 'hot', defaultPriceMAD: 14, costToMakeMAD: 4.0, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_cortado', name: 'Cortado', category: 'hot', defaultPriceMAD: 14, costToMakeMAD: 3.8, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_mocha', name: 'Mocha', category: 'hot', defaultPriceMAD: 16, costToMakeMAD: 4.8, beanWeightGrams: 9, isEspressoBased: true, active: true },
  { id: 'drink_iced_americano', name: 'Iced Americano', category: 'cold', defaultPriceMAD: 9, costToMakeMAD: 2.8, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_iced_latte', name: 'Iced Latte', category: 'cold', defaultPriceMAD: 18, costToMakeMAD: 5.5, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_iced_cap', name: 'Iced Cappucino', category: 'cold', defaultPriceMAD: 16, costToMakeMAD: 5.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_iced_mocha', name: 'Iced Mocha', category: 'cold', defaultPriceMAD: 18, costToMakeMAD: 5.8, beanWeightGrams: 14, isEspressoBased: true, active: true },

  // Category: Moroccan Tea
  { id: 'drink_atay', name: 'Atay Mna3ne3', category: 'hot', defaultPriceMAD: 7, costToMakeMAD: 1.5, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Milkshake
  { id: 'drink_ms_vanilla', name: 'Vanilla Milkshake', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_ms_choc', name: 'Chocolate Milkshake', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_ms_oreo', name: 'Oreo Milkshake', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 7.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_ms_straw', name: 'Strawberry Milkshake', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Mojito
  { id: 'drink_moj_salam', name: 'Salam (Classic Mojito)', category: 'mojito', defaultPriceMAD: 14, costToMakeMAD: 4.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_moj_chef', name: 'Chefchaouen (Blue Mojito)', category: 'mojito', defaultPriceMAD: 15, costToMakeMAD: 5.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_moj_zahra', name: 'Zahra (Strawberry Mojito)', category: 'mojito', defaultPriceMAD: 15, costToMakeMAD: 5.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Spark & Fizz
  { id: 'drink_soda', name: 'Soda (Coca, Sprite, Poms, Hawai)', category: 'water_other', defaultPriceMAD: 8, costToMakeMAD: 4.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_redbull', name: 'Redbull', category: 'water_other', defaultPriceMAD: 25, costToMakeMAD: 14.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Frappuccino
  { id: 'drink_frap_caramel', name: 'Frappe Caramel', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_frap_vanilla', name: 'Frappe Vanilla', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_frap_hazelnut', name: 'Frappe Hazelnut', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_frap_choc', name: 'Frappe Chocolate', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 14, isEspressoBased: true, active: true },
  { id: 'drink_frap_oreo', name: 'Frappe Oreo', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 14, isEspressoBased: true, active: true },

  // Category: Juices
  { id: 'drink_juice_apple', name: 'Apple Juice', category: 'cold', defaultPriceMAD: 12, costToMakeMAD: 4.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_juice_banana', name: 'Banana Juice', category: 'cold', defaultPriceMAD: 12, costToMakeMAD: 3.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_juice_orange', name: 'Orange Juice', category: 'cold', defaultPriceMAD: 12, costToMakeMAD: 3.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_juice_avocado', name: 'Avocado Juice', category: 'cold', defaultPriceMAD: 15, costToMakeMAD: 5.5, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Smoothies
  { id: 'drink_sm_ananas', name: 'Ananas Smoothie', category: 'cold', defaultPriceMAD: 25, costToMakeMAD: 8.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_sm_banana', name: 'Banana Smoothie', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_sm_avocado', name: 'Avocado Smoothie', category: 'cold', defaultPriceMAD: 25, costToMakeMAD: 8.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_sm_straw', name: 'Strawberry Smoothie', category: 'cold', defaultPriceMAD: 25, costToMakeMAD: 7.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_sm_choc', name: 'Chocolate Smoothie', category: 'cold', defaultPriceMAD: 20, costToMakeMAD: 6.0, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Les Crêpes (رشفة Rashfa)
  { id: 'drink_crepe_nutella', name: 'Crêpe Nutella', category: 'water_other', defaultPriceMAD: 15, costToMakeMAD: 5.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_crepe_caramel', name: 'Crêpe Caramel', category: 'water_other', defaultPriceMAD: 18, costToMakeMAD: 5.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_crepe_oreo', name: 'Crêpe Oreo', category: 'water_other', defaultPriceMAD: 20, costToMakeMAD: 6.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_crepe_ban_nutella', name: 'Crêpe Banana & Nutella', category: 'water_other', defaultPriceMAD: 23, costToMakeMAD: 7.5, beanWeightGrams: 0, isEspressoBased: false, active: true },
  { id: 'drink_crepe_ban_caramel', name: 'Crêpe Banana & Caramel', category: 'water_other', defaultPriceMAD: 23, costToMakeMAD: 7.5, beanWeightGrams: 0, isEspressoBased: false, active: true },

  // Category: Special Drinks
  { id: 'drink_italian_choc', name: 'مشروب الشوكولاتة الإيطالية (Italian Hot Chocolate)', category: 'hot', defaultPriceMAD: 19, costToMakeMAD: 6.0, beanWeightGrams: 0, isEspressoBased: false, active: true },
];

export const INITIAL_MODIFIERS: Modifier[] = [
  { id: 'mod_flavor_joy', name: 'Add Flavor (+3 MAD)', priceUpchargeMAD: 3, active: true },
  { id: 'mod_caramel', name: 'Caramel Flavor', priceUpchargeMAD: 3, active: true },
  { id: 'mod_vanilla', name: 'Vanilla Flavor', priceUpchargeMAD: 3, active: true },
  { id: 'mod_pistachio', name: 'Pistachio Flavor', priceUpchargeMAD: 3, active: true },
  { id: 'mod_hazelnut', name: 'Hazelnut Flavor', priceUpchargeMAD: 3, active: true },
  { id: 'mod_extra_shot', name: 'Extra Shot Espresso', priceUpchargeMAD: 5, active: true },
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
