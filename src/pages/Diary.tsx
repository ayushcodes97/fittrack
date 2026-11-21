import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Salad,
  Trash2,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { Button, Card, EmptyState, Modal, PageHeader, ProgressBar, ProgressRing, Stepper } from '../components/ui'
import { FoodImage } from '../components/FoodImage'
import { useApp } from '../store/AppContext'
import { MEAL_TYPES, type MealEntry, type MealType } from '../types'
import { foodById } from '../data/foods'
import { addDaysISO, fmtDateLabel, isToday, todayISO } from '../utils/date'
import { dayMacros, entryMacros, fmtNum, macroTargets, mealMacros } from '../utils/nutrition'

const mealIcon: Record<MealType, typeof UtensilsCrossed> = {
  breakfast: Salad,
  lunch: UtensilsCrossed,
  dinner: UtensilsCrossed,
  snacks: Zap,
}

export default function Diary() {
  const { mealEntries, deleteMealEntry, updateMealEntry, profile } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const date = params.get('date') ?? todayISO()
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null)
  const [editServings, setEditServings] = useState(1)

  const setDate = (d: string) => {
    const next = new URLSearchParams(params)
    next.set('date', d)
    setParams(next, { replace: true })
  }

  const targets = macroTargets(profile)
  const totals = dayMacros(mealEntries, date)
  const remaining = Math.max(0, Math.round(targets.calories - totals.calories))

  const byMeal = useMemo(() => {
    const map: Record<MealType, MealEntry[]> = { breakfast: [], lunch: [], dinner: [], snacks: [] }
    mealEntries
      .filter((e) => e.date === date)
      .forEach((e) => map[e.mealType].push(e))
    return map
  }, [mealEntries, date])

  const openEdit = (entry: MealEntry) => {
    setEditEntry(entry)
    setEditServings(entry.servings)
  }

  const saveEdit = () => {
    if (editEntry) {
      updateMealEntry(editEntry.id, editServings)
      setEditEntry(null)
    }
  }

  const editMacros = editEntry ? entryMacros({ ...editEntry, servings: editServings }) : null
  const editFood = editEntry ? foodById(editEntry.foodId) : undefined

  return (
    <div>
      <PageHeader
        title="Food Diary"
        subtitle={`${fmtDateLabel(date)} · ${isToday(date) ? "today's meals" : 'meals & macros'}`}
        right={
          <Link to={`/search?date=${date}`}>
            <Button size="sm">
              <Plus size={14} /> Add food
            </Button>
          </Link>
        }
      />

      {/* Date selector */}
      <Card className="mb-5 flex items-center justify-between gap-3 !py-3.5">
        <button
          onClick={() => setDate(addDaysISO(date, -1))}
          className="press flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-tile hover:text-text"
          aria-label="Previous day"
        >
          <ChevronLeft size={17} />
        </button>
        <div className="flex items-center gap-2.5">
          <Calendar size={16} className="text-accent" />
          <span className="text-sm font-bold text-text">{fmtDateLabel(date)}</span>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="ml-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted outline-none transition-colors focus:border-accent/60"
          />
        </div>
        <button
          onClick={() => setDate(addDaysISO(date, 1))}
          disabled={isToday(date)}
          className="press flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-tile hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next day"
        >
          <ChevronRight size={17} />
        </button>
      </Card>

      {/* Daily summary */}
      <Card className="mb-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <ProgressRing value={totals.calories} max={targets.calories} size={140} stroke={13}>
            <span className="text-2xl font-extrabold text-text">{fmtNum(Math.round(totals.calories))}</span>
            <span className="text-[11px] text-muted">of {fmtNum(targets.calories)} kcal</span>
          </ProgressRing>
          <div className="w-full max-w-md flex-1 space-y-4">
            {(
              [
                { label: 'Protein', value: totals.protein, target: targets.protein, color: 'var(--color-protein)' },
                { label: 'Carbs', value: totals.carbs, target: targets.carbs, color: 'var(--color-carbs)' },
                { label: 'Fats', value: totals.fat, target: targets.fat, color: 'var(--color-fat)' },
              ] as const
            ).map(({ label, value, target, color }) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-text">{label}</span>
                  <span className="tabular-nums text-muted">
                    <span className="font-semibold text-text">{fmtNum(value)}</span> / {fmtNum(target)}g
                  </span>
                </div>
                <ProgressBar value={value} max={target} color={color} />
              </div>
            ))}
            <p className="pt-1 text-sm text-muted">
              {targets.calories <= 0 ? (
                <span>
                  Set your calorie goal on the{' '}
                  <a href="/profile" className="font-semibold text-accent underline underline-offset-2">Profile</a> page to track remaining
                </span>
              ) : remaining > 0 ? (
                <>
                  <span className="font-bold text-accent">{fmtNum(remaining)} kcal</span> remaining for the day
                </>
              ) : (
                <span className="font-bold text-accent">Daily calorie goal reached 🎉</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Meal sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        {MEAL_TYPES.map((meal) => {
          const Icon = mealIcon[meal.key]
          const entries = byMeal[meal.key]
          const kcal = Math.round(mealMacros(mealEntries, date, meal.key).calories)
          return (
            <Card key={meal.key} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim text-accent">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text">{meal.label}</h3>
                    <p className="text-xs text-muted">{fmtNum(kcal)} kcal</p>
                  </div>
                </div>
                <Link to={`/search?meal=${meal.key}&date=${date}`}>
                  <Button size="sm" variant="outline">
                    <Plus size={14} /> Add
                  </Button>
                </Link>
              </div>

              {entries.length === 0 ? (
                <div className="flex-1">
                  <EmptyState
                    icon={<Icon size={20} />}
                    title={`No ${meal.label.toLowerCase()} logged`}
                    desc={`Add what you had for ${meal.label.toLowerCase()} to track your macros.`}
                    action={
                      <Button size="sm" variant="outline" onClick={() => navigate(`/search?meal=${meal.key}&date=${date}`)}>
                        Add {meal.label.toLowerCase()}
                      </Button>
                    }
                  />
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {entries.map((entry) => {
                    const food = foodById(entry.foodId)
                    if (!food) return null
                    const m = entryMacros(entry)
                    return (
                      <li key={entry.id} className="group flex items-center gap-3 py-3">
                        <FoodImage
                          foodId={entry.foodId}
                          alt={food.name}
                          className="h-10 w-10 shrink-0 rounded-lg"
                          iconSize={14}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text">{food.name}</p>
                          <p className="truncate text-xs text-muted">
                            {fmtNum(entry.servings, entry.servings % 1 === 0 ? 0 : 1)}× {food.servingLabel} · P {fmtNum(m.protein)} · C {fmtNum(m.carbs)} · F{' '}
                            {fmtNum(m.fat)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-text">{fmtNum(Math.round(m.calories))}</span>
                        <div className="flex shrink-0 gap-1 opacity-100 transition-opacity lg:opacity-60 lg:group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(entry)}
                            className="press flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-tile hover:text-text"
                            aria-label={`Edit ${food.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteMealEntry(entry.id)}
                            className="press flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                            aria-label={`Delete ${food.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          )
        })}
      </div>

      {/* Edit quantity modal */}
      <Modal
        open={editEntry !== null}
        onClose={() => setEditEntry(null)}
        title="Edit quantity"
        subtitle={editFood ? editFood.name : undefined}
      >
        <div className="space-y-5">
          {editFood && (
            <FoodImage
              foodId={editFood.id}
              alt={editFood.name}
              className="h-32 w-full rounded-2xl"
              iconSize={26}
            />
          )}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-tile p-4">
            <span className="text-sm text-muted">{editFood?.servingLabel}</span>
            <Stepper value={editServings} onChange={setEditServings} min={0.25} step={0.5} />
          </div>
          {editMacros && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'kcal', value: fmtNum(Math.round(editMacros.calories)) },
                { label: 'Protein', value: `${fmtNum(editMacros.protein)}g` },
                { label: 'Carbs', value: `${fmtNum(editMacros.carbs)}g` },
                { label: 'Fats', value: `${fmtNum(editMacros.fat)}g` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-card px-2 py-3">
                  <p className="text-base font-bold text-text">{s.value}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
