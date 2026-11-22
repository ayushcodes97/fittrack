import type { ExerciseEntry, MacroTotals, MealEntry, Profile, WaterEntry } from '../types'
import { foodById, scaleMacros } from '../data/foods'
import { lastNDays } from './date'

/** Nutrition totals for one meal entry (scaled by servings) */
export function entryMacros(entry: MealEntry): MacroTotals {
  const food = foodById(entry.foodId)
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const m = scaleMacros(food, entry.servings)
  return { calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat }
}

export function dayMacros(entries: MealEntry[], date: string): MacroTotals {
  return entries
    .filter((e) => e.date === date)
    .reduce<MacroTotals>(
      (acc, e) => {
        const m = entryMacros(e)
        return {
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
}

export function mealMacros(entries: MealEntry[], date: string, mealType: MealEntry['mealType']): MacroTotals {
  return dayMacros(entries.filter((e) => e.mealType === mealType), date)
}

export function burnedOn(exercises: ExerciseEntry[], date: string): number {
  return exercises
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + (Number.isFinite(e.calories) ? e.calories : 0), 0)
}

export function waterOn(entries: WaterEntry[], date: string): number {
  return entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0)
}

/** Estimated calorie burn: MET formula (kcal/min = MET * 3.5 * kg / 200) */
export function estimateBurn(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * 3.5 * weightKg * (minutes / 200))
}

/** Macro targets derived from calorie target & protein goal */
export function macroTargets(profile: Profile) {
  return {
    calories: profile.calorieTarget,
    protein: profile.proteinTarget,
    carbs: Math.round((profile.calorieTarget * 0.45) / 4),
    fat: Math.round((profile.calorieTarget * 0.25) / 9),
  }
}

export interface DailyPoint {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
  burned: number
}

export function dailyPoints(
  mealEntries: MealEntry[],
  waterEntries: WaterEntry[],
  exercises: ExerciseEntry[],
  days: number,
): DailyPoint[] {
  return lastNDays(days).map((date) => ({
    date,
    ...dayMacros(mealEntries, date),
    water: waterOn(waterEntries, date),
    burned: burnedOn(exercises, date),
  }))
}

/* ---------------------------- formatting ---------------------------- */

export function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits })
}

export function kgToLb(kg: number): number {
  return kg * 2.20462
}

export function mlToOz(ml: number): number {
  return ml / 29.5735
}

export function fmtWeight(profile: Profile, kg: number, digits = 1): string {
  return profile.units === 'imperial' ? `${fmtNum(kgToLb(kg), digits)} lb` : `${fmtNum(kg, digits)} kg`
}

export function fmtWater(profile: Profile, ml: number): string {
  return profile.units === 'imperial' ? `${fmtNum(mlToOz(ml), 0)} oz` : `${fmtNum(ml, 0)} ml`
}
