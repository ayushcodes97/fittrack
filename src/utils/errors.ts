/**
 * One place to turn any failure into a short, actionable message.
 * The rule across FITTRACK: never show a raw browser/API string — always say
 * what happened and what the user can do next.
 */

export function friendlyError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (e instanceof Error) {
    const msg = e.message.trim()
    // request was aborted because it took too long
    if (e.name === 'AbortError') return 'That took too long to respond. Please try again.'
    // fetch network failures differ per browser/engine
    if (/failed to fetch|networkerror|load failed|network request failed|internet|offline/i.test(msg)) {
      return 'No internet connection. Check your network and try again.'
    }
    if (/quota|rate limit|resource_exhausted/i.test(msg)) {
      return 'Too many requests right now. Wait a minute and try again.'
    }
    if (msg) return msg
  }
  if (typeof e === 'string' && e.trim()) return e
  return fallback
}

/** True when an error message points at the Gemini key setup screen */
export function needsAiSetup(message: string | null | undefined): boolean {
  return !!message && message.includes('Profile → AI Food Scanner')
}
