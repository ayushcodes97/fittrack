import type { ScanFoodResult } from '../types'
import { friendlyError } from './errors'

/**
 * Gemini-powered food scanner.
 * Sends a food photo to Google's Gemini API and gets back the identified
 * dish with portion estimate and macros. Requires a free API key from
 * https://aistudio.google.com/app/apikey (stored locally in the browser).
 */

export const GEMINI_KEY_STORAGE = 'fittrack-gemini-key'

export function getGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

export function setGeminiKey(key: string): void {
  try {
    if (key) localStorage.setItem(GEMINI_KEY_STORAGE, key)
    else localStorage.removeItem(GEMINI_KEY_STORAGE)
  } catch {
    // storage unavailable — key only lives for this session
  }
}

/** True when a key has been saved, so the UI can show setup hints instead of errors */
export function hasGeminiKey(): boolean {
  return getGeminiKey().length > 0
}

/** Shown wherever AI features need setup — one consistent pointer to the field */
export const NO_KEY_MESSAGE =
  'AI is not set up yet — add your free Google Gemini API key in Profile → AI Food Scanner.'

const PROMPT = `You are a nutrition expert for an Indian food tracking app.
Look at the food photo and:
1. Identify the food/dish (recognise common Indian dishes like roti, dal, poha, dosa, biryani, etc.)
2. Estimate the portion weight in grams visible in the photo
3. Calculate accurate macros for THAT portion using standard nutrition data (IFCT / USDA)
4. Give a confidence score from 0 to 1
If multiple foods are visible, identify the single most prominent one and mention the rest in the note.
Respond strictly as JSON matching the provided schema.`

/** AI macro lookup for a typed food name (no photo) */
const NAME_PROMPT = `You are a nutrition expert for an Indian food tracking app.
The user typed a food/dish name (it may be written in Hinglish or Hindi — e.g. "chole", "samosa", "dal makhani").
1. Identify the dish (common Indian interpretation)
2. Provide ACCURATE nutrition per 100g using standard data (IFCT / NIN / USDA)
3. Define a typical serving (label + grams, e.g. "1 katori (130g)")
4. Give a confidence score from 0 to 1
If the text is not a real food or drink (random letters, nonsense words), do NOT invent a dish:
return name "Unknown food", all macros 0 and confidence 0.
Respond strictly as JSON matching the provided schema.`

interface NameSchemaResult {
  name: string
  servingLabel: string
  servingGrams: number
  kcal100: number
  protein100: number
  carbs100: number
  fat100: number
  confidence: number
  note?: string
}

/** Result of an AI macro lookup for a typed food name */
export interface AiFoodResult {
  name: string
  servingLabel: string
  servingGrams: number
  /** per-100g values */
  kcal100: number
  protein100: number
  carbs100: number
  fat100: number
  /** per-serving values derived from per-100g */
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
  note?: string
}

const NAME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Dish name in English' },
    servingLabel: { type: 'STRING', description: 'Typical serving description, e.g. "1 katori (130g)"' },
    servingGrams: { type: 'NUMBER', description: 'Typical serving weight in grams' },
    kcal100: { type: 'NUMBER', description: 'kcal per 100g' },
    protein100: { type: 'NUMBER', description: 'g protein per 100g' },
    carbs100: { type: 'NUMBER', description: 'g carbs per 100g' },
    fat100: { type: 'NUMBER', description: 'g fat per 100g' },
    confidence: { type: 'NUMBER', description: '0 to 1 identification confidence' },
    note: { type: 'STRING', description: 'One short clarifying line' },
  },
  required: ['name', 'servingLabel', 'servingGrams', 'kcal100', 'protein100', 'carbs100', 'fat100', 'confidence'],
} as const

/**
 * Models tried in order — fast, reliable lite models first so name lookups feel
 * instant; bigger models stay later only as quality fallbacks. (The big
 * "3.x-flash" models are frequently 503-overloaded and add seconds of latency.)
 */
const MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
]

async function callGemini(
  model: string,
  apiKey: string,
  parts: Array<Record<string, unknown>>,
  schema: Record<string, unknown>,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
  // each attempt gets a hard timeout so a hung model falls through to the next
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45_000)
  try {
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      })
    } catch (e) {
      // a failed connection / timeout is not model-specific — stop retrying
      throw fatal(friendlyError(e, 'Could not reach the AI service. Check your internet connection.'))
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try {
        const err = (await res.json()) as { error?: { message?: string } }
        if (err?.error?.message) detail = err.error.message
      } catch {
        // keep status-only message
      }
      // these are actionable and identical for every model — don't burn the list
      if (res.status === 401 || res.status === 403 || /api key|credential|permission denied/i.test(detail)) {
        throw fatal('Gemini rejected the API key. Update it in Profile → AI Food Scanner.')
      }
      if (res.status === 429) {
        throw fatal('The AI is getting too many requests right now. Wait a minute and try again.')
      }
      if (res.status === 400) {
        throw fatal('The AI could not understand that request. Try a simpler dish name or a clearer photo.')
      }
      // 404 (model gone) / 500 / 503 (overloaded) → let the caller try the next model
      throw Object.assign(new Error(detail), { status: res.status })
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!text) throw new Error('The AI returned an empty response — please try again')
    return text
  } finally {
    clearTimeout(timer)
  }
}

