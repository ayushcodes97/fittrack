import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor configuration — wraps this Vite/React app as a native
 * Android/iOS app. Web assets come from `dist` (vite build output).
 *
 * Android:  npm run build && npx cap sync android, then open android/
 *           in Android Studio → Build APK.
 * iOS:      npx cap add ios (needs a Mac with Xcode).
 */
const config: CapacitorConfig = {
  appId: 'com.fittrack.app',
  appName: 'FITTRACK',
  webDir: 'dist',
  backgroundColor: '#FAFBFC',
}

export default config
