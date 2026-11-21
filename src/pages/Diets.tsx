import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChefHat, Plus, Sparkles, Target, UtensilsCrossed } from 'lucide-react'
import { Button, Card, EmptyState, Modal, PageHeader } from '../components/ui'
import { MacroLegend, MacroRing } from '../components/MacroRing'
import { DIET_PLANS } from '../data/diets'
import { useApp } from '../store/AppContext'
import { fmtNum } from '../utils/nutrition'
import { tapSoft } from '../utils/haptics'
import type { DietPlan, Profile } from '../types'

/**
 * Diets page — macro-ring concept.
 * Every plan renders as a macro donut ring (Protein / Carbs / Fat energy
 * share) with calories in the centre, plus a personal "match score" that
 * ranks each plan against the user's own goal and daily targets.
 */

/** Energy share (%) of each macro from kcal + grams */
function macroPercents(d: DietPlan) {
  const p = d.protein * 4
  const c = d.carbs * 4
  const f = d.fat * 9
  const total = p + c + f || 1
  return {
    protein: Math.round((p / total) * 100),
    carbs: Math.round((c / total) * 100),
    fat: Math.round((f / total) * 100),
  }
}

/** How well a plan fits the user's goal & targets (35-99) */
function matchScore(d: DietPlan, profile: Profile): number {
  const kcalDiff = Math.abs(d.kcal - profile.calorieTarget) / profile.calorieTarget
  const pDiff = Math.abs(d.protein - profile.proteinTarget) / Math.max(1, profile.proteinTarget)
  let score = Math.round((1 - Math.min(1, kcalDiff)) * 60 + (1 - Math.min(1, pDiff)) * 40)
  const goal = d.goal.toLowerCase()
  if (profile.goal === 'lose' && /fat loss|weight/.test(goal)) score += 8
  if (profile.goal === 'gain' && /muscle|gain|strength/.test(goal)) score += 8
  if (profile.goal === 'maintain' && /maintenance|everyday|health/.test(goal)) score += 8
  return Math.max(35, Math.min(99, score))
}

/** Donut ring with three macro segments (protein / carbs / fat) — shared, see components/MacroRing.tsx */

