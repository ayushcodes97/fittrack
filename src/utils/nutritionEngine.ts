import type { Profile } from '../types'

/**
 * Mifflin-St Jeor equation for BMR calculation
 * BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + s
 * where s = +5 for male, -161 for female
 */
export function calculateBMR(profile: Profile): number {
  const { weightKg, heightCm, age, gender } = profile
  const s = gender === 'male' ? 5 : gender === 'female' ? -161 : -5
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s
}

/**
 * Activity multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(profile: Profile, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS = 'moderately_active'): number {
  const bmr = calculateBMR(profile)
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

/**
 * Calculate calorie target based on goal
 */
export function calculateCalorieTarget(profile: Profile): number {
  const tdee = calculateTDEE(profile)
  switch (profile.goal) {
    case 'lose':
      return Math.round(tdee - 500) // deficit for weight loss
    case 'gain':
      return Math.round(tdee + 500) // surplus for weight gain
    case 'maintain':
    default:
      return Math.round(tdee)
  }
}

/**
 * Calculate protein target (1.6-2.2g per kg of body weight)
 */
export function calculateProteinTarget(profile: Profile): number {
  const multiplier = profile.goal === 'gain' ? 2.2 : profile.goal === 'lose' ? 2.0 : 1.6
  return Math.round(profile.weightKg * multiplier)
}

/**
 * Calculate fat target (25-35% of calories)
 */
export function calculateFatTarget(calories: number): number {
  // 30% of calories from fat, 9 kcal per gram
  return Math.round((calories * 0.3) / 9)
}

/**
 * Calculate carbs target (remaining calories)
 */
export function calculateCarbsTarget(calories: number, protein: number, fat: number): number {
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const remaining = calories - proteinCalories - fatCalories
  return Math.max(0, Math.round(remaining / 4))
}

/**
 * Calculate all macro targets from profile
 */
export function calculateMacroTargets(profile: Profile): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
} {
  const calories = calculateCalorieTarget(profile)
  const protein = calculateProteinTarget(profile)
  const fat = calculateFatTarget(calories)
  const carbs = calculateCarbsTarget(calories, protein, fat)
  const fiber = Math.round(calories / 1000 * 14) // 14g per 1000 kcal

  return { calories, protein, carbs, fat, fiber }
}

/**
 * Auto-calculate targets from profile data
 */
export function autoCalculateTargets(profile: Profile): Partial<Profile> {
  const targets = calculateMacroTargets(profile)
  return {
    calorieTarget: targets.calories,
    proteinTarget: targets.protein,
    waterTarget: Math.round(profile.weightKg * 35), // 35ml per kg
  }
}