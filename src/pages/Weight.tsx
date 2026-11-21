import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Flag, Plus, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, EmptyState, Modal, PageHeader, StatCard } from '../components/ui'
import { axisTick, chartTooltipStyle, gridStroke } from '../components/chartTheme'
import { useApp } from '../store/AppContext'
import { fmtDateLabel, todayISO } from '../utils/date'
import { fmtNum, fmtWeight } from '../utils/nutrition'

type Range = 'week' | 'month'

export default function Weight() {
  const { weights, addWeight, deleteWeight, profile } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [input, setInput] = useState('')
  const [range, setRange] = useState<Range>('week')

  const sorted = useMemo(() => [...weights].sort((a, b) => (a.date < b.date ? -1 : 1)), [weights])
  const current = sorted.length > 0 ? sorted[sorted.length - 1].kg : profile.weightKg
  const start = sorted.length > 0 ? sorted[0].kg : profile.weightKg
  const toGo = Math.abs(current - profile.targetWeightKg)
  const losing = current < start
  const thisWeekChange = sorted.length >= 2 ? current - sorted[sorted.length - 2].kg : 0

  const visible = range === 'week' ? sorted.slice(-8) : sorted.slice(-12)
  const chart = visible.map((w) => ({
    date: w.date,
    label: fmtDateLabel(w.date) === 'Today' ? 'Today' : w.date.slice(5),
    kg: w.kg,
  }))

  const handleAdd = () => {
    const kg = Number(input)
    if (!kg || kg <= 0) return
    addWeight(todayISO(), kg)
    setModalOpen(false)
    setInput('')
  }

  return (
    <div>
      <PageHeader
        title="Weight Tracker"
        subtitle="Track your journey to the goal"
        right={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add weight
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Scale size={20} />}
          label="Current weight"
          value={sorted.length > 0 ? fmtWeight(profile, current) : '—'}
          sub={sorted.length > 0 ? `Logged ${fmtDateLabel(sorted[sorted.length - 1].date)}` : 'No weigh-ins yet'}
        />
        <StatCard
          icon={<Flag size={20} />}
          label="Target weight"
          value={profile.targetWeightKg > 0 ? fmtWeight(profile, profile.targetWeightKg) : '—'}
          sub={
            profile.targetWeightKg > 0
              ? `${fmtNum(toGo, 1)} kg to go`
              : 'Set a target in Profile'
          }
        />
        <StatCard
          icon={<ArrowUpRight size={20} />}
          label="Starting weight"
          value={sorted.length > 0 ? fmtWeight(profile, start) : '—'}
          sub={sorted.length > 0 ? 'First recorded' : 'Log your first weigh-in'}
        />
        <StatCard
          icon={losing ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          label={sorted.length < 2 ? 'Progress since start' : losing ? 'Lost since start' : 'Gained since start'}
          value={
            sorted.length < 2
              ? '—'
              : `${losing ? '−' : '+'}${fmtNum(Math.abs(current - start), 1)} kg`
          }
          sub={
            sorted.length < 2
              ? 'Needs at least 2 weigh-ins'
              : `${thisWeekChange === 0 ? 'No change' : `${thisWeekChange < 0 ? '−' : '+'}${fmtNum(Math.abs(thisWeekChange), 1)} kg`} since last entry`
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-text">Weight Trend</h3>
            <div className="flex rounded-xl border border-border p-1">
              {(
                [
                  { key: 'week', label: 'Weekly' },
                  { key: 'month', label: 'Monthly' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`press cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    range === key ? 'bg-accent text-white' : 'text-muted hover:text-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {chart.length === 0 ? (
              <EmptyState icon={<Scale size={22} />} title="No data yet" desc="Add your first weigh-in to see the trend." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 10, right: 6, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={['dataMin - 0.8', 'dataMax + 0.8']} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [fmtWeight(profile, Number(value)), 'Weight']} />
                  <ReferenceLine
                    y={profile.targetWeightKg}
                    stroke="var(--color-water)"
                    strokeDasharray="6 4"
                    label={{ value: 'Target', position: 'insideTopRight', fill: 'var(--color-water)', fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="var(--color-accent)"
                    strokeWidth={2.5}
                    fill="url(#weightFill)"
                    dot={{ r: 3.5, fill: 'var(--color-accent)', strokeWidth: 0 }}
                    activeDot={{ r: 5.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* History */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text">History</h3>
            <span className="text-xs text-muted">{weights.length} {weights.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          {weights.length === 0 ? (
            <EmptyState
              icon={<Scale size={22} />}
              title="No weigh-ins yet"
              desc="Log your weight regularly to track progress."
              action={
                <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Add weight
                </Button>
              }
            />
          ) : (
            <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {[...weights]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((w, i, arr) => {
                  const prev = arr[i + 1]
                  const diff = prev ? w.kg - prev.kg : 0
                  return (
                    <li
                      key={w.id}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-tile px-3.5 py-3 transition-colors hover:bg-tile"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          diff < 0 ? 'bg-accent-dim text-accent' : diff > 0 ? 'bg-[#ffd335]/15 text-fat-ink' : 'bg-border text-muted'
                        }`}
                      >
                        {diff < 0 ? <ArrowDownRight size={16} /> : diff > 0 ? <ArrowUpRight size={16} /> : <Scale size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-text">{fmtWeight(profile, w.kg)}</p>
                        <p className="text-xs text-muted">
                          {fmtDateLabel(w.date)}
                          {i + 1 < arr.length && diff !== 0 ? ` · ${diff < 0 ? '−' : '+'}${fmtNum(Math.abs(diff), 1)}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteWeight(w.id)}
                        className="press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                        aria-label="Delete entry"
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

      {/* Add weight modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add weight" subtitle="Log today's measurement">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-tile p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
              Weight ({profile.units === 'imperial' ? 'lb' : 'kg'})
            </label>
            <input
              type="number"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={profile.units === 'imperial' ? 'e.g. 168' : 'e.g. 76.2'}
              className="h-12 w-full rounded-xl border border-border bg-tile px-4 text-lg font-bold text-text outline-none focus:border-accent/60"
              step={0.1}
              min={0}
            />
          </div>
          <Button className="w-full" onClick={handleAdd} disabled={!input || Number(input) <= 0}>
            <Plus size={16} /> Save weight
          </Button>
        </div>
      </Modal>
    </div>
  )
}
