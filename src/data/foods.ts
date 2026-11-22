import type { Food } from '../types'

/**
 * FITTRACK food database.
 *
 * Every food is defined with accurate per-100g nutrition (standard Indian
 * nutrition data, IFCT / NIN "Nutritive Value of Indian Foods" figures) and a
 * default serving size. Per-serving macros are derived from the per-100g
 * values, so the "by weight (grams)" mode is exactly linear and accurate.
 *
 * Custom foods (e.g. saved from the Scan page) are merged at runtime via
 * registerCustomFoods().
 */

interface FoodRaw {
  id: string
  name: string
  category: string
  servingLabel: string
  servingGrams: number
  /** nutrition per 100 g / 100 ml */
  kcal: number
  p: number
  c: number
  f: number
}

/** Accurate per-100g nutrition for each food */
const RAW: FoodRaw[] = [
  // ---- Grains & Breads ----
  { id: 'roti', name: 'Roti (Whole Wheat)', category: 'Grains & Breads', servingLabel: '1 medium roti (40g)', servingGrams: 40, kcal: 265, p: 9.9, c: 48.6, f: 2.5 },
  { id: 'rice-white', name: 'Steamed Rice', category: 'Grains & Breads', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 130, p: 2.7, c: 28.2, f: 0.3 },
  { id: 'rice-brown', name: 'Brown Rice', category: 'Grains & Breads', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 123, p: 2.7, c: 25.6, f: 1.0 },
  { id: 'paratha', name: 'Plain Paratha', category: 'Grains & Breads', servingLabel: '1 paratha (80g)', servingGrams: 80, kcal: 320, p: 6.4, c: 45.2, f: 12.8 },
  { id: 'paratha-aloo', name: 'Aloo Paratha', category: 'Grains & Breads', servingLabel: '1 paratha (100g)', servingGrams: 100, kcal: 290, p: 5.6, c: 42.0, f: 11.2 },
  { id: 'naan', name: 'Butter Naan', category: 'Grains & Breads', servingLabel: '1 naan (90g)', servingGrams: 90, kcal: 335, p: 8.5, c: 48.0, f: 12.0 },
  { id: 'puri', name: 'Puri (fried)', category: 'Grains & Breads', servingLabel: '2 puris (60g)', servingGrams: 60, kcal: 320, p: 6.7, c: 40.0, f: 15.0 },
  { id: 'bajra-roti', name: 'Bajra Roti', category: 'Grains & Breads', servingLabel: '1 roti (60g)', servingGrams: 60, kcal: 270, p: 8.0, c: 42.0, f: 4.5 },

  // ---- Dals & Legumes ----
  { id: 'dal-toor', name: 'Toor Dal', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 90, p: 5.5, c: 13.5, f: 1.3 },
  { id: 'dal-tadka', name: 'Dal Tadka', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 130, p: 5.2, c: 14.0, f: 5.5 },
  { id: 'moong-dal', name: 'Moong Dal Tadka', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 90, p: 6.0, c: 14.0, f: 1.5 },
  { id: 'chana-dal', name: 'Chana Dal', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 105, p: 5.5, c: 17.0, f: 1.5 },
  { id: 'lobia', name: 'Lobia (Black-Eyed Peas)', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 100, p: 6.0, c: 15.5, f: 1.3 },
  { id: 'rajma', name: 'Rajma Masala', category: 'Dals & Legumes', servingLabel: '1 katori (140g)', servingGrams: 140, kcal: 105, p: 5.7, c: 15.5, f: 2.6 },
  { id: 'chana', name: 'Chana Masala', category: 'Dals & Legumes', servingLabel: '1 katori (140g)', servingGrams: 140, kcal: 145, p: 6.5, c: 20.0, f: 4.5 },
  { id: 'sambar', name: 'Sambar', category: 'Dals & Legumes', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 65, p: 3.0, c: 8.5, f: 2.0 },

  // ---- Dairy & Eggs ----
  { id: 'milk', name: 'Full Cream Milk', category: 'Dairy & Eggs', servingLabel: '1 glass (250ml)', servingGrams: 250, kcal: 62, p: 3.2, c: 4.9, f: 3.5 },
  { id: 'curd', name: 'Curd (Dahi)', category: 'Dairy & Eggs', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 60, p: 3.5, c: 4.7, f: 3.3 },
  { id: 'greek-yogurt', name: 'Greek Yogurt (low-fat)', category: 'Dairy & Eggs', servingLabel: '1 bowl (150g)', servingGrams: 150, kcal: 60, p: 10.0, c: 3.6, f: 0.5 },
  { id: 'paneer', name: 'Paneer (raw cubes)', category: 'Dairy & Eggs', servingLabel: '100g', servingGrams: 100, kcal: 265, p: 18.0, c: 3.5, f: 20.5 },
  { id: 'butter', name: 'Butter', category: 'Dairy & Eggs', servingLabel: '1 tbsp (10g)', servingGrams: 10, kcal: 717, p: 0.9, c: 0.1, f: 81.0 },
  { id: 'cheese', name: 'Cheese Cube', category: 'Dairy & Eggs', servingLabel: '1 cube (30g)', servingGrams: 30, kcal: 402, p: 25.0, c: 1.3, f: 33.0 },
  { id: 'ghee', name: 'Ghee', category: 'Dairy & Eggs', servingLabel: '1 tsp (5g)', servingGrams: 5, kcal: 900, p: 0.0, c: 0.0, f: 100.0 },
  { id: 'egg-boiled', name: 'Boiled Egg', category: 'Dairy & Eggs', servingLabel: '1 large egg (50g)', servingGrams: 50, kcal: 155, p: 13.0, c: 1.1, f: 11.0 },
  { id: 'egg-bhurji', name: 'Egg Bhurji', category: 'Dairy & Eggs', servingLabel: '2 eggs (120g)', servingGrams: 120, kcal: 183, p: 10.8, c: 3.3, f: 13.3 },

  // ---- Non-Veg ----
  { id: 'chicken-curry', name: 'Chicken Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 163, p: 14.7, c: 5.3, f: 9.3 },
  { id: 'chicken-breast', name: 'Grilled Chicken Breast', category: 'Non-Veg', servingLabel: '100g', servingGrams: 100, kcal: 165, p: 31.0, c: 0.0, f: 3.6 },
  { id: 'butter-chicken', name: 'Butter Chicken', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 213, p: 12.7, c: 6.7, f: 14.7 },
  { id: 'fish-curry', name: 'Fish Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 153, p: 14.0, c: 4.0, f: 8.7 },
  { id: 'fish-fry', name: 'Fish Fry', category: 'Non-Veg', servingLabel: '1 piece (100g)', servingGrams: 100, kcal: 180, p: 20.0, c: 4.0, f: 9.0 },
  { id: 'prawns', name: 'Prawns (steamed)', category: 'Non-Veg', servingLabel: '100g', servingGrams: 100, kcal: 99, p: 21.0, c: 0.2, f: 1.4 },
  { id: 'mutton-curry', name: 'Mutton Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 200, p: 15.0, c: 5.0, f: 14.0 },
  { id: 'chicken-biryani', name: 'Chicken Biryani', category: 'Non-Veg', servingLabel: '1 plate (200g)', servingGrams: 200, kcal: 160, p: 7.0, c: 20.0, f: 5.5 },

  // ---- Breakfast ----
  { id: 'poha', name: 'Poha', category: 'Breakfast', servingLabel: '1 plate (200g)', servingGrams: 200, kcal: 125, p: 2.6, c: 22.5, f: 3.0 },
  { id: 'idli', name: 'Idli', category: 'Breakfast', servingLabel: '2 pieces (80g)', servingGrams: 80, kcal: 145, p: 5.0, c: 24.0, f: 0.4 },
  { id: 'dosa', name: 'Plain Dosa', category: 'Breakfast', servingLabel: '1 dosa (90g)', servingGrams: 90, kcal: 187, p: 4.4, c: 31.0, f: 4.4 },
  { id: 'dosa-masala', name: 'Masala Dosa', category: 'Breakfast', servingLabel: '1 dosa (150g)', servingGrams: 150, kcal: 167, p: 3.5, c: 27.0, f: 5.3 },
  { id: 'uttapam', name: 'Uttapam', category: 'Breakfast', servingLabel: '1 uttapam (120g)', servingGrams: 120, kcal: 175, p: 4.4, c: 28.0, f: 4.6 },
  { id: 'medu-vada', name: 'Medu Vada', category: 'Breakfast', servingLabel: '2 vadas (80g)', servingGrams: 80, kcal: 300, p: 6.5, c: 30.0, f: 16.0 },
  { id: 'upma', name: 'Upma', category: 'Breakfast', servingLabel: '1 plate (200g)', servingGrams: 200, kcal: 115, p: 3.1, c: 20.4, f: 3.2 },
  { id: 'oats', name: 'Oats (Dry)', category: 'Breakfast', servingLabel: '40g dry', servingGrams: 40, kcal: 389, p: 16.9, c: 66.3, f: 6.9 },
  { id: 'oats-milk', name: 'Oats with Milk', category: 'Breakfast', servingLabel: '1 bowl (250g)', servingGrams: 250, kcal: 100, p: 4.4, c: 13.6, f: 2.8 },

  // ---- Curries & Sabzi ----
  { id: 'sabzi', name: 'Mixed Veg Sabzi', category: 'Curries & Sabzi', servingLabel: '1 katori (130g)', servingGrams: 130, kcal: 100, p: 2.3, c: 11.5, f: 5.4 },
  { id: 'palak-paneer', name: 'Palak Paneer', category: 'Curries & Sabzi', servingLabel: '1 katori (150g)', servingGrams: 150, kcal: 153, p: 8.0, c: 6.7, f: 10.7 },
  { id: 'paneer-bhurji', name: 'Paneer Bhurji', category: 'Curries & Sabzi', servingLabel: '1 katori (120g)', servingGrams: 120, kcal: 208, p: 13.3, c: 6.7, f: 14.2 },
  { id: 'khichdi', name: 'Vegetable Khichdi', category: 'Curries & Sabzi', servingLabel: '1 katori (200g)', servingGrams: 200, kcal: 100, p: 3.5, c: 16.0, f: 2.0 },

  // ---- Snacks ----
  { id: 'samosa', name: 'Samosa', category: 'Snacks', servingLabel: '1 piece (60g)', servingGrams: 60, kcal: 250, p: 3.3, c: 26.7, f: 13.3 },
  { id: 'dhokla', name: 'Dhokla', category: 'Snacks', servingLabel: '2 pieces (80g)', servingGrams: 80, kcal: 150, p: 6.3, c: 22.5, f: 3.8 },
  { id: 'biscuits', name: 'Marie Biscuits', category: 'Snacks', servingLabel: '2 biscuits (20g)', servingGrams: 20, kcal: 460, p: 7.0, c: 77.0, f: 11.0 },
  { id: 'maggi', name: 'Masala Noodles (1 pack)', category: 'Snacks', servingLabel: '1 pack (70g dry)', servingGrams: 70, kcal: 446, p: 9.0, c: 60.0, f: 17.0 },
  { id: 'sandwich', name: 'Veg Sandwich', category: 'Snacks', servingLabel: '1 sandwich (150g)', servingGrams: 150, kcal: 200, p: 6.0, c: 28.0, f: 7.0 },
  { id: 'popcorn', name: 'Popcorn (air-popped)', category: 'Snacks', servingLabel: '1 bowl (30g)', servingGrams: 30, kcal: 387, p: 12.9, c: 77.8, f: 4.5 },
  { id: 'dark-chocolate', name: 'Dark Chocolate (70%)', category: 'Snacks', servingLabel: '2 squares (25g)', servingGrams: 25, kcal: 598, p: 7.8, c: 45.9, f: 42.6 },

  // ---- Fruits ----
  { id: 'banana', name: 'Banana', category: 'Fruits', servingLabel: '1 medium (118g)', servingGrams: 118, kcal: 89, p: 1.1, c: 22.8, f: 0.3 },
  { id: 'apple', name: 'Apple', category: 'Fruits', servingLabel: '1 medium (182g)', servingGrams: 182, kcal: 52, p: 0.3, c: 13.8, f: 0.2 },
  { id: 'mango', name: 'Mango', category: 'Fruits', servingLabel: '1 cup (165g)', servingGrams: 165, kcal: 60, p: 0.8, c: 15.0, f: 0.4 },
  { id: 'orange', name: 'Orange', category: 'Fruits', servingLabel: '1 medium (154g)', servingGrams: 154, kcal: 47, p: 0.9, c: 11.8, f: 0.1 },
  { id: 'grapes', name: 'Grapes', category: 'Fruits', servingLabel: '1 cup (100g)', servingGrams: 100, kcal: 69, p: 0.7, c: 18.0, f: 0.2 },
  { id: 'papaya', name: 'Papaya', category: 'Fruits', servingLabel: '1 cup (140g)', servingGrams: 140, kcal: 43, p: 0.5, c: 10.8, f: 0.3 },
  { id: 'guava', name: 'Guava', category: 'Fruits', servingLabel: '1 medium (100g)', servingGrams: 100, kcal: 68, p: 2.6, c: 14.3, f: 1.0 },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruits', servingLabel: '1 wedge (150g)', servingGrams: 150, kcal: 30, p: 0.6, c: 7.6, f: 0.2 },
  { id: 'dates', name: 'Dates', category: 'Fruits', servingLabel: '2-3 dates (24g)', servingGrams: 24, kcal: 282, p: 2.5, c: 75.0, f: 0.4 },

  // ---- Beverages ----
  { id: 'tea', name: 'Masala Chai', category: 'Beverages', servingLabel: '1 cup (150ml)', servingGrams: 150, kcal: 40, p: 1.3, c: 4.0, f: 1.3 },
  { id: 'coffee', name: 'Milk Coffee', category: 'Beverages', servingLabel: '1 cup (150ml)', servingGrams: 150, kcal: 53, p: 2.0, c: 6.0, f: 2.0 },
  { id: 'lassi', name: 'Sweet Lassi', category: 'Beverages', servingLabel: '1 glass (250ml)', servingGrams: 250, kcal: 52, p: 1.6, c: 8.8, f: 0.8 },

  // ---- Nuts & Seeds ----
  { id: 'almonds', name: 'Almonds', category: 'Nuts & Seeds', servingLabel: '10 pieces (12g)', servingGrams: 12, kcal: 579, p: 21.2, c: 21.6, f: 49.9 },
  { id: 'peanuts', name: 'Roasted Peanuts', category: 'Nuts & Seeds', servingLabel: '30g', servingGrams: 30, kcal: 567, p: 25.8, c: 16.1, f: 49.2 },
  { id: 'walnuts', name: 'Walnuts', category: 'Nuts & Seeds', servingLabel: '4 halves (14g)', servingGrams: 14, kcal: 654, p: 15.2, c: 13.7, f: 65.2 },
  { id: 'cashews', name: 'Cashews', category: 'Nuts & Seeds', servingLabel: '8-10 pieces (16g)', servingGrams: 16, kcal: 553, p: 18.2, c: 30.2, f: 43.8 },
]

export const FOOD_CATEGORIES = [
  'All',
  ...Array.from(new Set(RAW.map((f) => f.category))),
]

const r1 = (n: number) => Math.round(n * 10) / 10

/** Derive accurate per-serving macros from the per-100g values */
function toFood(raw: FoodRaw): Food {
  const k = raw.servingGrams / 100
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    servingLabel: raw.servingLabel,
    servingGrams: raw.servingGrams,
    calories: Math.round(raw.kcal * k),
    protein: r1(raw.p * k),
    carbs: r1(raw.c * k),
    fat: r1(raw.f * k),
  }
}

export const FOODS: Food[] = RAW.map(toFood)

/* ------------------------------------------------------------------ */
/*  Custom foods (added from the Scan page, persisted in localStorage)  */
/* ------------------------------------------------------------------ */

const customRegistry = new Map<string, Food>()

/** Called by AppContext whenever the persisted custom-food list changes */
export function registerCustomFoods(foods: Food[]): void {
  customRegistry.clear()
  for (const f of Array.isArray(foods) ? foods : []) {
    // drop only entries that could crash rendering / produce NaN totals
    if (!f || typeof f.id !== 'string' || typeof f.name !== 'string') continue
    const num = (v: unknown, fallback: number) =>
      typeof v === 'number' && Number.isFinite(v) ? v : fallback
    customRegistry.set(f.id, {
      ...f,
      servingGrams: Math.max(1, num(f.servingGrams, 100)),
      calories: Math.max(0, num(f.calories, 0)),
      protein: Math.max(0, num(f.protein, 0)),
      carbs: Math.max(0, num(f.carbs, 0)),
      fat: Math.max(0, num(f.fat, 0)),
    })
  }
}

export function foodById(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id) ?? customRegistry.get(id)
}

/**
 * Scale a food's macros to an amount.
 *  - servings = number of default servings, OR
 *  - exact grams are computed linearly from the per-serving size
 */
export function scaleMacros(food: Food, servings: number): Food {
  // never let NaN/Infinity (bad stored data or a zero serving size) leak into the UI
  const k = Number.isFinite(servings) && servings > 0 ? servings : 0
  return {
    ...food,
    calories: Math.round(food.calories * k),
    protein: r1(food.protein * k),
    carbs: r1(food.carbs * k),
    fat: r1(food.fat * k),
  }
}
