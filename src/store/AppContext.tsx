import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  ExerciseEntry,
  ExerciseType,
  Food,
  MealEntry,
  MealType,
  Profile,
  WaterEntry,
  WeightEntry,
} from '../types'
import {
  initialProfile,
} from '../data/mock'
import { EXERCISE_TYPES } from '../types'
import { registerCustomFoods } from '../data/foods'
import { estimateBurn } from '../utils/nutrition'
import { syncReminders } from '../utils/notifications'
import { nowTime, todayISO } from '../utils/date'
import { tapSuccess } from '../utils/haptics'

export function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/* ------------------------------------------------------------------ */
/*  Local database — everything persists to localStorage               */
/* ------------------------------------------------------------------ */

// v2 — blank database (demo seed data removed); bumping the key resets old installs
const STORAGE_KEY = 'fittrack-database-v2'

interface PersistedState {
  profile: Profile
  mealEntries: MealEntry[]
  waterEntries: WaterEntry[]
  exercises: ExerciseEntry[]
  weights: WeightEntry[]
  customFoods: Food[]
  myDietIds: string[]
  /** Daily step counts — date (ISO) → steps. Filled manually on web, from
   *  Health Connect / HealthKit once wrapped as a mobile app. */
  steps: Record<string, number>
}

function defaultState(): PersistedState {
  return {
    profile: initialProfile,
    mealEntries: [],
    waterEntries: [],
    exercises: [],
    weights: [],
    customFoods: [],
    myDietIds: [],
    steps: {},
  }
}

function normalizeSteps(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, number> = {}
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(value)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(n) && n >= 0) out[date] = Math.round(n)
  }
  return out
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const base = defaultState()
    const profile = { ...base.profile, ...(parsed.profile ?? {}) }
    // nested settings may be missing or partial in older saves
    profile.notifications = { ...base.profile.notifications, ...(parsed.profile?.notifications ?? {}) }
    // any non-hex / unknown accent falls back to the default green
    if (!/^#[0-9a-f]{6}$/i.test(profile.accent)) profile.accent = base.profile.accent
    // numeric fields must never stay NaN/strings from a damaged save
    const numericProfileKeys = [
      'age',
      'heightCm',
      'weightKg',
      'targetWeightKg',
      'calorieTarget',
      'proteinTarget',
      'waterTarget',
    ] as const
    for (const key of numericProfileKeys) {
      const value = profile[key]
      if (typeof value !== 'number' || !Number.isFinite(value)) profile[key] = base.profile[key]
    }
    // Migrate older accent palettes to the clean green-neutral palette
    const accentMap: Record<string, string> = {
      '#ff5148': '#17795c',
      '#ec6bb4': '#8a63c9',
      '#b266f5': '#8a63c9',
      '#4ec3e0': '#4a90c2',
      '#1263ff': '#4a90c2',
      '#2ec4a6': '#2a9d8f',
      '#34c77b': '#2fa37a',
      '#f0a04b': '#d99a3e',
      '#f8758a': '#d97757',
      '#8b7cf6': '#8a63c9',
      '#5b8def': '#4a90c2',
    }
    if (profile.accent && accentMap[profile.accent]) profile.accent = accentMap[profile.accent]
    return {
      profile,
      mealEntries: Array.isArray(parsed.mealEntries) ? parsed.mealEntries : base.mealEntries,
      waterEntries: Array.isArray(parsed.waterEntries) ? parsed.waterEntries : base.waterEntries,
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : base.exercises,
      weights: Array.isArray(parsed.weights) ? parsed.weights : base.weights,
      customFoods: Array.isArray(parsed.customFoods) ? parsed.customFoods : [],
      myDietIds: Array.isArray(parsed.myDietIds) ? parsed.myDietIds : [],
      steps: normalizeSteps(parsed.steps),
    }
  } catch {
    return defaultState()
  }
}

export function resetDatabase(): void {
  localStorage.removeItem(STORAGE_KEY)
}

