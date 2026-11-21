/**
 * Local notifications — meal-skip nudges, protein-goal reminder, water
 * reminders and the weekly summary.
 *
 * Mobile (Capacitor): scheduled through @capacitor/local-notifications so they
 * fire even when the app is closed (once the APK is built).
 * Browser (dev/web build): fallback to the Web Notification API with in-session
 * timers — they only fire while the tab is open.
 *
 * The scheduler is "smart": a reminder is only scheduled if its condition is
 * still unmet at sync time (e.g. lunch not logged yet, protein remaining,
 * water below goal) and its time is still in the future. It is re-run whenever
 * app data changes, so logging a meal cancels its pending nudge.
 */

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { MealEntry, Profile, WaterEntry } from '../types'
import { dayMacros, waterOn } from './nutrition'
import { todayISO } from './date'

interface ReminderSpec {
  id: number
  title: string
  body: string
  at: Date
}

const MEAL_REMINDERS: Array<{ meal: MealEntry['mealType']; time: string; emoji: string; label: string }> = [
  { meal: 'breakfast', time: '09:00', emoji: '🍳', label: 'breakfast' },
  { meal: 'lunch', time: '13:30', emoji: '🍱', label: 'lunch' },
  { meal: 'dinner', time: '20:00', emoji: '🌙', label: 'dinner' },
]

const WATER_TIMES = ['11:00', '14:00', '17:00', '20:00']
const PROTEIN_TIME = '21:30'
const WEEKLY_TIME = '19:00'

/* ids are stable per slot so re-syncs cancel cleanly */
const MEAL_ID = 10
const WATER_ID = 30
const PROTEIN_ID = 40
const WEEKLY_ID = 50

/** Ask the OS/browser for notification permission. Returns true when granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { display } = await LocalNotifications.checkPermissions()
      if (display === 'granted') return true
      const res = await LocalNotifications.requestPermissions()
      return res.display === 'granted'
    }
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/* ---------------- Web (in-session) fallback ---------------- */

const webTimers: ReturnType<typeof setTimeout>[] = []

/** Debug helper: number of in-session web timers currently scheduled */
export function pendingWebTimers(): number {
  return webTimers.length
}

function clearWebTimers(): void {
  webTimers.forEach(clearTimeout)
  webTimers.length = 0
}

function showWebNotification(title: string, body: string): void {
  try {
    new Notification(title, { body, icon: '/favicon.svg' })
  } catch {
    // some browsers require a service worker — ignore
  }
}

function showAt(spec: ReminderSpec): void {
  const delay = spec.at.getTime() - Date.now()
  if (delay <= 0) return
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.schedule({
      notifications: [
        {
          id: spec.id,
          title: spec.title,
          body: spec.body,
          schedule: { at: spec.at, allowWhileIdle: true },
        },
      ],
    }).catch(() => {
      // permission revoked / plugin unavailable — reminders stay best-effort
    })
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // web build: timers only fire while the tab stays open
    webTimers.push(setTimeout(() => showWebNotification(spec.title, spec.body), delay))
  }
}

async function cancelPending(): Promise<void> {
  clearWebTimers()
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications })
      }
    } catch {
      // nothing pending / plugin not ready
    }
  }
}

function atTime(time: string, base = new Date()): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

/* ---------------- Main scheduler ---------------- */

export interface ReminderInput {
  profile: Profile
  mealEntries: MealEntry[]
  waterEntries: WaterEntry[]
}

export async function syncReminders({ profile, mealEntries, waterEntries }: ReminderInput): Promise<void> {
  await cancelPending()

  const specs: ReminderSpec[] = []
  const now = new Date()
  const today = todayISO()
  const loggedMeals = new Set(mealEntries.filter((e) => e.date === today).map((e) => e.mealType))
  const day = dayMacros(mealEntries, today)
  const waterToday = waterOn(waterEntries, today)

  // 1. Meal-skip nudges — only for meals not logged yet whose time hasn't passed
  if (profile.notifications.meals) {
    for (const [i, m] of MEAL_REMINDERS.entries()) {
      const at = atTime(m.time)
      if (at > now && !loggedMeals.has(m.meal)) {
        const label = m.label[0].toUpperCase() + m.label.slice(1)
        specs.push({
          id: MEAL_ID + i,
          title: `${label} time ${m.emoji}`,
          body: `You haven't logged ${m.label} yet — add it in FITTRACK to keep today on track.`,
          at,
        })
      }
    }

    // 2. Protein goal reminder (evening) — only if the goal isn't met
    if (profile.proteinTarget > 0) {
      const remaining = Math.round(profile.proteinTarget - day.protein)
      if (remaining >= 10) {
        const at = atTime(PROTEIN_TIME)
        if (at > now) {
          specs.push({
            id: PROTEIN_ID,
            title: 'Protein goal pending 💪',
            body: `${remaining}g of protein left today — add a protein-rich snack or meal.`,
            at,
          })
        }
      }
    }
  }

  // 3. Water reminders — only while below the daily goal
  if (profile.notifications.water && profile.waterTarget > 0 && waterToday < profile.waterTarget) {
    const remaining = Math.max(0, profile.waterTarget - waterToday)
    for (const [i, t] of WATER_TIMES.entries()) {
      const at = atTime(t)
      if (at > now) {
        specs.push({
          id: WATER_ID + i,
          title: 'Time to hydrate 💧',
          body: `${Math.round(remaining)} ml left to reach your water goal — grab a glass.`,
          at,
        })
      }
    }
  }

  // 4. Weekly progress report — next Sunday evening
  if (profile.notifications.weekly) {
    const at = atTime(WEEKLY_TIME)
    // 0 = Sunday; if today is Sunday but it's past 19:00, go to next week
    while (at.getDay() !== 0 || at <= now) {
      at.setDate(at.getDate() + 1)
    }
    specs.push({
      id: WEEKLY_ID,
      title: 'Weekly progress ready 📊',
      body: 'Your week is wrapped up — check Progress for calories, protein and workouts.',
      at,
    })
  }

  specs.forEach(showAt)
}
