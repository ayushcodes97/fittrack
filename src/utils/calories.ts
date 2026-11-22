import type { Profile } from '../types'

/**
 * Calorie & protein coach — Mifflin-St Jeor BMR + activity factor (TDEE).
 * Cutting ≈ maintenance −18%, bulking ≈ maintenance +12%.
 * Protein is set per kg of body weight: 2.2 g/kg cutting, 2.0 maintenance,
 * 1.8 bulking.
 *
 * All values are estimates — the user can apply any of them as their daily
 * targets on the Profile page.
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'

export const ACTIVITY_LEVELS: Array<{
  key: ActivityLevel
  label: string
  desc: string
  factor: number
}> = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise', factor: 1.2 },
  { key: 'light', label: 'Light', desc: 'Light exercise 1–3 days/week', factor: 1.375 },
  { key: 'moderate', label: 'Moderate', desc: '3–5 workouts/week', factor: 1.55 },
  { key: 'active', label: 'Active', desc: '6–7 workouts/week', factor: 1.725 },
  { key: 'athlete', label: 'Athlete', desc: 'Hard training twice a day', factor: 1.9 },
]

/** Base metabolic rate (kcal/day). Null until age, height and weight are set. */
export function bmr(profile: Profile): number | null {
  if (profile.weightKg <= 0 || profile.heightCm <= 0 || profile.age <= 0) return null
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  const offset = profile.gender === 'male' ? 5 : profile.gender === 'female' ? -161 : -78
  return Math.round(base + offset)
}

/** Maintenance calories (TDEE) for an activity level. Null until profile is complete. */
export function tdee(profile: Profile, level: ActivityLevel): number | null {
  const b = bmr(profile)
  if (b === null) return null
  const factor = ACTIVITY_LEVELS.find((l) => l.key === level)?.factor ?? 1.375
  return Math.round(b * factor)
}

export interface CaloriePlan {
  bmr: number
  maintenance: number
  cutting: number
  bulking: number
  protein: { cutting: number; maintenance: number; bulking: number }
}

/** Cutting / maintenance / bulking calories + protein per goal. */
export function caloriePlan(profile: Profile, level: ActivityLevel): CaloriePlan | null {
  const b = bmr(profile)
  const maintenance = tdee(profile, level)
  if (b === null || maintenance === null) return null
  const w = profile.weightKg
  return {
    bmr: b,
    maintenance,
    cutting: Math.round(maintenance * 0.82),
    bulking: Math.round(maintenance * 1.12),
    protein: {
      cutting: Math.round(w * 2.2),
      maintenance: Math.round(w * 2.0),
      bulking: Math.round(w * 1.8),
    },
  }
}
