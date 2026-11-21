import { useMemo } from 'react'
import { CalendarCheck, ChartPie, Flame, Scale, Target, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { Card, EmptyState, PageHeader, StatCard, Button } from '../components/ui'
import { MacroRing } from '../components/MacroRing'
import { axisTick, chartTooltipStyle, gridStroke } from '../components/chartTheme'
import { useApp } from '../store/AppContext'
import { dailyPoints, fmtNum, macroTargets } from '../utils/nutrition'
import { fmtWeekday } from '../utils/date'

export default function Progress() {
  const { profile, mealEntries, waterEntries, exercises, weights } = useApp()
  const targets = macroTargets(profile)

  const week = useMemo(() => dailyPoints(mealEntries, waterEntries, exercises, 7), [mealEntries, waterEntries, exercises])

  const weekChart = week.map((d) => ({
    label: fmtWeekday(d.date) + (d.date === week[week.length - 1].date ? '•' : ''),
    calories: Math.round(d.calories),
    protein: Math.round(d.protein),
    carbs: Math.round(d.carbs),
    fat: Math.round(d.fat),
    target: targets.calories,
  }))

  const avgCalories = week.reduce((s, d) => s + d.calories, 0) / week.length
  const avgProtein = week.reduce((s, d) => s + d.protein, 0) / week.length
  const workoutCount = exercises.filter((e) => week.some((w) => w.date === e.date)).length
  const totalBurned = week.reduce((s, d) => s + d.burned, 0)

  const macroAvg = week.reduce(
    (acc, d) => ({ calories: acc.calories + d.calories, carbs: acc.carbs + d.carbs, fat: acc.fat + d.fat }),
    { calories: 0, carbs: 0, fat: 0 },
  )
  const kcalDen = Math.max(1, macroAvg.calories)
  const macroPie = [
    { name: 'Carbs', value: Math.round((macroAvg.carbs * 4 / kcalDen) * 100) },
    { name: 'Protein', value: Math.round(((avgProtein * 4) / kcalDen) * 100) },
    { name: 'Fats', value: Math.round((macroAvg.fat * 9 / kcalDen) * 100) },
  ]

  const weightChart = weights.slice(-10).map((w) => ({
    date: w.date,
    label: fmtWeekday(w.date) + ' ' + w.date.slice(8),
    kg: w.kg,
  }))

  const first = weights[0]?.kg ?? profile.weightKg
  const latest = weights[weights.length - 1]?.kg ?? profile.weightKg
  const change = latest - first
  const losing = change < 0

  const daysOnTarget = week.filter((d) => d.calories > 0).length
  const withinTarget = week.filter((d) => d.calories > 0 && Math.abs(d.calories - targets.calories) <= targets.calories * 0.1).length

  return (
    <div>
      <PageHeader title="Progress" subtitle="Your weekly performance at a glance" />

      {/* Summary cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Flame size={20} />}
          label="Avg daily calories"
          value={daysOnTarget > 0 ? `${fmtNum(Math.round(avgCalories))} kcal` : '—'}
          sub={targets.calories > 0 ? `Target ${fmtNum(targets.calories)} kcal` : 'No calorie target set'}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Avg protein"
          value={daysOnTarget > 0 ? `${fmtNum(Math.round(avgProtein))} g` : '—'}
          sub={targets.protein > 0 ? `Goal ${fmtNum(targets.protein)} g` : 'No protein target set'}
        />
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Workouts logged"
          value={`${workoutCount} this week`}
          sub={`${fmtNum(totalBurned)} kcal burned`}
        />
        <StatCard
          icon={losing ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          label="Weight change"
          value={weights.length < 2 ? '—' : `${losing ? '−' : '+'}${fmtNum(Math.abs(change), 1)} kg`}
          sub={weights.length < 2 ? (weights.length === 1 ? `${fmtNum(latest, 1)} kg logged` : 'No weigh-ins yet') : `Now ${fmtNum(latest, 1)} kg`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Weekly calories vs target */}
        <Card>
          <h3 className="mb-4 font-bold text-text">Weekly Calories</h3>
          <div className="h-64">
            {targets.calories <= 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<Flame size={22} />}
                  title="No calorie goal yet"
                  desc="Set your daily calorie target in Profile to compare against it."
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
                    formatter={(value, name) => [`${fmtNum(Number(value))} kcal`, name === 'calories' ? 'Consumed' : 'Target']}
                  />
                  <ReferenceLine y={targets.calories} stroke="var(--color-accent)" strokeDasharray="6 4" />
                  <Bar dataKey="calories" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {weekChart.map((d, i) => (
                      <Cell key={i} fill={d.calories > targets.calories ? 'var(--color-fat)' : 'var(--color-accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Protein tracking */}
        <Card>
          <h3 className="mb-4 font-bold text-text">Protein Intake</h3>
          <div className="h-64">
            {targets.protein <= 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<ChartPie size={22} />}
                  title="No protein goal yet"
                  desc="Set your daily protein target in Profile to track intake against it."
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
                <AreaChart data={weekChart} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="proteinFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-protein)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-protein)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${fmtNum(Number(value))} g`, 'Protein']} />
                  <ReferenceLine y={targets.protein} stroke="var(--color-protein)" strokeDasharray="6 4" label={{ value: 'Goal', position: 'insideTopRight', fill: 'var(--color-protein)', fontSize: 11 }} />
                  <Area type="monotone" dataKey="protein" stroke="var(--color-protein)" strokeWidth={2.5} fill="url(#proteinFill)" dot={{ r: 3, fill: 'var(--color-protein)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Macro distribution — macro ring with kcal centre */}
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
            <ChartPie size={17} className="text-accent" /> Macro Distribution
          </h3>
          <p className="mb-2 text-xs text-muted">Share of weekly calories by macro (approx.)</p>
          {macroAvg.calories > 0 ? (
            <div className="flex h-60 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
              <MacroRing
                p={macroPie[1].value}
                c={macroPie[0].value}
                f={macroPie[2].value}
                size={150}
                stroke={15}
              >
                <span className="text-xl font-extrabold text-text">{fmtNum(Math.round(avgCalories))}</span>
                <span className="text-[10px] font-medium text-muted">kcal / day avg</span>
              </MacroRing>
              <div className="w-full max-w-[230px] space-y-3.5">
                {[
                  { name: 'Protein', grams: avgProtein, pct: macroPie[1].value, dot: 'bg-protein', text: 'text-protein' },
                  { name: 'Carbs', grams: macroAvg.carbs / week.length, pct: macroPie[0].value, dot: 'bg-carbs', text: 'text-carbs' },
                  { name: 'Fats', grams: macroAvg.fat / week.length, pct: macroPie[2].value, dot: 'bg-fat', text: 'text-fat-ink' },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between gap-3 rounded-xl bg-tile px-3.5 py-2.5">
                    <span className="flex items-center gap-2.5 text-sm text-muted">
                      <span className={`h-3 w-3 rounded-full ${m.dot}`} />
                      {m.name}
                    </span>
                    <span className="text-sm font-bold text-text">
                      {fmtNum(m.grams)}g <span className={`text-xs font-semibold ${m.text}`}>· {m.pct}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center">
              <EmptyState
                icon={<ChartPie size={22} />}
                title="No food logged this week"
                desc="Log meals in the diary to see your macro split here."
                action={
                  <Link to="/diary">
                    <Button size="sm" variant="outline">
                      Open diary
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
        </Card>

        {/* Weight progress */}
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-bold text-text">
            <Scale size={17} className="text-accent" /> Weight Progress
          </h3>
          {weightChart.length === 0 ? (
            <>
              <p className="mb-2 text-xs text-muted">No weigh-ins yet</p>
              <div className="flex h-64 items-center justify-center">
                <EmptyState
                  icon={<Scale size={22} />}
                  title="Start tracking your weight"
                  desc="Log your first weigh-in to see the trend, weekly change and progress toward your target."
                  action={
                    <Link to="/weight">
                      <Button size="sm">
                        Log weight
                      </Button>
                    </Link>
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span>Last {weightChart.length} {weightChart.length === 1 ? 'weigh-in' : 'weigh-ins'}</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  {fmtNum(latest, 1)} kg now
                </span>
                {profile.targetWeightKg > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-chart-neutral)]" />
                    target {fmtNum(profile.targetWeightKg, 1)} kg
                  </span>
                )}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChart} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${fmtNum(Number(value), 1)} kg`, 'Weight']} />
                    <ReferenceLine
                      y={profile.targetWeightKg > 0 ? profile.targetWeightKg : undefined}
                      stroke="var(--color-border)"
                      strokeDasharray="5 4"
                    />
                    <Line type="monotone" dataKey="kg" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-accent)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        {/* Daily vs target comparison */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-bold text-text">Daily vs Target Comparison</h3>
          {profile.calorieTarget <= 0 && !weekChart.some((d) => d.calories > 0) ? (
            <div className="flex h-72 items-center justify-center">
              <EmptyState
                icon={<Target size={22} />}
                title="Nothing to compare yet"
                desc="Set your daily calorie target and log a few meals — this chart will show how each day compares against your goal."
                action={
                  <Link to="/profile">
                    <Button size="sm">Set goal</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChart} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,81,72,0.08)' }}
                  contentStyle={chartTooltipStyle}
                  formatter={(value, name) => [`${fmtNum(Number(value))} kcal`, name === 'calories' ? 'Consumed' : 'Target']}
                />
                <Bar dataKey="target" fill="var(--color-chart-neutral)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="calories" fill="var(--color-accent)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              Logged on <span className="font-semibold text-text">{daysOnTarget}/7</span> days · within ±10% of target on{' '}
              <span className="font-semibold text-accent">{withinTarget}</span> days
            </span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Consumed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-chart-neutral)]" /> Target
              </span>
            </span>
          </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
