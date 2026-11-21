import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bike,
  ChevronRight,
  Dumbbell,
  Droplets,
  Footprints,
  Flame,
  GlassWater,
  Plus,
  Salad,
  Scale,
  ScanLine,
  Target,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button, Card, EmptyState, ProgressBar, ProgressRing, Skeleton, StatCard } from '../components/ui'
import { FoodImage } from '../components/FoodImage'
import { axisTick, chartTooltipStyle, gridStroke } from '../components/chartTheme'
import { useApp } from '../store/AppContext'
import { tapSoft } from '../utils/haptics'
import { MEAL_TYPES, type MealType } from '../types'
import { fmtWeekday, isToday, lastNDays } from '../utils/date'
import { burnedOn, dayMacros, fmtNum, macroTargets, mealMacros, waterOn } from '../utils/nutrition'

export default function Dashboard() {
  const { profile, mealEntries, waterEntries, exercises, weights } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const today = useMemo(() => lastNDays(1)[0], [])
  const targets = macroTargets(profile)
  const consumed = dayMacros(mealEntries, today)
  const burned = burnedOn(exercises, today)
  const water = waterOn(waterEntries, today)
  const remaining = Math.max(0, Math.round(targets.calories - consumed.calories))

  const weekChart = useMemo(
    () =>
      lastNDays(7).map((date) => ({
        date,
        label: isToday(date) ? 'Today' : fmtWeekday(date),
        calories: Math.round(dayMacros(mealEntries, date).calories),
      })),
    [mealEntries],
  )

  const mealsByType = useMemo(() => {
    const out = {} as Record<MealType, { calories: number }>
    MEAL_TYPES.forEach((m) => {
      out[m.key] = mealMacros(mealEntries, today, m.key)
    })
    return out
  }, [mealEntries, today])

  const todaysExercises = exercises.filter((e) => e.date === today)
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].kg : profile.weightKg

  /** First logged food photo per meal — used for meal row thumbnails */
  const firstFoodByMeal = useMemo(() => {
    const out = {} as Record<MealType, string | null>
    MEAL_TYPES.forEach((m) => {
      const first = mealEntries.find((e) => e.date === today && e.mealType === m.key)
      out[m.key] = first ? first.foodId : null
    })
    return out
  }, [mealEntries, today])

  const mealIconFor = (type: MealType) => {
    if (type === 'breakfast') return Salad
    if (type === 'snacks') return Zap
    return UtensilsCrossed
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-44" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/search', label: 'Add Food', icon: Plus },
          { to: '/scan', label: 'Scan Food', icon: ScanLine },
          { to: '/diets', label: 'Diets', icon: Salad },
          { to: '/water', label: 'Log Water', icon: GlassWater },
          { to: '/activity', label: 'Log Workout', icon: Dumbbell },
          { to: '/weight', label: 'Log Weight', icon: Scale },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => void tapSoft()}
            className="press glass group flex items-center gap-3 rounded-[20px] border border-border px-3.5 py-3 transition-colors duration-150 hover:border-accent/30 hover:bg-tile active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{label}</span>
            <ChevronRight size={15} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calorie ring */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-text">Today's Nutrition</h2>
            <Link to="/diary" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              View diary <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
            <ProgressRing value={consumed.calories} max={targets.calories} size={210} stroke={17}>
              <span className="text-4xl font-extrabold tracking-tight text-text">{fmtNum(Math.round(consumed.calories))}</span>
              <span className="text-xs font-medium text-muted">of {fmtNum(targets.calories)} kcal</span>
              <span className="mt-2 rounded-full bg-accent-dim px-3 py-1 text-xs font-semibold text-accent">
                {targets.calories <= 0 ? 'Set your goal in Profile' : remaining > 0 ? `${fmtNum(remaining)} kcal left` : 'Goal reached!'}
              </span>
            </ProgressRing>
            <div className="w-full max-w-xs flex-1 space-y-4">
              {(
                [
                  { key: 'protein', label: 'Protein', value: consumed.protein, target: targets.protein, color: 'var(--color-protein)' },
                  { key: 'carbs', label: 'Carbs', value: consumed.carbs, target: targets.carbs, color: 'var(--color-carbs)' },
                  { key: 'fat', label: 'Fats', value: consumed.fat, target: targets.fat, color: 'var(--color-fat)' },
                ] as const
              ).map(({ key, label, value, target, color }) => (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-text">{label}</span>
                    <span className="tabular-nums text-muted">
                      <span className="font-semibold text-text">{fmtNum(value, key === 'protein' ? 0 : 0)}</span>
                      {' / '}
                      {fmtNum(target)}g
                    </span>
                  </div>
                  <ProgressBar value={value} max={target} color={color} />
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted">
                  <Flame size={15} className="text-danger" /> Burned
                </span>
                <span className="font-semibold tabular-nums text-text">{fmtNum(burned)} kcal</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Water widget */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-text">Water Intake</h2>
            <Link to="/water" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Details <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ProgressRing value={water} max={profile.waterTarget} size={130} stroke={12} color="var(--color-water)" trackColor="var(--color-border)">
              <Droplets size={22} className="mb-1 text-water" fill="currentColor" strokeWidth={0} />
              <span className="text-xl font-extrabold text-text">{fmtNum(profile.waterTarget > 0 ? Math.round((water / profile.waterTarget) * 100) : 0)}%</span>
              <span className="text-[11px] font-medium text-muted">
                {fmtNum(water)} / {fmtNum(profile.waterTarget)} ml
              </span>
            </ProgressRing>
            <div className="flex gap-2">
              {[100, 250, 500].map((amt) => (
                <Link
                  key={amt}
                  to="/water"
                  className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-text transition-colors hover:border-water/50 hover:bg-tile"
                >
                  +{amt}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's meals */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-text">Today's Meals</h2>
            <Link to="/search" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              <Plus size={13} /> Add food
            </Link>
          </div>
          <div className="space-y-2.5">
            {MEAL_TYPES.map((meal) => {
              const Icon = mealIconFor(meal.key)
              const kcal = Math.round(mealsByType[meal.key].calories)
              const foodId = firstFoodByMeal[meal.key]
              return (
                <Link
                  key={meal.key}
                  to={`/diary?date=${today}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-tile p-3.5 transition-all duration-150 hover:border-accent/40 hover:bg-tile"
                >
                  {foodId ? (
                    <FoodImage foodId={foodId} alt={meal.label} className="h-11 w-11 shrink-0 rounded-xl" iconSize={16} />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
                      <Icon size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text">{meal.label}</p>
                    <p className="text-xs text-muted">{kcal > 0 ? `${fmtNum(kcal)} kcal logged` : 'Nothing logged yet'}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              )
            })}
          </div>
        </Card>

        {/* Activity summary */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-text">Activity</h2>
            <Link to="/activity" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Log <ArrowRight size={13} />
            </Link>
          </div>
          {todaysExercises.length === 0 ? (
            <EmptyState
              icon={<Bike size={22} />}
              title="No workouts today"
              desc="Log your first workout to see it here."
              action={
                <Button size="sm" onClick={() => navigate('/activity')}>
                  <Plus size={14} /> Add workout
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {todaysExercises.map((ex) => {
                const icon =
                  ex.type === 'running' || ex.type === 'walking' ? Footprints : ex.type === 'cycling' ? Bike : Dumbbell
                const Icon = icon
                return (
                  <div key={ex.id} className="flex items-center gap-3 rounded-xl bg-tile p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-dim text-accent">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{ex.name}</p>
                      <p className="text-xs text-muted">
                        {ex.duration} min{ex.distance ? ` · ${ex.distance} km` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-accent">{fmtNum(ex.calories)}</span>
                  </div>
                )
              })}
              <div className="mt-1 flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-sm">
                <span className="text-muted">Total burned</span>
                <span className="font-bold tabular-nums text-text">{fmtNum(burned)} kcal</span>
              </div>
            </div>
          )}
        </Card>

        {/* Weekly calories */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-text">Weekly Calorie Overview</h2>
            <Link to="/progress" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Full progress <BarChart3 size={13} />
            </Link>
          </div>
          <div className="h-56 w-full sm:h-64">
            {targets.calories <= 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<Flame size={22} />}
                  title="No calorie goal yet"
                  desc="Set your daily calorie target in Profile to see your weekly overview."
                  action={
                    <Link to="/profile">
                      <Button size="sm" variant="outline">
                        Set goal
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekChart} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,81,72,0.08)' }}
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${fmtNum(Number(value))} kcal`, 'Consumed']}
                  />
                  <ReferenceLine
                    y={targets.calories}
                    stroke="var(--color-accent)"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{ value: 'Target', position: 'insideTopRight', fill: 'var(--color-accent)', fontSize: 11 }}
                  />
                  <Bar dataKey="calories" fill="var(--color-accent)" radius={[8, 8, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Weight snapshot */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={<Scale size={20} />}
          label="Current weight"
          value={latestWeight > 0 ? `${fmtNum(latestWeight, 1)} kg` : '—'}
          sub={profile.targetWeightKg > 0 ? `Target ${fmtNum(profile.targetWeightKg, 1)} kg` : 'No target set'}
        />
        {profile.targetWeightKg > 0 && latestWeight > 0 ? (
          <StatCard
            icon={latestWeight > profile.targetWeightKg ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
            label="To reach target"
            value={`${fmtNum(Math.abs(latestWeight - profile.targetWeightKg), 1)} kg ${latestWeight > profile.targetWeightKg ? 'to lose' : 'to gain'}`}
          />
        ) : (
          <StatCard
            icon={<Target size={20} />}
            label="To reach target"
            value="—"
            sub={profile.targetWeightKg <= 0 ? 'Set a weight target in Profile' : 'Log your first weigh-in'}
          />
        )}
        <StatCard icon={<Flame size={20} />} label="Calorie balance" value={`${fmtNum(Math.round(consumed.calories - burned))} kcal`} sub="Consumed − burned" />
      </div>
    </div>
  )
}
