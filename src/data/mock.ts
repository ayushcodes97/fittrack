import type { Profile } from '../types'

/**
 * Blank starting profile — no demo data anywhere in the app.
 * The user fills in their own details and targets on the Profile page,
 * and logs every meal, water glass, workout and weight entry themselves.
 */
export const initialProfile: Profile = {
  name: '',
  age: 0,
  gender: 'male',
  heightCm: 0,
  weightKg: 0,
  targetWeightKg: 0,
  goal: 'lose',
  calorieTarget: 0,
  proteinTarget: 0,
  waterTarget: 0,
  units: 'metric',
  accent: '#17795c',
  notifications: { meals: true, water: true, weekly: false },
}
