export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export type ExerciseType = 'strength' | 'running' | 'walking' | 'cycling' | 'cardio'

export type Goal = 'lose' | 'maintain' | 'gain'

export type Units = 'metric' | 'imperial'

export type Gender = 'male' | 'female' | 'other'

export interface Food {
  id: string
  name: string
  category: string
  servingLabel: string
  servingGrams: number
  /** Nutrition per single serving */
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealEntry {
  id: string
  foodId: string
  mealType: MealType
  date: string // yyyy-mm-dd
  /** Number of servings of the food's default serving size */
  servings: number
}

export interface WaterEntry {
  id: string
  date: string
  /** millilitres */
  amount: number
  /** HH:mm */
  time: string
}

export interface ExerciseEntry {
  id: string
  date: string
  type: ExerciseType
  name: string
  /** minutes */
  duration: number
  /** kcal burned */
  calories: number
  /** optional, kilometres */
  distance?: number
}

export interface WeightEntry {
  id: string
  date: string
  /** kilograms */
  kg: number
}

export interface Notifications {
  meals: boolean
  water: boolean
  weekly: boolean
}

export interface Profile {
  name: string
  age: number
  gender: Gender
  heightCm: number
  weightKg: number
  targetWeightKg: number
  goal: Goal
  calorieTarget: number
  proteinTarget: number
  /** millilitres per day */
  waterTarget: number
  units: Units
  accent: string
  notifications: Notifications
}

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/** One dish in a diet plan's sample day */
export interface DietMeal {
  /** Breakfast / Lunch / Snack / Dinner */
  meal: string
  /** Dish name, e.g. "Grilled fish with quinoa & salad" */
  dish: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

/** A diet plan shown on the Diets page */
export interface DietPlan {
  id: string
  name: string
  description: string
  /** e.g. 'Heart Health, Weight Maintenance' */
  goal: string
  /** per-day targets */
  kcal: number
  protein: number
  carbs: number
  fat: number
  /** tailwind gradient classes for the cover art */
  gradient: string
  /** Practical rules — how to follow/prepare this plan */
  prep: string[]
  /** Sample day of dishes with per-dish macros */
  meals: DietMeal[]
}

/** Result returned by the Gemini food-scanner */
export interface ScanFoodResult {
  name: string
  /** best-guess weight of the food on the plate, grams */
  portionGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  /** 0-1 confidence */
  confidence: number
  /** short note, e.g. how it was identified */
  note?: string
}

export interface MealTypeMeta {
  key: MealType
  label: string
  timeHint: string
}

export const MEAL_TYPES: MealTypeMeta[] = [
  { key: 'breakfast', label: 'Breakfast', timeHint: 'Start your day right' },
  { key: 'lunch', label: 'Lunch', timeHint: 'Midday fuel' },
  { key: 'dinner', label: 'Dinner', timeHint: 'End of day meal' },
  { key: 'snacks', label: 'Snacks', timeHint: 'Bites in between' },
]

export interface ExerciseTypeMeta {
  key: ExerciseType
  label: string
  met: number
  tracksDistance: boolean
  hint: string
}

export const EXERCISE_TYPES: ExerciseTypeMeta[] = [
  { key: 'strength', label: 'Strength Training', met: 5, tracksDistance: false, hint: 'Weights & resistance' },
  { key: 'running', label: 'Running', met: 10, tracksDistance: true, hint: 'Jog or sprint' },
  { key: 'walking', label: 'Walking', met: 3.5, tracksDistance: true, hint: 'Casual or brisk walk' },
  { key: 'cycling', label: 'Cycling', met: 8, tracksDistance: true, hint: 'Indoor or outdoor ride' },
  { key: 'cardio', label: 'Cardio', met: 7, tracksDistance: false, hint: 'HIIT, dance, circuits' },
]