function DietRingCard({
  diet, match, bestMatch, inMyDiets, hasTargets, onOpen,
}: {
  diet: DietPlan
  match: number
  bestMatch: boolean
  inMyDiets: boolean
  hasTargets: boolean
  onOpen: (d: DietPlan) => void
}) {
  const pct = macroPercents(diet)
  return (
    <button
      onClick={() => {
        void tapSoft()
        onOpen(diet)
      }}
      className="press glass group flex w-full cursor-pointer items-center gap-4 rounded-[18px] border border-border/70 p-4 text-left transition-colors duration-150 hover:border-accent/50 active:scale-[0.98]"
    >
      <MacroRing p={pct.protein} c={pct.carbs} f={pct.fat} size={92} stroke={10}>
        <p className="text-base font-extrabold leading-none text-text">{fmtNum(diet.kcal)}</p>
        <p className="mt-0.5 text-[9px] font-medium text-muted">kcal / day</p>
      </MacroRing>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-bold text-text">{diet.name}</h3>
          {inMyDiets && (
            <span className="rounded-full bg-accent-dim px-2 py-0.5 text-[9px] font-bold text-accent">My Diet</span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted">{diet.goal}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              !hasTargets
                ? 'bg-tile text-muted ring-1 ring-border'
                : bestMatch
                  ? 'bg-accent text-white'
                  : 'bg-accent-dim text-accent'
            }`}
            title={
              hasTargets
                ? `${match}% match with your daily targets`
                : 'Set your calorie & protein targets in Profile to see a match score'
            }
          >
            <Target size={10} /> {hasTargets ? `${match}% match` : 'Set targets'}
          </span>
          <MacroLegend p={pct.protein} c={pct.carbs} f={pct.fat} />
        </div>
      </div>
    </button>
  )
}

export default function Diets() {
  const { profile, myDietIds, toggleDiet } = useApp()
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [open, setOpen] = useState<DietPlan | null>(null)

  const scored = useMemo(() => {
    const withScore = DIET_PLANS.map((d) => ({ diet: d, match: matchScore(d, profile) }))
    return withScore.sort((a, b) => b.match - a.match)
  }, [profile])

  const list = tab === 'all' ? scored : scored.filter((s) => myDietIds.includes(s.diet.id))
  const bestId = scored[0]?.diet.id
  // A match score is only meaningful once the user has daily targets
  const hasTargets = profile.calorieTarget > 0 && profile.proteinTarget > 0
  const openPct = open ? macroPercents(open) : null
  const openMatch = open ? matchScore(open, profile) : 0
  const openTotals = open
    ? open.meals.reduce(
        (a, m) => ({
          kcal: a.kcal + m.kcal,
          protein: a.protein + m.protein,
          carbs: a.carbs + m.carbs,
          fat: a.fat + m.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      )
    : null

  return (
    <div>
      <PageHeader
        title="Diets"
        subtitle="Macro rings with a personal match score against your goal"
      />

      {/* pill tabs */}
      <div className="mb-5 flex rounded-full border border-border bg-tile p-1">
        {(
          [
            { key: 'all', label: 'All Diets' },
            { key: 'mine', label: 'My Diets' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`press flex-1 cursor-pointer rounded-full py-2 text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-card text-accent shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Sparkles size={22} />}
            title="No diet plans yet"
            desc="Browse all diets and add the ones you like to your library."
            action={
              <Button size="sm" onClick={() => setTab('all')}>
                Explore Diets
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map(({ diet, match }) => (
            <DietRingCard
              key={diet.id}
              diet={diet}
              match={match}
              bestMatch={tab === 'all' && hasTargets && diet.id === bestId}
              inMyDiets={myDietIds.includes(diet.id)}
              hasTargets={hasTargets}
              onOpen={setOpen}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={open !== null} onClose={() => setOpen(null)} title={open?.name ?? ''} subtitle="Diet plan details" wide>
        {open && openPct && (
          <div className="space-y-4">
            {/* big ring */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-tile px-4 py-5">
              <MacroRing p={openPct.protein} c={openPct.carbs} f={openPct.fat} size={140} stroke={14}>
                <p className="text-2xl font-extrabold leading-none text-text">{fmtNum(open.kcal)}</p>
                <p className="mt-1 text-[10px] font-medium text-muted">kcal / day</p>
              </MacroRing>
              <MacroLegend p={openPct.protein} c={openPct.carbs} f={openPct.fat} />
              {hasTargets ? (
                <span className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                  <Target size={12} /> {openMatch}% match with your goal
                </span>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-1.5 rounded-full bg-tile px-3 py-1 text-xs font-semibold text-muted ring-1 ring-border transition-colors hover:text-accent"
                >
                  <Target size={12} /> Set daily targets in Profile to see your match
                </Link>
              )}
            </div>

            {/* grams line */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-protein/10 px-2 py-2.5 ring-1 ring-protein/25">
                <p className="text-sm font-extrabold text-text">{open.protein}g</p>
                <p className="text-[10px] font-semibold text-protein">Protein</p>
              </div>
              <div className="rounded-xl bg-carbs/10 px-2 py-2.5 ring-1 ring-carbs/25">
                <p className="text-sm font-extrabold text-text">{open.carbs}g</p>
                <p className="text-[10px] font-semibold text-carbs">Carbs</p>
              </div>
              <div className="rounded-xl bg-fat/15 px-2 py-2.5 ring-1 ring-fat/40">
                <p className="text-sm font-extrabold text-text">{open.fat}g</p>
                <p className="text-[10px] font-semibold text-fat-ink">Fat</p>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-muted">{open.description}</p>

            {/* goal */}
            <div className="flex items-center justify-between rounded-xl bg-tile px-3.5 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-text">
                <Sparkles size={15} className="text-accent" /> Goal
              </span>
              <span className="text-sm text-muted">{open.goal}</span>
            </div>

            {/* How to follow */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-text">
                <ChefHat size={15} className="text-accent" /> How to prepare & follow
              </h4>
              <ul className="space-y-1.5">
                {open.prep.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl bg-tile px-3 py-2 text-[13px] leading-snug text-muted">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample day dishes */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-text">
                <UtensilsCrossed size={15} className="text-accent" /> Sample day — dishes & macros
              </h4>
              <div className="space-y-2">
                {open.meals.map((m) => (
                  <div key={m.meal} className="rounded-xl border border-border px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{m.meal}</p>
                        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-text">{m.dish}</p>
                      </div>
                      <span className="shrink-0 text-sm font-extrabold tabular-nums text-text">{m.kcal}<span className="text-[10px] font-medium text-muted"> kcal</span></span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                      <span className="rounded-md bg-protein/10 px-1.5 py-0.5 text-protein">P {m.protein}g</span>
                      <span className="rounded-md bg-carbs/10 px-1.5 py-0.5 text-carbs">C {m.carbs}g</span>
                      <span className="rounded-md bg-fat/15 px-1.5 py-0.5 text-fat-ink">F {m.fat}g</span>
                    </div>
                  </div>
                ))}
                {openTotals && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-tile px-3 py-2.5 text-[11px] font-bold">
                    <span className="text-text">Day total</span>
                    <span className="flex flex-wrap items-center gap-2 tabular-nums">
                      <span className="text-text">{openTotals.kcal} kcal</span>
                      <span className="text-protein">P {openTotals.protein}g</span>
                      <span className="text-carbs">C {openTotals.carbs}g</span>
                      <span className="text-fat-ink">F {openTotals.fat}g</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" onClick={() => toggleDiet(open.id)}>
              {myDietIds.includes(open.id) ? (
                <>
                  <Check size={16} /> In My Diets — tap to remove
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to My Diet
                </>
              )}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
