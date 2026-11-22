/**
 * Steps abstraction layer.
 *
 * The UI always talks to `getStepsFromDevice()` / `setSteps` — it never knows
 * where the number came from. Today (browser build) steps are entered manually
 * and persisted in localStorage. When the app is wrapped with Capacitor for
 * Android/iOS, register `window.FitTrackNative.getSteps()` in main.tsx to read
 * Health Connect (Android) / HealthKit (iOS) — no UI changes needed.
 */

export interface DeviceSteps {
  /** Step count for the current day (midnight-to-now, device time) */
  steps: number
  /** Optional distance reported by the health platform, in km */
  distanceKm?: number
}

declare global {
  interface Window {
    /** Registered by the Capacitor native bridge when running as a mobile app */
    FitTrackNative?: {
      getSteps?: () => Promise<DeviceSteps | null>
      /** Starts Health Connect (Android) / HealthKit (iOS) permission flow */
      connectHealth?: () => Promise<boolean>
      /** Current connection state of the health platform */
      isHealthConnected?: () => Promise<boolean>
    }
  }
}

/** True when a native health platform is wired up (mobile build) */
export function deviceStepsAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.FitTrackNative?.getSteps === 'function'
}

/** Read today's steps from the native health platform, or null when unavailable */
export async function getStepsFromDevice(): Promise<DeviceSteps | null> {
  try {
    return (await window.FitTrackNative?.getSteps?.()) ?? null
  } catch {
    return null
  }
}

/**
 * Connect the phone's health platform (Health Connect / HealthKit). Smartwatch
 * data reaches us through that store, so this covers watch step & workout
 * tracking. Returns false in the browser build (no native bridge).
 */
export async function connectHealthDevice(): Promise<boolean> {
  try {
    return (await window.FitTrackNative?.connectHealth?.()) ?? false
  } catch {
    return false
  }
}

/* -------- Estimation helpers (used for the manual/browser path) -------- */

/** Walking stride length in metres (~41.4% of height); falls back to 70 cm */
export function strideMetres(heightCm: number): number {
  return heightCm > 0 ? (heightCm * 0.414) / 100 : 0.7
}

/** Distance covered for a step count, in km */
export function stepsToKm(steps: number, heightCm: number): number {
  return (steps * strideMetres(heightCm)) / 1000
}

/** Walking calories for a step count, based on body weight (~0.00057 kcal/step/kg) */
export function stepsToKcal(steps: number, weightKg: number): number {
  return steps * 0.00057 * (weightKg > 0 ? weightKg : 70)
}
