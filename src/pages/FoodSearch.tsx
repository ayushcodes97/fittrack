import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Loader2, Plus, Save, Search, Sparkles, X } from 'lucide-react'
import { Button, Card, EmptyState, Modal, PageHeader, Stepper } from '../components/ui'
import { FoodImage } from '../components/FoodImage'
import { useApp, uid } from '../store/AppContext'
import { MEAL_TYPES, type Food, type MealType } from '../types'
import { FOOD_CATEGORIES, FOODS, scaleMacros } from '../data/foods'
import { fmtNum } from '../utils/nutrition'
import { todayISO } from '../utils/date'
import { getGeminiKey, getMacrosByName, hasGeminiKey, type AiFoodResult } from '../utils/scanFood'
import { needsAiSetup } from '../utils/errors'
import { tapSoft } from '../utils/haptics'

type Mode = 'servings' | 'grams'

export default function FoodSearch() {
  const { addMealEntry, addCustomFood, customFoods } = useApp()
  const [params] = useSearchParams()
  const presetMeal = (params.get('meal') as MealType | null) ?? null
  const date = params.get('date') ?? todayISO()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Food | null>(null)
  const [mode, setMode] = useState<Mode>('servings')
  const [servings, setServings] = useState(1)
  const [grams, setGrams] = useState(100)
  const [meal, setMeal] = useState<MealType>(presetMeal ?? 'breakfast')
  const [added, setAdded] = useState(false)

  // AI macro lookup (for foods not in the database)
  const [hasKey] = useState(hasGeminiKey)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AiFoodResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiLogged, setAiLogged] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  const allFoods = useMemo(() => [...FOODS, ...customFoods], [customFoods])
  const categories = useMemo(() => {
    const extra = customFoods.map((f) => f.category).filter((c) => !FOOD_CATEGORIES.includes(c))
    return [...FOOD_CATEGORIES, ...Array.from(new Set(extra))]
  }, [customFoods])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allFoods.filter((f) => {
      const matchesQuery = q === '' || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      const matchesCategory = category === 'All' || f.category === category
      return matchesQuery && matchesCategory
    })
  }, [allFoods, query, category])

  const openFood = (food: Food) => {
    setSelected(food)
    setMode('servings')
    setServings(1)
    setGrams(food.servingGrams)
    setMeal(presetMeal ?? 'breakfast')
    setAdded(false)
  }

  const effectiveServings = selected
    ? mode === 'servings'
      ? servings
      : grams / Math.max(1, selected.servingGrams)
    : 0
  const previewMacros = selected ? scaleMacros(selected, effectiveServings) : null

  const handleAdd = () => {
    if (!selected) return
    addMealEntry(date, meal, selected.id, Math.max(0.25, Math.round(effectiveServings * 100) / 100))
    setAdded(true)
    setTimeout(() => {
      setSelected(null)
      setAdded(false)
    }, 650)
  }

  /* ---------------- AI macro lookup (live, under the search bar) ---------------- */

  // race guard: only the latest lookup may write results
  const askIdRef = useRef(0)

  const resetAi = () => {
    askIdRef.current++
    setAiLoading(false)
    setAiResult(null)
    setAiError(null)
    setAiLogged(false)
    setAiSaved(false)
  }

  const runLookup = async (q: string, id: number) => {
    setAiLoading(true)
    setAiResult(null)
    setAiError(null)
    setAiLogged(false)
    setAiSaved(false)
    try {
      const res = await getMacrosByName(q, getGeminiKey())
      if (askIdRef.current !== id) return // a newer lookup superseded this one
      setAiResult(res)
    } catch (e) {
      if (askIdRef.current !== id) return
      setAiError(e instanceof Error ? e.message : 'AI lookup failed. Please try again.')
    } finally {
      if (askIdRef.current === id) setAiLoading(false)
    }
  }

  // live lookup: debounce ~700ms after typing stops, only when nothing matched in the DB
  useEffect(() => {
    const q = query.trim()
    if (q.length < 3 || results.length > 0 || !hasKey) {
      askIdRef.current++ // invalidate any in-flight lookup
      setAiLoading(false)
      setAiResult(null)
      setAiError(null)
      return
    }
    const id = ++askIdRef.current
    const timer = setTimeout(() => {
      void runLookup(q, id)
    }, 700)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, results, hasKey])

  // manual retry (used by the error state / "Ask again")
  const askAi = () => {
    const q = query.trim()
    if (!q || !hasKey) return
    void runLookup(q, ++askIdRef.current)
  }

  const logAiFood = () => {
    if (!aiResult) return
    const id = `ai-${uid()}`
    addCustomFood({
      id,
      name: aiResult.name,
      category: 'AI',
      servingLabel: aiResult.servingLabel,
      servingGrams: aiResult.servingGrams,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
    })
    addMealEntry(date, presetMeal ?? meal, id, 1)
    setAiLogged(true)
  }

  const saveAiFood = () => {
    if (!aiResult) return
    addCustomFood({
      id: `ai-${uid()}`,
      name: aiResult.name,
      category: 'AI',
      servingLabel: '100g',
      servingGrams: 100,
      calories: aiResult.kcal100,
      protein: aiResult.protein100,
      carbs: aiResult.carbs100,
      fat: aiResult.fat100,
    })
    setAiSaved(true)
  }

  return (
    <div>
      <PageHeader
        title="Food Search"
        subtitle={
          presetMeal
            ? `Add to ${MEAL_TYPES.find((m) => m.key === presetMeal)?.label.toLowerCase()}`
            : 'Search the food database and log your meals'
        }
        right={
          <Link to={`/diary?date=${date}`}>
            <Button size="sm" variant="outline">
              View diary
            </Button>
          </Link>
        }
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roti, dal, paneer, eggs, poha…"
          className="h-12 w-full rounded-2xl border border-border bg-tile pl-11 pr-11 text-sm text-text outline-none transition-all placeholder:text-muted focus:border-accent/60 focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-tile hover:text-text"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* AI needs a key — show setup hint instead of failing with an API error */}
      {!hasKey && query.trim().length >= 3 && results.length === 0 && (
        <Card className="mb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
              <Sparkles size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">Let AI estimate these macros</p>
              <p className="mt-0.5 text-xs text-muted">
                Add a free Google Gemini API key to look up any dish, or scan a food photo.
              </p>
              <Link
                to="/profile"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent"
              >
                Open Profile → AI Food Scanner
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Live AI suggestion — appears right under the search bar */}
      {(aiLoading || aiResult || aiError) && (
        <Card className="mb-4 !border-accent/30">
          {aiLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin text-accent" />
              AI is fetching accurate macros for &ldquo;{query.trim()}&rdquo;&hellip;
            </div>
          )}

          {aiError && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-xs text-danger">{aiError}</p>
              {needsAiSetup(aiError) ? (
                <Link to="/profile" className="press text-xs font-semibold text-accent">
                  Open AI Food Scanner
                </Link>
              ) : (
                <Button size="sm" variant="outline" onClick={askAi}>
                  <Sparkles size={14} /> Try again
                </Button>
              )}
            </div>
          )}

          {aiResult && (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-extrabold text-text">{aiResult.name}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-accent-dim px-2 py-0.5 text-[9px] font-bold text-accent">
                      <Sparkles size={9} /> AI
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {aiResult.servingLabel} · {Math.round(aiResult.confidence * 100)}% confidence
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
                  <Sparkles size={18} />
                </div>
              </div>

              {aiResult.note && (
                <p className="mt-3 rounded-xl bg-tile px-3 py-2 text-xs text-muted">{aiResult.note}</p>
              )}

              <p className="mt-3 text-lg font-extrabold text-text">
                {fmtNum(aiResult.calories)} <span className="text-xs font-medium text-muted">kcal / serving</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-protein/10 px-2.5 py-1 font-bold text-protein ring-1 ring-protein/20">
                  P <span className="font-bold text-text">{fmtNum(aiResult.protein)}g</span>
                </span>
                <span className="rounded-lg bg-carbs/10 px-2.5 py-1 font-bold text-carbs ring-1 ring-carbs/20">
                  C <span className="font-bold text-text">{fmtNum(aiResult.carbs)}g</span>
                </span>
                <span className="rounded-lg bg-fat/15 px-2.5 py-1 font-bold text-fat-ink ring-1 ring-fat/35">
                  F <span className="font-bold text-text">{fmtNum(aiResult.fat)}g</span>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMeal(m.key)}
                    className={`press cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                      (presetMeal ?? meal) === m.key
                        ? 'border-accent bg-accent-dim text-accent'
                        : 'border-border bg-tile text-muted hover:text-text'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button onClick={logAiFood} disabled={aiLogged}>
                  {aiLogged ? (
                    <>
                      <Check size={16} /> Added to diary!
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Log to{' '}
                      {MEAL_TYPES.find((m) => m.key === (presetMeal ?? meal))?.label}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={saveAiFood} disabled={aiSaved}>
                  {aiSaved ? (
                    <>
                      <Check size={16} /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save to database
                    </>
                  )}
                </Button>
              </div>

              {aiSaved && (
                <p className="mt-3 text-center text-xs text-muted">
                  Saved as a 100g reference — it now appears in Food Search too.
                </p>
              )}
              <button
                onClick={askAi}
                className="mx-auto mt-3 block cursor-pointer text-xs font-medium text-muted transition-colors hover:text-accent"
              >
                Ask again
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Category filters */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`press shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition-all duration-150 ${
              category === cat
                ? 'border-accent bg-accent-dim text-accent'
                : 'border-border bg-tile text-muted hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={22} />}
            title="No foods found"
            desc={`Nothing matches "${query}"${category !== 'All' ? ` in ${category}` : ''}. ${
              aiError
                ? 'Try a shorter or simpler dish name.'
                : aiResult
                  ? 'The AI suggestion above can fetch macros for any dish.'
                  : 'Try a different name, or browse the categories above.'
            }`}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                  resetAi()
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => {
                void tapSoft()
                openFood(food)
              }}
              className="press glass group cursor-pointer rounded-[20px] border border-border p-5 text-left transition-colors duration-150 hover:border-accent/50 hover:bg-tile active:scale-[0.98]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-text">{food.name}</h3>
                  <p className="mt-0.5 text-xs text-muted">{food.servingLabel}</p>
                </div>
                <FoodImage
                  foodId={food.id}
                  alt={food.name}
                  className="h-14 w-14 shrink-0 rounded-xl transition-transform group-hover:scale-105"
                  iconSize={18}
                />
              </div>
              <p className="mb-3 text-lg font-extrabold text-text">
                {fmtNum(food.calories)} <span className="text-xs font-medium text-muted">kcal / serving</span>
              </p>
              <div className="flex gap-3 text-xs">
                <span className="rounded-lg bg-surface px-2.5 py-1 font-medium text-muted">
                  P <span className="font-bold text-text">{fmtNum(food.protein)}g</span>
                </span>
                <span className="rounded-lg bg-surface px-2.5 py-1 font-medium text-muted">
                  C <span className="font-bold text-text">{fmtNum(food.carbs)}g</span>
                </span>
                <span className="rounded-lg bg-surface px-2.5 py-1 font-medium text-muted">
                  F <span className="font-bold text-text">{fmtNum(food.fat)}g</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add-to-meal modal */}
      <Modal open={selected !== null} onClose={() => setSelected(null)} title="Add to meal" subtitle={selected?.name}>
        {selected && previewMacros && (
          <div className="space-y-5">
            {/* Food photo banner */}
            <FoodImage
              foodId={selected.id}
              alt={selected.name}
              className="h-36 w-full rounded-2xl"
              iconSize={28}
            />

            {/* Serving size selector */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Serving size</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: 'servings', label: selected.servingLabel },
                    { key: 'grams', label: 'By weight (grams)' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMode(key)
                      if (key === 'grams') setGrams(selected.servingGrams)
                      else setServings(1)
                    }}
                    className={`press cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                      mode === key ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-tile text-muted hover:text-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity adjustment */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-tile p-4">
              {mode === 'servings' ? (
                <>
                  <p className="text-xs text-muted">Quantity (servings)</p>
                  <Stepper value={servings} onChange={setServings} min={0.25} step={0.5} />
                </>
              ) : (
                <>
                  <p className="text-xs text-muted">Quantity (grams)</p>
                  <Stepper value={grams} onChange={(v) => setGrams(Math.max(10, Math.round(v)))} min={10} step={10} suffix="g" />
                </>
              )}
              <p className="text-xs text-muted">
                ≈ {fmtNum(effectiveServings, 2)} × {selected.servingLabel}
              </p>
            </div>

            {/* Macro preview */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'kcal', value: fmtNum(Math.round(previewMacros.calories)) },
                { label: 'Protein', value: `${fmtNum(previewMacros.protein)}g` },
                { label: 'Carbs', value: `${fmtNum(previewMacros.carbs)}g` },
                { label: 'Fats', value: `${fmtNum(previewMacros.fat)}g` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-card px-2 py-3">
                  <p className="text-base font-bold text-text">{s.value}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Meal selector */}
            {!presetMeal && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Add to</p>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMeal(m.key)}
                      className={`press cursor-pointer rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                        meal === m.key ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-tile text-muted hover:text-text'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleAdd} disabled={added}>
              {added ? (
                <>
                  <Check size={16} /> Added to diary!
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to {MEAL_TYPES.find((m) => m.key === meal)?.label}
                </>
              )}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
