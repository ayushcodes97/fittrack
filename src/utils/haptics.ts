import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

/**
 * Light haptic feedback for taps. Native only (Android/iOS) — silently does
 * nothing in the browser so desktop usage is unaffected.
 *
 *   tap()      → light impact  (buttons, cards, toggles)
 *   tapSoft()  → very light    (tabs, chips, list rows)
 *   tapSuccess() → success     (saved / logged confirmation)
 */
const native = () => {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export async function tap(): Promise<void> {
  if (!native()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    /* device without a vibrator — ignore */
  }
}

export async function tapSoft(): Promise<void> {
  if (!native()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    /* ignore */
  }
}

export async function tapSuccess(): Promise<void> {
  if (!native()) return
  try {
    await Haptics.notification({ type: NotificationType.Success })
  } catch {
    /* ignore */
  }
}
