import type { Food } from '../types'

export const EXTENDED_FOODS: Food[] = [
  // Grains & Breads
  { id: 'ext-roti', name: 'Roti (Whole Wheat)', category: 'Grains & Breads', servingLabel: '1 medium roti (40g)', servingGrams: 40, calories: 106, protein: 4.0, carbs: 19.4, fat: 1.0 },
  { id: 'ext-rice-white', name: 'Steamed White Rice', category: 'Grains & Breads', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 195, protein: 4.1, carbs: 42.3, fat: 0.5 },
  { id: 'ext-rice-brown', name: 'Brown Rice', category: 'Grains & Breads', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 185, protein: 4.1, carbs: 38.4, fat: 1.5 },
  { id: 'ext-paratha', name: 'Plain Paratha', category: 'Grains & Breads', servingLabel: '1 paratha (80g)', servingGrams: 80, calories: 256, protein: 5.1, carbs: 36.2, fat: 10.2 },
  { id: 'ext-paratha-aloo', name: 'Aloo Paratha', category: 'Grains & Breads', servingLabel: '1 paratha (100g)', servingGrams: 100, calories: 290, protein: 5.6, carbs: 42.0, fat: 11.2 },
  { id: 'ext-naan', name: 'Butter Naan', category: 'Grains & Breads', servingLabel: '1 naan (90g)', servingGrams: 90, calories: 302, protein: 7.7, carbs: 43.2, fat: 10.8 },
  { id: 'ext-puri', name: 'Puri (fried)', category: 'Grains & Breads', servingLabel: '2 puris (60g)', servingGrams: 60, calories: 192, protein: 4.0, carbs: 24.0, fat: 9.0 },
  { id: 'ext-bajra-roti', name: 'Bajra Roti', category: 'Grains & Breads', servingLabel: '1 roti (60g)', servingGrams: 60, calories: 162, protein: 4.8, carbs: 25.2, fat: 2.7 },
  { id: 'ext-missi-roti', name: 'Missi Roti', category: 'Grains & Breads', servingLabel: '1 roti (60g)', servingGrams: 60, calories: 180, protein: 6.0, carbs: 28.0, fat: 4.0 },

  // Dals & Legumes
  { id: 'ext-dal-toor', name: 'Toor Dal', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 117, protein: 7.2, carbs: 17.6, fat: 1.7 },
  { id: 'ext-dal-tadka', name: 'Dal Tadka', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 169, protein: 6.8, carbs: 18.2, fat: 7.2 },
  { id: 'ext-moong-dal', name: 'Moong Dal Tadka', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 117, protein: 7.8, carbs: 18.2, fat: 2.0 },
  { id: 'ext-chana-dal', name: 'Chana Dal', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 137, protein: 7.2, carbs: 22.1, fat: 2.0 },
  { id: 'ext-lobia', name: 'Lobia (Black-Eyed Peas)', category: 'Dals & Legumes', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 130, protein: 7.8, carbs: 20.2, fat: 1.7 },
  { id: 'ext-rajma', name: 'Rajma Masala', category: 'Dals & Legumes', servingLabel: '1 katori (140g)', servingGrams: 140, calories: 147, protein: 8.0, carbs: 21.7, fat: 3.6 },
  { id: 'ext-chana', name: 'Chana Masala', category: 'Dals & Legumes', servingLabel: '1 katori (140g)', servingGrams: 140, calories: 203, protein: 9.1, carbs: 28.0, fat: 6.3 },
  { id: 'ext-sambar', name: 'Sambar', category: 'Dals & Legumes', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 98, protein: 4.5, carbs: 12.8, fat: 3.0 },
  { id: 'ext-dal-makhani', name: 'Dal Makhani', category: 'Dals & Legumes', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 225, protein: 9.0, carbs: 15.0, fat: 15.0 },

  // Dairy & Eggs
  { id: 'ext-milk', name: 'Full Cream Milk', category: 'Dairy & Eggs', servingLabel: '1 glass (250ml)', servingGrams: 250, calories: 155, protein: 8.0, carbs: 12.3, fat: 8.8 },
  { id: 'ext-curd', name: 'Curd (Dahi)', category: 'Dairy & Eggs', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 90, protein: 5.3, carbs: 7.1, fat: 5.0 },
  { id: 'ext-greek-yogurt', name: 'Greek Yogurt (low-fat)', category: 'Dairy & Eggs', servingLabel: '1 bowl (150g)', servingGrams: 150, calories: 90, protein: 15.0, carbs: 5.4, fat: 0.8 },
  { id: 'ext-paneer', name: 'Paneer (raw cubes)', category: 'Dairy & Eggs', servingLabel: '100g', servingGrams: 100, calories: 265, protein: 18.0, carbs: 3.5, fat: 20.5 },
  { id: 'ext-butter', name: 'Butter', category: 'Dairy & Eggs', servingLabel: '1 tbsp (10g)', servingGrams: 10, calories: 72, protein: 0.1, carbs: 0.0, fat: 8.1 },
  { id: 'ext-cheese', name: 'Cheese Cube', category: 'Dairy & Eggs', servingLabel: '1 cube (30g)', servingGrams: 30, calories: 121, protein: 7.5, carbs: 0.4, fat: 9.9 },
  { id: 'ext-ghee', name: 'Ghee', category: 'Dairy & Eggs', servingLabel: '1 tsp (5g)', servingGrams: 5, calories: 45, protein: 0.0, carbs: 0.0, fat: 5.0 },
  { id: 'ext-egg-boiled', name: 'Boiled Egg', category: 'Dairy & Eggs', servingLabel: '1 large egg (50g)', servingGrams: 50, calories: 78, protein: 6.5, carbs: 0.6, fat: 5.5 },
  { id: 'ext-egg-bhurji', name: 'Egg Bhurji', category: 'Dairy & Eggs', servingLabel: '2 eggs (120g)', servingGrams: 120, calories: 220, protein: 13.0, carbs: 4.0, fat: 16.0 },
  { id: 'ext-omelette', name: 'Masala Omelette', category: 'Dairy & Eggs', servingLabel: '2 eggs (120g)', servingGrams: 120, calories: 240, protein: 12.0, carbs: 6.0, fat: 18.0 },

  // Non-Veg
  { id: 'ext-chicken-curry', name: 'Chicken Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 245, protein: 22.1, carbs: 8.0, fat: 14.0 },
  { id: 'ext-chicken-breast', name: 'Grilled Chicken Breast', category: 'Non-Veg', servingLabel: '100g', servingGrams: 100, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 'ext-butter-chicken', name: 'Butter Chicken', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 320, protein: 19.1, carbs: 10.1, fat: 22.1 },
  { id: 'ext-fish-curry', name: 'Fish Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 230, protein: 21.0, carbs: 6.0, fat: 13.1 },
  { id: 'ext-fish-fry', name: 'Fish Fry', category: 'Non-Veg', servingLabel: '1 piece (100g)', servingGrams: 100, calories: 180, protein: 20.0, carbs: 4.0, fat: 9.0 },
  { id: 'ext-prawns', name: 'Prawns (steamed)', category: 'Non-Veg', servingLabel: '100g', servingGrams: 100, calories: 99, protein: 21.0, carbs: 0.2, fat: 1.4 },
  { id: 'ext-mutton-curry', name: 'Mutton Curry', category: 'Non-Veg', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 300, protein: 22.5, carbs: 7.5, fat: 21.0 },
  { id: 'ext-chicken-biryani', name: 'Chicken Biryani', category: 'Non-Veg', servingLabel: '1 plate (200g)', servingGrams: 200, calories: 320, protein: 14.0, carbs: 40.0, fat: 11.0 },
  { id: 'ext-mutton-biryani', name: 'Mutton Biryani', category: 'Non-Veg', servingLabel: '1 plate (250g)', servingGrams: 250, calories: 450, protein: 18.0, carbs: 50.0, fat: 18.0 },

  // Breakfast
  { id: 'ext-poha', name: 'Poha', category: 'Breakfast', servingLabel: '1 plate (200g)', servingGrams: 200, calories: 250, protein: 5.2, carbs: 45.0, fat: 6.0 },
  { id: 'ext-idli', name: 'Idli', category: 'Breakfast', servingLabel: '2 pieces (80g)', servingGrams: 80, calories: 116, protein: 4.0, carbs: 19.2, fat: 0.3 },
  { id: 'ext-dosa', name: 'Plain Dosa', category: 'Breakfast', servingLabel: '1 dosa (90g)', servingGrams: 90, calories: 168, protein: 4.0, carbs: 27.9, fat: 4.0 },
  { id: 'ext-dosa-masala', name: 'Masala Dosa', category: 'Breakfast', servingLabel: '1 dosa (150g)', servingGrams: 150, calories: 251, protein: 5.3, carbs: 40.5, fat: 8.0 },
  { id: 'ext-uttapam', name: 'Uttapam', category: 'Breakfast', servingLabel: '1 uttapam (120g)', servingGrams: 120, calories: 210, protein: 5.3, carbs: 33.6, fat: 5.5 },
  { id: 'ext-medu-vada', name: 'Medu Vada', category: 'Breakfast', servingLabel: '2 vadas (80g)', servingGrams: 80, calories: 240, protein: 5.2, carbs: 24.0, fat: 12.8 },
  { id: 'ext-upma', name: 'Upma', category: 'Breakfast', servingLabel: '1 plate (200g)', servingGrams: 200, calories: 230, protein: 6.2, carbs: 40.8, fat: 6.4 },
  { id: 'ext-oats', name: 'Oats (Dry)', category: 'Breakfast', servingLabel: '40g dry', servingGrams: 40, calories: 156, protein: 6.8, carbs: 26.5, fat: 2.8 },
  { id: 'ext-oats-milk', name: 'Oats with Milk', category: 'Breakfast', servingLabel: '1 bowl (250g)', servingGrams: 250, calories: 250, protein: 11.0, carbs: 34.0, fat: 7.0 },
  { id: 'ext-cornflakes', name: 'Cornflakes with Milk', category: 'Breakfast', servingLabel: '1 bowl (200g)', servingGrams: 200, calories: 220, protein: 6.0, carbs: 42.0, fat: 3.0 },

  // Curries & Sabzi
  { id: 'ext-sabzi', name: 'Mixed Veg Sabzi', category: 'Curries & Sabzi', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 130, protein: 3.0, carbs: 15.0, fat: 7.0 },
  { id: 'ext-palak-paneer', name: 'Palak Paneer', category: 'Curries & Sabzi', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 230, protein: 12.0, carbs: 10.1, fat: 16.1 },
  { id: 'ext-paneer-bhurji', name: 'Paneer Bhurji', category: 'Curries & Sabzi', servingLabel: '1 katori (120g)', servingGrams: 120, calories: 250, protein: 16.0, carbs: 8.0, fat: 17.0 },
  { id: 'ext-khichdi', name: 'Vegetable Khichdi', category: 'Curries & Sabzi', servingLabel: '1 katori (200g)', servingGrams: 200, calories: 200, protein: 7.0, carbs: 32.0, fat: 4.0 },
  { id: 'ext-aloo-jeera', name: 'Aloo Jeera', category: 'Curries & Sabzi', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 180, protein: 3.0, carbs: 25.0, fat: 8.0 },
  { id: 'ext-bhindi-masala', name: 'Bhindi Masala', category: 'Curries & Sabzi', servingLabel: '1 katori (130g)', servingGrams: 130, calories: 130, protein: 2.5, carbs: 12.0, fat: 8.0 },
  { id: 'ext-aloo-palak', name: 'Aloo Palak', category: 'Curries & Sabzi', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 150, protein: 4.0, carbs: 18.0, fat: 7.0 },
  { id: 'ext-cauliflower-curry', name: 'Gobi Masala', category: 'Curries & Sabzi', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 160, protein: 4.0, carbs: 18.0, fat: 8.0 },

  // Snacks
  { id: 'ext-samosa', name: 'Samosa', category: 'Snacks', servingLabel: '1 piece (60g)', servingGrams: 60, calories: 150, protein: 2.0, carbs: 16.0, fat: 8.0 },
  { id: 'ext-dhokla', name: 'Dhokla', category: 'Snacks', servingLabel: '2 pieces (80g)', servingGrams: 80, calories: 120, protein: 5.0, carbs: 18.0, fat: 3.0 },
  { id: 'ext-biscuits', name: 'Marie Biscuits', category: 'Snacks', servingLabel: '2 biscuits (20g)', servingGrams: 20, calories: 92, protein: 1.4, carbs: 15.4, fat: 2.2 },
  { id: 'ext-maggi', name: 'Masala Noodles (1 pack)', category: 'Snacks', servingLabel: '1 pack (70g dry)', servingGrams: 70, calories: 312, protein: 6.3, carbs: 42.0, fat: 11.9 },
  { id: 'ext-sandwich', name: 'Veg Sandwich', category: 'Snacks', servingLabel: '1 sandwich (150g)', servingGrams: 150, calories: 300, protein: 9.0, carbs: 42.0, fat: 10.5 },
  { id: 'ext-popcorn', name: 'Popcorn (air-popped)', category: 'Snacks', servingLabel: '1 bowl (30g)', servingGrams: 30, calories: 116, protein: 3.9, carbs: 23.3, fat: 1.4 },
  { id: 'ext-dark-chocolate', name: 'Dark Chocolate (70%)', category: 'Snacks', servingLabel: '2 squares (25g)', servingGrams: 25, calories: 150, protein: 2.0, carbs: 11.5, fat: 10.7 },
  { id: 'ext-pakora', name: 'Onion Pakora', category: 'Snacks', servingLabel: '3 pieces (90g)', servingGrams: 90, calories: 225, protein: 4.5, carbs: 18.0, fat: 15.0 },

  // Fruits
  { id: 'ext-banana', name: 'Banana', category: 'Fruits', servingLabel: '1 medium (118g)', servingGrams: 118, calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4 },
  { id: 'ext-apple', name: 'Apple', category: 'Fruits', servingLabel: '1 medium (182g)', servingGrams: 182, calories: 95, protein: 0.5, carbs: 25.1, fat: 0.3 },
  { id: 'ext-mango', name: 'Mango', category: 'Fruits', servingLabel: '1 cup (165g)', servingGrams: 165, calories: 99, protein: 1.3, carbs: 24.8, fat: 0.6 },
  { id: 'ext-orange', name: 'Orange', category: 'Fruits', servingLabel: '1 medium (154g)', servingGrams: 154, calories: 72, protein: 1.4, carbs: 18.2, fat: 0.2 },
  { id: 'ext-grapes', name: 'Grapes', category: 'Fruits', servingLabel: '1 cup (100g)', servingGrams: 100, calories: 69, protein: 0.7, carbs: 18.0, fat: 0.2 },
  { id: 'ext-papaya', name: 'Papaya', category: 'Fruits', servingLabel: '1 cup (140g)', servingGrams: 140, calories: 60, protein: 0.7, carbs: 15.1, fat: 0.4 },
  { id: 'ext-guava', name: 'Guava', category: 'Fruits', servingLabel: '1 medium (100g)', servingGrams: 100, calories: 68, protein: 2.6, carbs: 14.3, fat: 1.0 },
  { id: 'ext-watermelon', name: 'Watermelon', category: 'Fruits', servingLabel: '1 wedge (150g)', servingGrams: 150, calories: 46, protein: 0.9, carbs: 11.4, fat: 0.2 },
  { id: 'ext-dates', name: 'Dates', category: 'Fruits', servingLabel: '2-3 dates (24g)', servingGrams: 24, calories: 68, protein: 0.6, carbs: 18.0, fat: 0.1 },
  { id: 'ext-pomegranate', name: 'Pomegranate', category: 'Fruits', servingLabel: '1 cup (174g)', servingGrams: 174, calories: 144, protein: 3.0, carbs: 32.0, fat: 2.0 },

  // Beverages
  { id: 'ext-tea', name: 'Masala Chai', category: 'Beverages', servingLabel: '1 cup (150ml)', servingGrams: 150, calories: 60, protein: 2.0, carbs: 6.0, fat: 2.0 },
  { id: 'ext-coffee', name: 'Milk Coffee', category: 'Beverages', servingLabel: '1 cup (150ml)', servingGrams: 150, calories: 80, protein: 3.0, carbs: 9.0, fat: 3.0 },
  { id: 'ext-lassi', name: 'Sweet Lassi', category: 'Beverages', servingLabel: '1 glass (250ml)', servingGrams: 250, calories: 130, protein: 4.0, carbs: 22.0, fat: 2.0 },
  { id: 'ext-chaas', name: 'Chaas (Buttermilk)', category: 'Beverages', servingLabel: '1 glass (250ml)', servingGrams: 250, calories: 40, protein: 2.0, carbs: 4.0, fat: 1.0 },
  { id: 'ext-coconut-water', name: 'Coconut Water', category: 'Beverages', servingLabel: '1 glass (250ml)', servingGrams: 250, calories: 46, protein: 0.5, carbs: 11.0, fat: 0.2 },
  { id: 'ext-fresh-juice', name: 'Fresh Fruit Juice', category: 'Beverages', servingLabel: '1 glass (250ml)', servingGrams: 250, calories: 110, protein: 1.0, carbs: 27.0, fat: 0.5 },

  // Nuts & Seeds
  { id: 'ext-almonds', name: 'Almonds', category: 'Nuts & Seeds', servingLabel: '10 pieces (12g)', servingGrams: 12, calories: 69, protein: 2.5, carbs: 2.6, fat: 6.0 },
  { id: 'ext-peanuts', name: 'Roasted Peanuts', category: 'Nuts & Seeds', servingLabel: '30g', servingGrams: 30, calories: 170, protein: 7.7, carbs: 4.8, fat: 14.8 },
  { id: 'ext-walnuts', name: 'Walnuts', category: 'Nuts & Seeds', servingLabel: '4 halves (14g)', servingGrams: 14, calories: 92, protein: 2.1, carbs: 1.9, fat: 9.1 },
  { id: 'ext-cashews', name: 'Cashews', category: 'Nuts & Seeds', servingLabel: '8-10 pieces (16g)', servingGrams: 16, calories: 88, protein: 2.9, carbs: 4.8, fat: 7.0 },
  { id: 'ext-pistachios', name: 'Pistachios', category: 'Nuts & Seeds', servingLabel: '30 pieces (16g)', servingGrams: 16, calories: 85, protein: 3.0, carbs: 4.3, fat: 6.7 },
  { id: 'ext-chia-seeds', name: 'Chia Seeds', category: 'Nuts & Seeds', servingLabel: '1 tbsp (12g)', servingGrams: 12, calories: 58, protein: 2.0, carbs: 5.0, fat: 3.7 },
  { id: 'ext-flax-seeds', name: 'Flax Seeds', category: 'Nuts & Seeds', servingLabel: '1 tbsp (10g)', servingGrams: 10, calories: 55, protein: 1.9, carbs: 3.0, fat: 4.4 },

  // Sweets
  { id: 'ext-gulab-jamun', name: 'Gulab Jamun', category: 'Sweets', servingLabel: '2 pieces (70g)', servingGrams: 70, calories: 250, protein: 3.0, carbs: 35.0, fat: 10.0 },
  { id: 'ext-rasgulla', name: 'Rasgulla', category: 'Sweets', servingLabel: '2 pieces (100g)', servingGrams: 100, calories: 180, protein: 4.0, carbs: 38.0, fat: 2.0 },
  { id: 'ext-jalebi', name: 'Jalebi', category: 'Sweets', servingLabel: '1 piece (50g)', servingGrams: 50, calories: 180, protein: 1.0, carbs: 30.0, fat: 6.0 },
  { id: 'ext-kheer', name: 'Kheer (Rice Pudding)', category: 'Sweets', servingLabel: '1 katori (150g)', servingGrams: 150, calories: 225, protein: 5.0, carbs: 35.0, fat: 8.0 },
]

export function findExtendedFoodByName(name: string): Food | undefined {
  return EXTENDED_FOODS.find((f) => f.name.toLowerCase().includes(name.toLowerCase()))
}