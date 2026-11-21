import { useEffect, useMemo, useState } from 'react'
import { Bike, Dumbbell, Footprints, Plus, RefreshCw, Timer, Trash2, Zap, type LucideIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, EmptyState, Modal, PageHeader, StatCard } from '../components/ui'
import { axisTick, chartTooltipStyle, gridStroke } from '../components/chartTheme'
import { useApp } from '../store/AppContext'
import { EXERCISE_TYPES, type ExerciseEntry, type ExerciseType } from '../types'
import { fmtDateLabel, fmtWeekday, isToday, lastNDays, todayISO } from '../utils/date'
import { burnedOn, estimateBurn, fmtNum } from '../utils/nutrition'
import { deviceStepsAvailable, getStepsFromDevice, stepsToKcal, stepsToKm } from '../utils/steps'
import { tapSoft } from '../utils/haptics'

const typeIcons: Record<ExerciseType, LucideIcon> = {
  strength: Dumbbell,
  running: Footprints,
  walking: Footprints,
  cycling: Bike,
  cardio: Zap,
}

export default function Activity() {
  const { exercises, addExercise, deleteExercise, profile, steps, setSteps } = useApp()
  const today = todayISO()

  const [modalOpen, setModalOpen] = useState(false)
  const [reportType, setReportType] = useState<ExerciseType | null>(null)
  const [type, setType] = useState<ExerciseType>('running')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [distance, setDistance] = useState('')

  /* ---- Steps (manual on web; from Health Connect / HealthKit on mobile) ---- */
  const [nativeSteps, setNativeSteps] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [stepInput, setStepInput] = useState('')

  useEffect(() => {
    setNativeSteps(deviceStepsAvailable())
  }, [])

  const todaySteps = steps[today] ?? 0
  const stepKm = stepsToKm(todaySteps, profile.heightCm)
  const stepKcal = stepsToKcal(todaySteps, profile.weightKg)

  const week = useMemo(() => lastNDays(7), [])
  const weekSteps = week.map((date) => ({
    label: isToday(date) ? 'Today' : fmtWeekday(date),
    steps: steps[date] ?? 0,
  }))

  const syncFromDevice = async () => {
    setSyncing(true)
    try {
      const res = await getStepsFromDevice()
      if (res) setSteps(today, res.steps)
    } finally {
      setSyncing(false)
    }
  }

  const saveSteps = () => {
    const n = Math.max(0, Math.round(Number(stepInput) || 0))
    setSteps(today, n)
    setStepInput('')
  }
  const weekChart = week.map((date) => ({
    label: isToday(date) ? 'Today' : fmtWeekday(date),
    burned: Math.round(burnedOn(exercises, date)),
  }))
  const weekWorkouts = exercises.filter((e) => week.includes(e.date))
  const weekMinutes = weekWorkouts.reduce((s, e) => s + e.duration, 0)
  const weekCalories = weekWorkouts.reduce((s, e) => s + e.calories, 0)

  const sorted = useMemo(() => [...exercises].sort((a, b) => (a.date < b.date ? 1 : -1)), [exercises])

  const currentType = EXERCISE_TYPES.find((t) => t.key === type)!
  const estimated = estimateBurn(currentType.met, profile.weightKg, duration)

  const openModal = (preset: ExerciseType) => {
    setType(preset)
    const meta = EXERCISE_TYPES.find((t) => t.key === preset)!
    setName(meta.label)
    setDuration(preset === 'walking' ? 30 : preset === 'strength' ? 45 : 30)
    setDistance('')
    setModalOpen(true)
  }

  /* ---- Per-activity report ---- */
  const report = useMemo(() => {
    if (!reportType) return null
    const sessions = exercises
      .filter((e) => e.type === reportType)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
    const totalMin = sessions.reduce((s, e) => s + e.duration, 0)
    const totalKcal = sessions.reduce((s, e) => s + e.calories, 0)
    const totalKm = sessions.reduce((s, e) => s + (e.distance ?? 0), 0)
    const weekSessions = sessions.filter((e) => week.includes(e.date))
    const meta = EXERCISE_TYPES.find((t) => t.key === reportType)!
    return {
      meta,
      sessions,
      totalMin,
      totalKcal,
      totalKm,
      weekCount: weekSessions.length,
      weekMin: weekSessions.reduce((s, e) => s + e.duration, 0),
      avgMin: sessions.length > 0 ? Math.round(totalMin / sessions.length) : 0,
      lastDate: sessions[0]?.date,
      chart: week.map((date) => ({
        label: isToday(date) ? 'Today' : fmtWeekday(date),
        minutes: sessions.filter((e) => e.date === date).reduce((s, e) => s + e.duration, 0),
        kcal: sessions.filter((e) => e.date === date).reduce((s, e) => s + e.calories, 0),
      })),
    }
  }, [reportType, exercises, week])

  const handleAdd = () => {
    addExercise({
      date: today,
      type,
      name: name.trim() || currentType.label,
      duration,
      distance: distance ? Number(distance) : undefined,
    })
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Exercise Tracker"
        subtitle="Log workouts and watch the calories burn"
        right={
          <Button size="sm" onClick={() => openModal('running')}>
            <Plus size={14} /> Add exercise
          </Button>
        }
      />

      {/* Exercise type cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {EXERCISE_TYPES.map((t) => {
          const Icon = typeIcons[t.key]
          return (
            <button
              key={t.key}
              onClick={() => {
                void tapSoft()
                setReportType(t.key)
              }}
              className="press glass group cursor-pointer rounded-[20px] border border-border p-4 text-left transition-colors duration-150 hover:border-accent/50 hover:bg-tile active:scale-[0.98]"
            >
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim text-accent transition-transform group-hover:scale-105">
                <Icon size={18} />
              </div>
              <p className="text-sm font-bold text-text">{t.label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{t.hint}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                <Timer size={11} /> View report
              </p>
            </button>
          )
        })}
      </div>

      {/* Week summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Dumbbell size={20} />} label="Workouts this week" value={fmtNum(weekWorkouts.length)} sub="Sessions completed" />
        <StatCard icon={<Timer size={20} />} label="Total time" value={`${fmtNum(weekMinutes)} min`} sub="Active minutes" />
        <StatCard icon={<Zap size={20} />} label="Calories burned" value={`${fmtNum(weekCalories)} kcal`} sub="This week" />
      </div>

      {/* Steps card — manual on web, synced from Health Connect / HealthKit on mobile */}
      <Card className="mb-5">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's steps + quick entry */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-text">Today's Steps</h3>
              {nativeSteps && (
                <Button size="sm" variant="outline" onClick={syncFromDevice} disabled={syncing}>
                  <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> Sync
                </Button>
              )}
            </div>
            <div className="flex items-end gap-2">
              <Footprints size={26} className="mb-1.5 text-accent" />
              <span className="text-4xl font-extrabold tabular-nums text-text">{fmtNum(todaySteps)}</span>
              <span className="mb-1 text-xs font-medium text-muted">steps</span>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              ≈ {fmtNum(stepKm, 1)} km · {fmtNum(Math.round(stepKcal))} kcal {nativeSteps ? '· synced from device' : '· added manually'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSteps(today, (s) => Math.max(0, s - 500))}
                className="press h-10 cursor-pointer rounded-xl border border-border bg-tile px-3 text-sm font-bold text-text transition-colors hover:bg-tile"
                aria-label="Remove 500 steps"
              >
                −500
              </button>
              {[500, 1000, 2000].map((n) => (
                <button
                  key={n}
                  onClick={() => setSteps(today, (s) => s + n)}
                  className="press h-10 cursor-pointer rounded-xl border border-border bg-tile px-3 text-sm font-bold text-text transition-colors hover:border-accent/50 hover:text-accent"
                >
                  +{fmtNum(n)}
                </button>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveSteps()}
                  placeholder="Exact"
                  className="h-10 w-20 rounded-xl border border-border bg-tile px-3 text-sm tabular-nums text-text outline-none transition-colors focus:border-accent/60"
                />
                <button
                  onClick={saveSteps}
                  className="press h-10 cursor-pointer rounded-xl bg-accent px-3 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          {/* 7-day steps chart */}
          <div>
            <h3 className="mb-3 font-bold text-text">Steps — Last 7 Days</h3>
            {weekSteps.some((d) => d.steps > 0) ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekSteps} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(18,99,255,0.08)' }}
                      contentStyle={chartTooltipStyle}
                      formatter={(value) => [`${fmtNum(Number(value))} steps`, 'Steps']}
                    />
                    <Bar dataKey="steps" fill="var(--color-water)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-tile px-4 text-center text-xs text-muted">
                No steps recorded yet — add steps above or connect a health device in Profile.
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Weekly burned chart */}
        <Card>
          <h3 className="mb-4 font-bold text-text">Calories Burned — Last 7 Days</h3>
          {weekChart.some((d) => d.burned > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekChart} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(52,199,123,0.08)' }}
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${fmtNum(Number(value))} kcal`, 'Burned']}
                  />
                  <Bar dataKey="burned" fill="var(--color-accent)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-tile px-4 text-center text-xs text-muted">
              No workouts this week yet — log your first session above and your burn will show up here.
            </p>
          )}
        </Card>

        {/* History */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text">Workout History</h3>
            <span className="text-xs text-muted">{sorted.length} total</span>
          </div>
          {sorted.length === 0 ? (
            <EmptyState
              icon={<Bike size={22} />}
              title="No workouts yet"
              desc="Pick an exercise type above to log your first session."
            />
          ) : (
            <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {sorted.map((ex: ExerciseEntry) => {
                const Icon = typeIcons[ex.type]
                return (
                  <li
                    key={ex.id}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-tile px-3.5 py-3 transition-colors hover:bg-tile"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{ex.name}</p>
                      <p className="truncate text-xs text-muted">
                        {fmtDateLabel(ex.date)} · {ex.duration} min
                        {ex.distance ? ` · ${ex.distance} km` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-accent">{fmtNum(ex.calories)} kcal</span>
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label={`Delete ${ex.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Add exercise modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add exercise" subtitle="Log today's workout">
        <div className="space-y-5">
          {/* Type */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Exercise type</p>
            <div className="grid grid-cols-3 gap-2">
              {EXERCISE_TYPES.map((t) => {
                const Icon = typeIcons[t.key]
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setType(t.key)
                      setName(t.label)
                    }}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-semibold transition-all ${
                      type === t.key ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-tile text-muted hover:text-text'
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Workout name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Run"
              className="h-11 w-full rounded-xl border border-border bg-tile px-4 text-sm text-text outline-none transition-colors focus:border-accent/60"
            />
          </div>

          {/* Duration stepper */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-tile p-4">
            <span className="text-sm text-muted">Duration</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDuration(Math.max(5, duration - 5))}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-lg font-bold text-text transition-colors hover:bg-tile"
                aria-label="Decrease duration"
              >
                −
              </button>
              <div className="min-w-16 text-center text-lg font-bold tabular-nums text-text">{duration} min</div>
              <button
                onClick={() => setDuration(duration + 5)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-accent text-lg font-bold text-white transition-all hover:brightness-110"
                aria-label="Increase duration"
              >
                +
              </button>
            </div>
          </div>

          {/* Distance */}
          {currentType.tracksDistance && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Distance (km, optional)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 5.2"
                className="h-11 w-full rounded-xl border border-border bg-tile px-4 text-sm text-text outline-none transition-colors focus:border-accent/60"
                step={0.1}
                min={0}
              />
            </div>
          )}

          {/* Estimate */}
          <div className="flex items-center justify-between rounded-2xl bg-accent-dim px-4 py-3.5">
            <span className="text-sm font-medium text-text">Estimated burn</span>
            <span className="text-lg font-extrabold text-accent">{fmtNum(estimated)} kcal</span>
          </div>

          <Button className="w-full" onClick={handleAdd}>
            <Plus size={16} /> Add workout
          </Button>
        </div>
      </Modal>

      {/* Per-activity report */}
      <Modal
        open={report !== null}
        onClose={() => setReportType(null)}
        title={report ? `${report.meta.label} Report` : ''}
        subtitle={report ? report.meta.hint : undefined}
      >
        {report && (
          <div className="space-y-4">
            {/* headline stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sessions', value: fmtNum(report.sessions.length) },
                { label: 'Total time', value: `${fmtNum(report.totalMin)} min` },
                { label: 'Calories burned', value: `${fmtNum(report.totalKcal)} kcal` },
                report.meta.tracksDistance
                  ? { label: 'Distance', value: `${fmtNum(report.totalKm, 1)} km` }
                  : { label: 'Avg session', value: `${fmtNum(report.avgMin)} min` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-tile px-3.5 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{s.label}</p>
                  <p className="mt-0.5 text-lg font-extrabold text-text">{s.value}</p>
                </div>
              ))}
            </div>

            {/* this week / last done */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-2.5 text-xs">
              <span className="text-muted">
                This week: <span className="font-bold text-text">{report.weekCount}</span> sessions ·{' '}
                <span className="font-bold text-text">{report.weekMin} min</span>
              </span>
              <span className="text-muted">
                Last done:{' '}
                <span className="font-bold text-text">
                  {report.lastDate ? (isToday(report.lastDate) ? 'Today' : fmtDateLabel(report.lastDate)) : 'Never'}
                </span>
              </span>
            </div>

            {/* 7-day chart for this activity */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Last 7 days — minutes</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,81,72,0.08)' }}
                      contentStyle={chartTooltipStyle}
                      formatter={(value) => [`${fmtNum(Number(value))} min`, 'Time']}
                    />
                    <Bar dataKey="minutes" fill="var(--color-accent)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* recent sessions */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Recent sessions</p>
              {report.sessions.length === 0 ? (
                <p className="rounded-xl bg-tile px-3.5 py-3 text-xs text-muted">
                  Nothing logged yet — start your first {report.meta.label.toLowerCase()} session.
                </p>
              ) : (
                <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                  {report.sessions.slice(0, 8).map((e) => (
                    <li key={e.id} className="flex items-center gap-3 rounded-xl bg-tile px-3 py-2 text-xs">
                      <span className="min-w-0 flex-1 truncate font-semibold text-text">{e.name}</span>
                      <span className="shrink-0 text-muted">{fmtDateLabel(e.date)}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-muted">{e.duration} min</span>
                      <span className="shrink-0 font-bold tabular-nums text-accent">{fmtNum(e.calories)} kcal</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                const t = report.meta.key
                setReportType(null)
                openModal(t)
              }}
            >
              <Plus size={16} /> Log {report.meta.label.toLowerCase()}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
