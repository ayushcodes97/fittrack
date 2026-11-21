import type { DietPlan } from '../types'

/**
 * Built-in diet plans for the Diets page.
 * Macro percentages are derived on-screen from kcal + macro grams.
 * Each plan carries practical prep rules and a sample day of dishes with
 * per-dish macros so the user knows exactly what to cook and eat.
 */
export const DIET_PLANS: DietPlan[] = [
  {
    id: 'mediterranean',
    name: 'Mediterranean Lifestyle',
    description:
      'This diet focuses on whole foods, featuring fresh vegetables, quality olive oil, lean fish, nutritious nuts, and wholesome grains. It offers a balanced and tasty way to fuel body.',
    goal: 'Heart Health, Weight Maintenance',
    kcal: 2000,
    protein: 100,
    carbs: 200,
    fat: 78,
    gradient: 'linear-gradient(135deg, #2ec4a6 0%, #1a9b7e 60%, #0e6f57 100%)',
    prep: [
      'Use extra-virgin olive oil as your main cooking fat — 2–3 tsp per meal, raw where possible.',
      'Fill half the plate with vegetables at lunch and dinner.',
      'Have fish twice a week; use dals, rajma and chana on the other days.',
      'Snack on fruit, nuts or hummus instead of packaged snacks.',
    ],
    meals: [
      { meal: 'Breakfast', dish: 'Greek yogurt with berries, walnuts & whole-grain toast', kcal: 420, protein: 22, carbs: 45, fat: 16 },
      { meal: 'Lunch', dish: 'Grilled fish with quinoa, olive oil & garden salad', kcal: 620, protein: 38, carbs: 55, fat: 24 },
      { meal: 'Snack', dish: 'Hummus with veggie sticks & a few olives', kcal: 260, protein: 9, carbs: 22, fat: 15 },
      { meal: 'Dinner', dish: 'Chickpea & vegetable stew with crumbled feta', kcal: 700, protein: 31, carbs: 78, fat: 23 },
    ],
  },
  {
    id: 'low-carb',
    name: 'Low-Carb Fat Burner',
    description:
      'A high-protein, low-carbohydrate plan designed to shift the body toward fat metabolism. Plenty of eggs, paneer, chicken and greens keep you full while carbs stay minimal.',
    goal: 'Fat Loss, Stable Energy',
    kcal: 1800,
    protein: 90,
    carbs: 90,
    fat: 90,
    gradient: 'linear-gradient(135deg, #f8758a 0%, #d94f66 60%, #a03048 100%)',
    prep: [
      'Keep carbs to 1–2 small portions a day — the rest of the plate is protein and greens.',
      'Cook with ghee/olive oil and butter; do not fear healthy fats on this plan.',
      'Choose paneer, eggs, chicken, fish and curd as your protein anchors.',
      'Avoid sugar, refined flour and fruit juice completely.',
    ],
    meals: [
      { meal: 'Breakfast', dish: '2-egg omelette with spinach, cheese & butter', kcal: 380, protein: 22, carbs: 6, fat: 29 },
      { meal: 'Lunch', dish: 'Grilled chicken with sautéed greens in olive oil', kcal: 480, protein: 40, carbs: 12, fat: 29 },
      { meal: 'Snack', dish: 'Paneer cubes with almonds & a few walnuts', kcal: 420, protein: 21, carbs: 11, fat: 32 },
      { meal: 'Dinner', dish: 'Grilled fish with broccoli, butter & lemon', kcal: 520, protein: 34, carbs: 12, fat: 35 },
    ],
  },
  {
    id: 'vegan',
    name: 'Vegan Vitality',
    description:
      'Completely plant-based eating built around dals, legumes, tofu, vegetables, fruits and whole grains. Rich in fibre and micronutrients with zero animal products.',
    goal: 'Plant-Based, High Fibre',
    kcal: 1900,
    protein: 80,
    carbs: 260,
    fat: 53,
    gradient: 'linear-gradient(135deg, #34c77b 0%, #22995a 60%, #146b3d 100%)',
    prep: [
      'Combine dal/rajma with rice or roti at every main meal to complete the protein.',
      'Use soy milk, tofu and soy chunks for protein — 1–2 servings daily.',
      'Add a B12 supplement and keep calcium high with fortified plant milk and greens.',
      'Snack on roasted chana, peanuts and fruit instead of fried foods.',
    ],
    meals: [
      { meal: 'Breakfast', dish: 'Oats with soy milk, banana & peanut butter', kcal: 480, protein: 18, carbs: 62, fat: 16 },
      { meal: 'Lunch', dish: 'Rajma with brown rice & fresh salad', kcal: 620, protein: 22, carbs: 105, fat: 10 },
      { meal: 'Snack', dish: 'Roasted chana with an apple or orange', kcal: 260, protein: 12, carbs: 38, fat: 6 },
      { meal: 'Dinner', dish: 'Tofu & vegetable stir-fry with 2 rotis', kcal: 540, protein: 28, carbs: 55, fat: 21 },
    ],
  },
  {
    id: 'high-protein',
    name: 'High-Protein Muscle Gain',
    description:
      'Built for the gym: a generous protein quota spread across four meals, moderate carbs timed around workouts, and healthy fats to keep hormones balanced.',
    goal: 'Muscle Gain, Strength',
    kcal: 2600,
    protein: 150,
    carbs: 300,
    fat: 72,
    gradient: 'linear-gradient(135deg, #5b8def 0%, #3f6bc4 60%, #2a4a8f 100%)',
    prep: [
      'Eat protein in every meal — aim for 30–40 g per sitting.',
      'Put most carbs around your workout (pre and post training).',
      'Lift 4–5 days a week and keep sleep at 7–8 hours for recovery.',
      'Cook chicken, eggs, paneer and dal in bulk on Sunday to stay consistent.',
    ],
    meals: [
      { meal: 'Breakfast', dish: '3-egg bhurji, 2 whole-wheat toast & a glass of milk', kcal: 620, protein: 38, carbs: 48, fat: 26 },
      { meal: 'Lunch', dish: '200 g chicken breast, 1.5 katori rice, dal & salad', kcal: 780, protein: 55, carbs: 85, fat: 20 },
      { meal: 'Snack', dish: 'Whey shake with milk & a banana (post-workout)', kcal: 330, protein: 30, carbs: 35, fat: 6 },
      { meal: 'Dinner', dish: '150 g paneer bhurji, 3 rotis & sabzi', kcal: 870, protein: 40, carbs: 120, fat: 28 },
    ],
  },
  {
    id: 'indian-balanced',
    name: 'Indian Balanced Thali',
    description:
      'A traditional balanced plan: roti, dal, seasonal sabzi, curd and rice in measured portions. Familiar home-style meals with steady macros every day.',
    goal: 'Everyday Health, Family Friendly',
    kcal: 2200,
    protein: 110,
    carbs: 275,
    fat: 61,
    gradient: 'linear-gradient(135deg, #f0a04b 0%, #d97f2a 60%, #a85a17 100%)',
    prep: [
      'Use the thali rule: ½ vegetables, ¼ protein (dal/paneer/curd), ¼ carbs (roti/rice).',
      'Add 1 katori curd with lunch or dinner for protein and gut health.',
      'Cook sabzi with 1 tsp oil — measure it, do not free-pour.',
      'Keep fried snacks to once a week and prefer roasted or steamed versions.',
    ],
    meals: [
      { meal: 'Breakfast', dish: '2 aloo parathas with 1 katori curd', kcal: 560, protein: 16, carbs: 70, fat: 22 },
      { meal: 'Lunch', dish: '3 rotis, dal tadka, paneer sabzi & salad', kcal: 700, protein: 30, carbs: 90, fat: 22 },
      { meal: 'Snack', dish: '100 g paneer tikka with tea', kcal: 320, protein: 20, carbs: 8, fat: 22 },
      { meal: 'Dinner', dish: '1.5 katori rice, rajma & curd', kcal: 620, protein: 24, carbs: 100, fat: 12 },
    ],
  },
  {
    id: 'keto',
    name: 'Ketogenic Reset',
    description:
      'Very low carb, high fat plan that pushes the body into ketosis. Ghee, nuts, cheese, eggs and low-carb vegetables form the core of every meal.',
    goal: 'Rapid Fat Loss, Mental Clarity',
    kcal: 1700,
    protein: 100,
    carbs: 30,
    fat: 133,
    gradient: 'linear-gradient(135deg, #8b7cf6 0%, #6a58d6 60%, #4a3ba8 100%)',
    prep: [
      'Keep carbs under 30 g a day — no rice, roti, sugar or starchy vegetables.',
      'Cook in ghee, butter or coconut oil; add avocado and nuts for healthy fats.',
      'Drink 3–4 L water and add a pinch of salt to meals (electrolytes).',
      'Expect 3–5 days of low energy while the body adapts to ketosis.',
    ],
    meals: [
      { meal: 'Breakfast', dish: '3-egg cheese omelette in ghee with avocado', kcal: 560, protein: 28, carbs: 8, fat: 46 },
      { meal: 'Lunch', dish: 'Chicken thighs with spinach cooked in olive oil', kcal: 480, protein: 36, carbs: 6, fat: 35 },
      { meal: 'Snack', dish: 'Mixed nuts with cheese cubes', kcal: 180, protein: 8, carbs: 4, fat: 15 },
      { meal: 'Dinner', dish: 'Grilled fish with buttered greens', kcal: 480, protein: 30, carbs: 8, fat: 34 },
    ],
  },
]
