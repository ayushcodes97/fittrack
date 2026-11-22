import { useMemo, useState } from 'react'
import { Droplets, GlassWater, Plus, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, Modal, PageHeader, ProgressBar } from '../components/ui'
import { useApp } from '../store/AppContext'
import { fmtDateLabel, fmtTime, isToday, lastNDays, todayISO } from '../utils/date'
import { fmtNum, fmtWater } from '../utils/nutrition'

const GLASS_ML = 250
const QUICK_ADDS = [
  { label: '1 glass', amount: GLASS_ML },
  { label: '2 glasses', amount: GLASS_ML * 2 },
  { label: 'Bottle', amount: 750 },
]

export default function Water() {
  const { waterEntries, addWater, deleteWater, profile } = useApp()
  const today = todayISO()
  const [customOpen, setCustomOpen] = useState(false)
  const [customMode, setCustomMode] = useState<'ml' | 'glasses'>('ml')
  const [customAmount, setCustomAmount] = useState(300)
  const [glassCount, setGlassCount] = useState(1)

  const todayTotal = useMemo(
    () => waterEntries.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0),
    [waterEntries, today],
  )
  const todayEntries = waterEntries.filter((e) => e.date === today)
  const pct = profile.waterTarget > 0 ? Math.min(100, (todayTotal / profile.waterTarget) * 100) : 0

  const history = useMemo(
    () =>
      lastNDays(7)
        .map((date) => ({
          date,
          total: waterEntries.filter((e) => e.date === date).reduce((s, e) => s + e.amount, 0),
        }))
        .reverse(),
    [waterEntries],
  )

  const goalReached = profile.waterTarget > 0 && todayTotal >= profile.waterTarget

  return (
    <div>
      <PageHeader title="Water Tracker" subtitle="Stay hydrated — every glass counts" />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Today's intake */}
        <Card className="flex flex-col items-center lg:col-span-2">
          <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:gap-12">
            {/* Bottle visual */}
            <div className="relative flex h-56 w-28 shrink-0 flex-col justify-end overflow-hidden rounded-b-[36px] rounded-t-[18px] border-2 border-border bg-tile">
              <div
                className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
                style={{
                  height: `${pct}%`,
                  background: 'linear-gradient(180deg, rgba(18,99,255,0.85), rgba(18,99,255,0.45))',
                }}
              />
              <div className="absolute inset-x-0 top-0 h-4 rounded-t-[16px] border-b-2 border-border bg-tile" />
              <div className="relative z-10 pb-4 text-center">
                <p className="text-xl font-extrabold text-text">{fmtNum(Math.round(pct))}%</p>
                <p className="text-[11px] font-medium text-muted">of daily goal</p>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-muted">Today's intake</p>
                  <p className="text-3xl font-extrabold text-text">{fmtWater(profile, todayTotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Daily goal</p>
                  <p className="text-lg font-bold text-[water]">{fmtWater(profile, profile.waterTarget)}</p>
                </div>
              </div>
              <ProgressBar value={todayTotal} max={profile.waterTarget} color="var(--color-water)" height="h-3" />
              <p className="text-sm text-muted">
                {profile.waterTarget <= 0 ? (
                  <span>
                    Set your daily goal on the{' '}
                    <a href="/profile" className="font-semibold text-[water] underline underline-offset-2">Profile</a>{' '}
                    page to track progress
                  </span>
                ) : goalReached ? (
                  <span className="font-semibold text-accent">Goal complete — great job! 💧</span>
                ) : (
                  <>
                    <span className="font-semibold text-[water]">{fmtWater(profile, profile.waterTarget - todayTotal)}</span> more to reach your goal
                  </>
                )}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <GlassWater size={13} className="text-[water]" />
                ≈ {fmtNum(Math.round((todayTotal / GLASS_ML) * 10) / 10)}{' '}
                {Math.round((todayTotal / GLASS_ML) * 10) / 10 === 1 ? 'glass' : 'glasses'} today (1 glass = {GLASS_ML} ml)
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ADDS.map((q) => (
                  <Button key={q.label} size="md" variant="outline" onClick={() => addWater(today, q.amount)}>
                    <GlassWater size={15} className="text-[water]" /> {q.label}
                    <span className="text-xs font-medium text-muted">{q.amount} ml</span>
                  </Button>
                ))}
                <Button size="md" onClick={() => setCustomOpen(true)}>
                  <Plus size={15} /> Custom
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's log */}
        <Card className="flex flex-col">
          <h3 className="mb-3 font-bold text-text">Today's Log</h3>
          {todayEntries.length === 0 ? (
            <div className="flex-1">
              <EmptyState
                icon={<GlassWater size={22} />}
                title="No water logged yet"
                desc="Tap a quick amount above to add your first glass."
              />
            </div>
          ) : (
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {todayEntries.map((entry) => (
                <li key={entry.id} className="group flex items-center gap-3 rounded-xl bg-tile px-3.5 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[water]/10 text-[water]">
                    <Droplets size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text">{fmtNum(entry.amount)} ml</p>
                    <p className="text-xs text-muted">{fmtTime(entry.time)}</p>
                  </div>
                  <button
                    onClick={() => deleteWater(entry.id)}
                    className="press flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted opacity-100 transition-colors hover:bg-danger/10 hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* History */}
        <Card className="lg:col-span-3">
          <h3 className="mb-4 font-bold text-text">Last 7 Days</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {history.map(({ date, total }) => {
              const dayPct = profile.waterTarget > 0 ? Math.min(100, (total / profile.waterTarget) * 100) : 0
              const done = profile.waterTarget > 0 && total >= profile.waterTarget
              return (
                <div
                  key={date}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isToday(date) ? 'border-[water]/50 bg-tile' : 'border-border bg-tile'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">{fmtDateLabel(date)}</span>
                    {done && <Droplets size={13} className="text-[water]" fill="currentColor" strokeWidth={0} />}
                  </div>
                  <p className="mb-2 text-sm font-bold tabular-nums text-text">{fmtNum(total)} ml</p>
                  <ProgressBar value={dayPct} max={100} color="var(--color-water)" height="h-1.5" />
                  <p className="mt-2 text-[11px] text-muted">{fmtNum(Math.round(dayPct))}% of goal</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Custom amount modal */}
      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Add water" subtitle="Type any amount, or count glasses">
        <div className="space-y-5">
          {/* mode switch */}
          <div className="flex rounded-full border border-border bg-tile p-1">
            {(
              [
                { key: 'ml', label: 'Millilitres' },
                { key: 'glasses', label: 'Glasses' },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setCustomMode(m.key)}
                className={`flex-1 cursor-pointer rounded-full py-2 text-sm font-bold transition-all ${
                  customMode === m.key ? 'bg-[water] text-white' : 'text-muted hover:text-text'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {customMode === 'ml' ? (
            <div className="rounded-2xl border border-border bg-tile p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Amount (ml)</label>
              <input
                type="number"
                value={customAmount || ''}
                onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-lg font-bold text-text outline-none focus:border-[water]/60"
                min={50}
                step={50}
                autoFocus
              />
              <div className="mt-3 flex gap-2">
                {[150, 300, 750, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCustomAmount(v)}
                    className="press flex-1 cursor-pointer rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-[water]/50 hover:text-text"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-tile p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Number of glasses</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setGlassCount(Math.max(1, glassCount - 1))}
                  className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-xl font-bold text-text transition-colors hover:border-[water]/50"
                  aria-label="Fewer glasses"
                >
                  −
                </button>
                <div className="flex min-w-28 flex-col items-center">
                  <div className="flex items-center gap-1.5">
                    <GlassWater size={20} className="text-[water]" />
                    <span className="text-2xl font-extrabold tabular-nums text-text">{glassCount}</span>
                  </div>
                  <span className="mt-0.5 text-xs text-muted">{glassCount * GLASS_ML} ml</span>
                </div>
                <button
                  onClick={() => setGlassCount(Math.min(20, glassCount + 1))}
                  className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[water] text-xl font-bold text-white transition-all hover:brightness-110"
                  aria-label="More glasses"
                >
                  +
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setGlassCount(n)}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      glassCount === n
                        ? 'border-[water] bg-[water]/10 text-[water]'
                        : 'border-border text-muted hover:border-[water]/50 hover:text-text'
                    }`}
                  >
                    {n} {n === 1 ? 'glass' : 'glasses'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => {
              addWater(today, customMode === 'ml' ? customAmount : glassCount * GLASS_ML)
              setCustomOpen(false)
              setCustomAmount(300)
              setGlassCount(1)
            }}
            disabled={customMode === 'ml' && customAmount < 50}
          >
            <Plus size={16} /> Add {fmtNum(customMode === 'ml' ? customAmount : glassCount * GLASS_ML)} ml
          </Button>
        </div>
      </Modal>
    </div>
  )
}
