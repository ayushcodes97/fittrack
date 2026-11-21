import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  Check,
  ChefHat,
  Database,
  Flame,
  Info,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { Button, Card, PageHeader } from '../components/ui'
import { useApp } from '../store/AppContext'
import { uid } from '../store/AppContext'
import { MEAL_TYPES, type Food, type MealType, type ScanFoodResult } from '../types'
import { fmtNum } from '../utils/nutrition'
import { todayISO } from '../utils/date'
import { getGeminiKey, hasGeminiKey, readImageFile, scanFoodImage } from '../utils/scanFood'

export default function Scan() {
  const { addMealEntry, addCustomFood, customFoods } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pending, setPending] = useState<{ base64: string; mimeType: string } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanFoodResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [meal, setMeal] = useState<MealType>('lunch')
  const [added, setAdded] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasKey = hasGeminiKey()

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setResult(null)
    setAdded(false)
    setSaved(false)
    try {
      const img = await readImageFile(file)
      setPreview(img.dataUrl)
      setPending({ base64: img.base64, mimeType: img.mimeType })
    } catch {
      setError('Could not read the photo. Please try another one.')
    }
  }

  const analyze = async () => {
    if (!pending) return
    setScanning(true)
    setError(null)
    try {
      const res = await scanFoodImage(pending.base64, pending.mimeType, getGeminiKey())
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setPending(null)
    setResult(null)
    setAdded(false)
    setSaved(false)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const addScanned = () => {
    if (!result) return
    // scanned food becomes a one-off entry in the local database, then logs
    const id = `scan-${uid()}`
    addCustomFood({
      id,
      name: result.name,
      category: 'Scanned',
      servingLabel: `1 scanned portion (${Math.round(result.portionGrams)}g)`,
      servingGrams: Math.round(result.portionGrams) || 100,
      calories: Math.round(result.calories),
      protein: Math.round(result.protein * 10) / 10,
      carbs: Math.round(result.carbs * 10) / 10,
      fat: Math.round(result.fat * 10) / 10,
    })
    addMealEntry(todayISO(), meal, id, 1)
    setAdded(true)
  }

  const saveToDatabase = () => {
    if (!result) return
    // convert the scanned portion to per-100g nutrition for the database
    const k = result.portionGrams > 0 ? 100 / result.portionGrams : 1
    const food: Food = {
      id: `scan-${uid()}`,
      name: result.name,
      category: 'Scanned',
      servingLabel: `100g`,
      servingGrams: 100,
      calories: Math.round(result.calories * k),
      protein: Math.round(result.protein * k * 10) / 10,
      carbs: Math.round(result.carbs * k * 10) / 10,
      fat: Math.round(result.fat * k * 10) / 10,
    }
    addCustomFood(food)
    setSaved(true)
  }

  return (
    <div>
      <PageHeader
        title="Scan Food"
        subtitle="Take a photo — identify the dish and get instant macros"
      />

      {/* Scan area */}
      <Card className="mb-5">
        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="press flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-tile px-6 py-10 transition-colors hover:border-accent/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-dim text-accent">
              <Camera size={28} />
            </div>
            <div className="text-center">
              <p className="font-bold text-text">Take a photo of your food</p>
              <p className="mt-1 text-xs text-muted">Tap to open the camera — or pick an image from your gallery</p>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={preview} alt="Food to scan" className="h-64 w-full object-cover" />
              <button
                onClick={reset}
                className="press absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
            <Button className="w-full" onClick={analyze} disabled={scanning || !hasKey}>
              {scanning ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Analyzing with Gemini…
                </>
              ) : (
                <>
                  <ChefHat size={16} /> Identify food &amp; macros
                </>
              )}
            </Button>
            {!hasKey && (
              <div className="rounded-xl bg-tile px-4 py-3 text-center">
                <p className="text-xs font-semibold text-text">Photo scanning needs an API key</p>
                <p className="mt-0.5 text-xs text-muted">
                  Add a free Google Gemini key once and scanning works for every dish.
                </p>
                <Link
                  to="/profile"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent"
                >
                  Open Profile → AI Food Scanner
                </Link>
              </div>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </Card>

      {/* Error */}
      {error && (
        <Card className="mb-5 !border-danger/40 !bg-danger/5">
          <p className="text-sm font-medium text-danger">{error}</p>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-text">{result.name}</h2>
              <p className="mt-0.5 text-xs text-muted">
                ≈ {fmtNum(Math.round(result.portionGrams))}g portion ·{' '}
                {Math.round(result.confidence * 100)}% confidence
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
              <Flame size={20} />
            </div>
          </div>

          {result.note && (
            <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-tile px-3 py-2 text-xs text-muted">
              <Info size={13} className="mt-0.5 shrink-0" />
              {result.note}
            </p>
          )}

          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'kcal', value: fmtNum(Math.round(result.calories)) },
              { label: 'Protein', value: `${fmtNum(result.protein)}g` },
              { label: 'Carbs', value: `${fmtNum(result.carbs)}g` },
              { label: 'Fats', value: `${fmtNum(result.fat)}g` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-tile px-2 py-3">
                <p className="text-base font-bold text-text">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* meal picker */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Add to</p>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMeal(m.key)}
                  className={`press cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all ${
                    meal === m.key ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-tile text-muted hover:text-text'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button onClick={addScanned} disabled={added}>
              {added ? (
                <>
                  <Check size={16} /> Added to diary!
                </>
              ) : (
                <>
                  <Plus size={16} /> Log to {MEAL_TYPES.find((m) => m.key === meal)?.label}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={saveToDatabase} disabled={saved}>
              {saved ? (
                <>
                  <Check size={16} /> Saved to database!
                </>
              ) : (
                <>
                  <Database size={16} /> Save to food database
                </>
              )}
            </Button>
          </div>

          {added && (
            <p className="mt-3 text-center text-xs text-muted">
              Scanned portion logged as a one-off food item — original database untouched.
            </p>
          )}
          {saved && <p className="mt-3 text-center text-xs text-muted">Added to your food database — it now appears in Food Search too.</p>}
        </Card>
      )}

      {customFoods.length > 0 && (
        <Card className="mt-5 !py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Saved scans ({customFoods.length})
          </p>
          <ul className="mt-2 divide-y divide-border/60">
            {customFoods.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate font-medium text-text">{f.name}</span>
                <span className="shrink-0 text-xs text-muted">
                  {fmtNum(Math.round(f.calories))} kcal · {f.servingGrams}g
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