/** Marks an error that must not be retried against the next model */
type AiError = Error & { retryable?: boolean; status?: number }

function fatal(message: string): AiError {
  return Object.assign(new Error(message), { retryable: false })
}

async function runWithFallback(
  apiKey: string,
  parts: Array<Record<string, unknown>>,
  schema: Record<string, unknown>,
): Promise<string> {
  if (!apiKey.trim()) throw fatal(NO_KEY_MESSAGE)
  let lastError: Error | null = null
  for (const model of MODELS) {
    try {
      return await callGemini(model, apiKey, parts, schema)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      // network / key / quota / bad-request errors are the same for every model
      if ((lastError as AiError).retryable === false) throw lastError
    }
  }
  throw lastError ?? new Error('The AI is busy right now — please try again shortly.')
}

export async function scanFoodImage(
  base64: string,
  mimeType: string,
  apiKey: string,
): Promise<ScanFoodResult> {
  const text = await runWithFallback(
    apiKey,
    [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: base64 } }],
    SCHEMA,
  )
  return parseScanResult(text)
}

/** Look up accurate macros for a typed food name (no photo needed) */
export async function getMacrosByName(name: string, apiKey: string): Promise<AiFoodResult> {
  const text = await runWithFallback(
    apiKey,
    [{ text: `${NAME_PROMPT}\n\nFood: "${name.trim()}"` }],
    NAME_SCHEMA,
  )

  let parsed: NameSchemaResult
  try {
    parsed = JSON.parse(text) as NameSchemaResult
  } catch {
    throw new Error('Could not parse the response — please try again')
  }

  const num = (v: unknown, fallback = 0) => (typeof v === 'number' && isFinite(v) ? Math.round(v * 10) / 10 : fallback)
  const grams = num(parsed.servingGrams, 100) || 100
  const k = grams / 100
  const r1 = (n: number) => Math.round(n * 10) / 10
  const confidence = num(parsed.confidence, 0.5)
  const kcal100 = Math.round(num(parsed.kcal100))
  // The model flags non-food input with zero confidence / zero calories —
  // surface that as an error instead of a blank 0 kcal suggestion card.
  if (confidence <= 0.05 || kcal100 <= 0) {
    throw new Error(`Couldn't recognise "${name.trim()}". Try a simpler dish name, like "paneer" or "chicken curry".`)
  }
  return {
    name: String(parsed.name || name),
    servingLabel: String(parsed.servingLabel || `100g`),
    servingGrams: Math.round(grams),
    kcal100,
    protein100: num(parsed.protein100),
    carbs100: num(parsed.carbs100),
    fat100: num(parsed.fat100),
    calories: Math.round(kcal100 * k),
    protein: r1(num(parsed.protein100) * k),
    carbs: r1(num(parsed.carbs100) * k),
    fat: r1(num(parsed.fat100) * k),
    confidence,
    note: parsed.note ? String(parsed.note) : undefined,
  }
}

function parseScanResult(text: string): ScanFoodResult {
  let parsed: ScanFoodResult
  try {
    parsed = JSON.parse(text) as ScanFoodResult
  } catch {
    throw new Error('Could not parse the response — please try another photo')
  }

  // sanity-check the numbers
  const num = (v: unknown, fallback = 0) => (typeof v === 'number' && isFinite(v) ? Math.round(v * 10) / 10 : fallback)
  return {
    name: String(parsed.name || 'Unknown food'),
    portionGrams: Math.max(10, num(parsed.portionGrams, 100)),
    calories: num(parsed.calories),
    protein: num(parsed.protein),
    carbs: num(parsed.carbs),
    fat: num(parsed.fat),
    confidence: num(parsed.confidence, 0.5),
    note: parsed.note ? String(parsed.note) : undefined,
  }
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Dish name in English' },
    portionGrams: { type: 'NUMBER', description: 'Estimated visible portion weight in grams' },
    calories: { type: 'NUMBER', description: 'kcal for the estimated portion' },
    protein: { type: 'NUMBER', description: 'grams protein for the portion' },
    carbs: { type: 'NUMBER', description: 'grams carbs for the portion' },
    fat: { type: 'NUMBER', description: 'grams fat for the portion' },
    confidence: { type: 'NUMBER', description: '0 to 1 identification confidence' },
    note: { type: 'STRING', description: 'One short line about the identification' },
  },
  required: ['name', 'portionGrams', 'calories', 'protein', 'carbs', 'fat', 'confidence'],
} as const

/** Max photo size sent to the AI (inline data limit, keeps uploads snappy) */
export const MAX_IMAGE_MB = 6

/** Read a File as base64 (without the data: prefix) + its mime type */
export function readImageFile(file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image. Please choose a photo (JPG or PNG).'))
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      reject(new Error(`That photo is too large (max ${MAX_IMAGE_MB} MB). Take a new photo or pick a smaller one.`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that photo. Please try another one.'))
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      const comma = dataUrl.indexOf(',')
      if (!dataUrl.startsWith('data:image/') || comma < 0) {
        reject(new Error('Could not read that photo. Please try another one.'))
        return
      }
      const head = dataUrl.slice(0, comma)
      const body = dataUrl.slice(comma + 1)
      const mimeType = head.slice(head.indexOf(':') + 1, head.indexOf(';')) || 'image/jpeg'
      resolve({ base64: body, mimeType, dataUrl })
    }
    reader.readAsDataURL(file)
  })
}