interface AppContextValue {
  profile: Profile
  mealEntries: MealEntry[]
  waterEntries: WaterEntry[]
  exercises: ExerciseEntry[]
  weights: WeightEntry[]
  customFoods: Food[]
  myDietIds: string[]
  steps: Record<string, number>
  addMealEntry: (date: string, mealType: MealType, foodId: string, servings: number) => void
  updateMealEntry: (id: string, servings: number) => void
  deleteMealEntry: (id: string) => void
  addWater: (date: string, amount: number) => void
  deleteWater: (id: string) => void
  addExercise: (input: { date: string; type: ExerciseType; name: string; duration: number; distance?: number }) => void
  deleteExercise: (id: string) => void
  addWeight: (date: string, kg: number) => void
  deleteWeight: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  addCustomFood: (food: Food) => void
  deleteCustomFood: (id: string) => void
  toggleDiet: (id: string) => void
  setSteps: (date: string, count: number | ((prev: number) => number)) => void
  resetAllData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState)
  const {
    profile,
    mealEntries,
    waterEntries,
    exercises,
    weights,
    customFoods,
    myDietIds,
    steps,
  } = state

  // Persist on every change — this is the app's local database
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full/blocked — keep the app running in-memory
    }
  }, [state])

  // Make custom foods visible to data/foods lookups (foodById, FoodSearch)
  useEffect(() => {
    registerCustomFoods(customFoods)
  }, [customFoods])

  // Re-schedule local notifications whenever relevant data changes (debounced):
  // skipped meals / pending protein / water deficit decide which nudges are active
  useEffect(() => {
    const t = setTimeout(() => {
      void syncReminders({ profile, mealEntries, waterEntries }).catch(() => null)
    }, 3000)
    return () => clearTimeout(t)
  }, [profile, mealEntries, waterEntries])

  const addMealEntry = useCallback((date: string, mealType: MealType, foodId: string, servings: number) => {
    setState((prev) => ({
      ...prev,
      mealEntries: [...prev.mealEntries, { id: uid(), date, mealType, foodId, servings }],
    }))
    void tapSuccess()
  }, [])

  const updateMealEntry = useCallback((id: string, servings: number) => {
    setState((prev) => ({
      ...prev,
      mealEntries: prev.mealEntries.map((e) => (e.id === id ? { ...e, servings: Math.max(0.25, servings) } : e)),
    }))
  }, [])

  const deleteMealEntry = useCallback((id: string) => {
    setState((prev) => ({ ...prev, mealEntries: prev.mealEntries.filter((e) => e.id !== id) }))
  }, [])

  const addWater = useCallback((date: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      waterEntries: [
        ...prev.waterEntries,
        { id: uid(), date, amount: Math.max(50, Math.round(amount)), time: nowTime() },
      ],
    }))
    void tapSuccess()
  }, [])

  const deleteWater = useCallback((id: string) => {
    setState((prev) => ({ ...prev, waterEntries: prev.waterEntries.filter((e) => e.id !== id) }))
  }, [])

  const addExercise = useCallback(
    (input: { date: string; type: ExerciseType; name: string; duration: number; distance?: number }) => {
      setState((prev) => {
        const meta = EXERCISE_TYPES.find((t) => t.key === input.type)
        const calories = estimateBurn(meta?.met ?? 5, prev.profile.weightKg, input.duration)
        return { ...prev, exercises: [...prev.exercises, { id: uid(), ...input, calories }] }
      })
      void tapSuccess()
    },
    [],
  )

  const deleteExercise = useCallback((id: string) => {
    setState((prev) => ({ ...prev, exercises: prev.exercises.filter((e) => e.id !== id) }))
  }, [])

  const addWeight = useCallback((date: string, kg: number) => {
    setState((prev) => {
      const existing = prev.weights.find((w) => w.date === date)
      const weights = existing
        ? prev.weights.map((w) => (w.date === date ? { ...w, kg } : w))
        : [...prev.weights, { id: uid(), date, kg }]
      return { ...prev, weights, profile: { ...prev.profile, weightKg: kg } }
    })
    void tapSuccess()
  }, [])

  const deleteWeight = useCallback((id: string) => {
    setState((prev) => ({ ...prev, weights: prev.weights.filter((w) => w.id !== id) }))
  }, [])

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...p } }))
  }, [])

  const addCustomFood = useCallback((food: Food) => {
    setState((prev) => ({
      ...prev,
      customFoods: prev.customFoods.some((f) => f.id === food.id)
        ? prev.customFoods.map((f) => (f.id === food.id ? food : f))
        : [...prev.customFoods, food],
    }))
  }, [])

  const deleteCustomFood = useCallback((id: string) => {
    setState((prev) => ({ ...prev, customFoods: prev.customFoods.filter((f) => f.id !== id) }))
  }, [])

  const toggleDiet = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      myDietIds: prev.myDietIds.includes(id)
        ? prev.myDietIds.filter((d) => d !== id)
        : [...prev.myDietIds, id],
    }))
  }, [])

  const setSteps = useCallback((date: string, count: number | ((prev: number) => number)) => {
    setState((prev) => {
      const current = prev.steps[date] ?? 0
      const next = typeof count === 'function' ? count(current) : count
      const steps = { ...prev.steps }
      if (next > 0) steps[date] = Math.round(next)
      else delete steps[date]
      return { ...prev, steps }
    })
  }, [])

  const resetAllData = useCallback(() => {
    resetDatabase()
    setState(defaultState())
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      mealEntries,
      waterEntries,
      exercises,
      weights,
      customFoods,
      myDietIds,
      steps,
      addMealEntry,
      updateMealEntry,
      deleteMealEntry,
      addWater,
      deleteWater,
      addExercise,
      deleteExercise,
      addWeight,
      deleteWeight,
      updateProfile,
      addCustomFood,
      deleteCustomFood,
      toggleDiet,
      setSteps,
      resetAllData,
    }),
    [
      profile,
      mealEntries,
      waterEntries,
      exercises,
      weights,
      customFoods,
      myDietIds,
      steps,
      addMealEntry,
      updateMealEntry,
      deleteMealEntry,
      addWater,
      deleteWater,
      addExercise,
      deleteExercise,
      addWeight,
      deleteWeight,
      updateProfile,
      addCustomFood,
      deleteCustomFood,
      toggleDiet,
      resetAllData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

/** Convenience hook: today's date string (stable per render) */
export function useToday(): string {
  return useMemo(() => todayISO(), [])
}
