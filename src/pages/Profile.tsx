import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Bell, Check, Droplets, Flame, Palette, Ruler, Save, Sparkles, User, Watch, HeartPulse, Smartphone, TrendingDown, TrendingUp } from 'lucide-react'
import { Button, Card, PageHeader, Toggle } from '../components/ui'
import { useApp } from '../store/AppContext'
import type { Goal, Units } from '../types'
import { fmtNum } from '../utils/nutrition'
import { ensureNotificationPermission } from '../utils/notifications'
import { getGeminiKey, setGeminiKey } from '../utils/scanFood'
import { ACTIVITY_LEVELS, caloriePlan, type ActivityLevel } from '../utils/calories'
import { connectHealthDevice, deviceStepsAvailable } from '../utils/steps'
import { autoCalculateTargets } from '../utils/nutritionEngine'

const ACCENTS = [
  { name: 'Forest', value: '#17795c' },
  { name: 'Mint', value: '#2fa37a' },
  { name: 'Teal', value: '#2a9d8f' },
  { name: 'Sky', value: '#4a90c2' },
  { name: 'Indigo', value: '#5b6cc4' },
  { name: 'Plum', value: '#8a63c9' },
  { name: 'Clay', value: '#d97757' },
  { name: 'Amber', value: '#d99a3e' },
]

const inputCls =
  'h-11 w-full rounded-xl border border-border bg-tile px-3.5 text-sm text-text outline-none transition-colors focus:border-accent/60'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted'

export default function Profile() {
  const { profile, updateProfile } = useApp()
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(String(profile.age))
  const [height, setHeight] = useState(String(profile.heightCm))
  const [weight, setWeight] = useState(String(profile.weightKg))
  const [target, setTarget] = useState(String(profile.targetWeightKg))
  const [goal, setGoal] = useState<Goal>(profile.goal)
  const [calorieTarget, setCalorieTarget] = useState(String(profile.calorieTarget))
  const [proteinTarget, setProteinTarget] = useState(String(profile.proteinTarget))
  const [waterTarget, setWaterTarget] = useState(String(profile.waterTarget))

  /* ---- AI food scanner (Gemini key stored on this device) ---- */
  const [aiKey, setAiKey] = useState('')
  const [hasAiKey, setHasAiKey] = useState(() => getGeminiKey().length > 0)
  const [aiKeySaved, setAiKeySaved] = useState(false)

  /* ---- Notification permission state (web + native) ---- */
  const isNativeApp = Capacitor.isNativePlatform()
  const [notifBlocked, setNotifBlocked] = useState(false)

  /* ---- Calorie coach (maintenance / cutting / bulking) ---- */
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [applied, setApplied] = useState<'cutting' | 'maintenance' | 'bulking' | null>(null)
  // use live form values so the estimate updates while typing
  const plan = caloriePlan(
    {
      ...profile,
      age: Number(age) || 0,
      heightCm: Number(height) || 0,
      weightKg: Number(weight) || 0,
    },
    activityLevel,
  )

  /* ---- Devices ---- */
  const [deviceMsg, setDeviceMsg] = useState(false)
  const healthNative = deviceStepsAvailable()

  const bmi =
    profile.weightKg > 0 && profile.heightCm > 0
      ? profile.weightKg / Math.pow(profile.heightCm / 100, 2)
      : 0
  const bmiLabel =
    bmi <= 0 ? '—' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'

  const autoCalc = () => {
    const updatedProfile = {
      ...profile,
      age: Number(age) || 0,
      heightCm: Number(height) || 0,
      weightKg: Number(weight) || 0,
      goal,
    }
    const targets = autoCalculateTargets(updatedProfile)
    setCalorieTarget(String(targets.calorieTarget || 0))
    setProteinTarget(String(targets.proteinTarget || 0))
    setWaterTarget(String(targets.waterTarget || 0))
    tapSoft()
  }

  const saveInfo = () => {
    // Only clamp values the user actually typed — a blank field must stay
    // blank instead of being replaced by a made-up minimum.
    const numOr = (value: string, current: number, min: number, max: number) => {
      const n = Number(value)
      if (!Number.isFinite(n) || n <= 0) return current
      return Math.min(max, Math.max(min, n))
    }
    updateProfile({
      name: name.trim() || profile.name,
      age: numOr(age, profile.age, 10, 120),
      heightCm: numOr(height, profile.heightCm, 100, 250),
      weightKg: numOr(weight, profile.weightKg, 30, 350),
      targetWeightKg: numOr(target, profile.targetWeightKg, 30, 350),
      goal,
      calorieTarget: numOr(calorieTarget, profile.calorieTarget, 1000, 6000),
      proteinTarget: numOr(proteinTarget, profile.proteinTarget, 30, 400),
      waterTarget: numOr(waterTarget, profile.waterTarget, 1000, 8000),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const saveAiKey = () => {
    const key = aiKey.trim()
    if (!key) return
    setGeminiKey(key)
    setHasAiKey(true)
    setAiKey('')
    setAiKeySaved(true)
    setTimeout(() => setAiKeySaved(false), 1800)
  }

  const removeAiKey = () => {
    setGeminiKey('')
    setHasAiKey(false)
    setAiKey('')
  }

  const initials = profile.name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Personal details, goals and preferences" />

      {/* Identity card */}
      <Card className="mb-5 flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-dim text-xl font-extrabold text-accent">
          {initials || <User size={26} />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className={`text-xl font-extrabold ${profile.name.trim() ? 'text-text' : 'text-muted'}`}>
            {profile.name.trim() || 'Your profile'}
          </h2>
          <p className="text-sm text-muted">
            {[
              profile.age > 0 ? `${profile.age} yrs` : null,
              profile.heightCm > 0 ? `${fmtNum(profile.heightCm)} cm` : null,
              profile.weightKg > 0 ? `${fmtNum(profile.weightKg, 1)} kg` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Add your age, height and weight below'}
          </p>
        </div>
        <div className="flex basis-full gap-3 lg:basis-auto">
          <div className="rounded-2xl border border-border bg-tile px-4 py-3 text-center">
            <p className="text-lg font-extrabold text-text">{bmi > 0 ? fmtNum(bmi, 1) : '—'}</p>
            <p className="text-[11px] text-muted">BMI · {bmiLabel}</p>
          </div>
          <div className="rounded-2xl border border-border bg-tile px-4 py-3 text-center">
            <p className="text-lg font-extrabold capitalize text-accent">{profile.goal}</p>
            <p className="text-[11px] text-muted">Fitness goal</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Personal info */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <User size={17} className="text-accent" /> Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Age</label>
              <input className={inputCls} type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select
                className={`${inputCls} cursor-pointer`}
                value={profile.gender}
                onChange={(e) => updateProfile({ gender: e.target.value as typeof profile.gender })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input className={inputCls} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Current weight (kg)</label>
              <input className={inputCls} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Target weight (kg)</label>
              <input className={inputCls} type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Fitness goal</label>
              <select className={`${inputCls} cursor-pointer`} value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
                <option value="lose">Lose weight</option>
                <option value="maintain">Maintain weight</option>
                <option value="gain">Gain muscle</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Targets */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Flame size={17} className="text-accent" /> Daily Targets
          </h3>
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Flame size={12} className="text-accent" /> Calorie target (kcal)
                </span>
              </label>
              <input className={inputCls} type="number" value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-accent" /> Protein target (g)
                </span>
              </label>
              <input className={inputCls} type="number" value={proteinTarget} onChange={(e) => setProteinTarget(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Droplets size={12} className="text-[water]" /> Water target (ml)
                </span>
              </label>
              <input className={inputCls} type="number" value={waterTarget} onChange={(e) => setWaterTarget(e.target.value)} />
            </div>
          </div>
          <button
            onClick={autoCalc}
            className="w-full py-2.5 rounded-xl border border-dashed border-border bg-transparent text-accent text-sm font-medium press hover:bg-accent/10 transition-colors"
          >
            ↻ Auto-calculate from profile data
          </button>
        </Card>

        {/* Calorie coach + devices (full width) */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-text">
                <Flame size={17} className="text-accent" /> Calorie Coach
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Maintenance, cutting &amp; bulking calories from your body stats (Mifflin-St Jeor)
              </p>
            </div>
            {plan && (
              <span className="rounded-full bg-accent-dim px-3 py-1 text-[11px] font-bold text-accent">
                BMR {fmtNum(plan.bmr)} kcal
              </span>
            )}
          </div>

          {/* activity level */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Activity level</p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {ACTIVITY_LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => setActivityLevel(l.key)}
                title={l.desc}
                className={`press cursor-pointer rounded-xl border px-2 py-2.5 text-center text-xs font-semibold transition-all ${
                  activityLevel === l.key
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-border bg-tile text-muted hover:text-text'
                }`}
              >
                {l.label}
                <span className="mt-0.5 block text-[9px] font-medium opacity-70">{l.desc}</span>
              </button>
            ))}
          </div>

          {plan ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { key: 'cutting', label: 'Cutting', kcal: plan.cutting, protein: plan.protein.cutting, icon: TrendingDown, tone: 'text-carbs', bg: 'bg-carbs/10' },
                  { key: 'maintenance', label: 'Maintenance', kcal: plan.maintenance, protein: plan.protein.maintenance, icon: Flame, tone: 'text-accent', bg: 'bg-accent-dim' },
                  { key: 'bulking', label: 'Bulking', kcal: plan.bulking, protein: plan.protein.bulking, icon: TrendingUp, tone: 'text-protein', bg: 'bg-protein/10' },
                ] as const
              ).map((p) => {
                const Icon = p.icon
                const isApplied = applied === p.key
                return (
                  <div key={p.key} className="rounded-2xl border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-text">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${p.bg} ${p.tone}`}>
                          <Icon size={13} />
                        </span>
                        {p.label}
                      </span>
                    </div>
                    <p className="text-xl font-extrabold text-text">
                      {fmtNum(p.kcal)} <span className="text-[10px] font-medium text-muted">kcal/day</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Protein <span className="font-bold text-text">{p.protein} g</span>
                      <span className="opacity-70"> ({Math.round((p.protein / Math.max(1, Number(weight) || 1)) * 10) / 10} g/kg)</span>
                    </p>
                    <button
                      onClick={() => {
                        updateProfile({ calorieTarget: p.kcal, proteinTarget: p.protein })
                        setCalorieTarget(String(p.kcal))
                        setProteinTarget(String(p.protein))
                        setApplied(p.key)
                      }}
                      className={`press mt-3 w-full cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                        isApplied
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-tile text-muted hover:border-accent/50 hover:text-accent'
                      }`}
                    >
                      {isApplied ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check size={12} /> Applied as target
                        </span>
                      ) : (
                        'Use as my target'
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-tile px-3.5 py-3 text-xs text-muted">
              Add your age, height and current weight above to calculate your calories.
            </p>
          )}

          {/* Devices */}
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="flex items-center gap-2 font-bold text-text">
              <Watch size={17} className="text-accent" /> Devices &amp; Health Sync
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Smartwatch steps and workouts flow in through your phone&apos;s health app.
            </p>
            <div className="mt-3 space-y-2">
              {[
                { icon: HeartPulse, name: 'Google Fit / Health Connect', desc: 'Android — steps, workouts, heart rate', platform: 'Android' },
                { icon: Watch, name: 'Apple Health / Apple Watch', desc: 'iPhone & Watch — steps, workouts, rings', platform: 'iPhone' },
                { icon: Smartphone, name: 'This device (manual)', desc: 'Log steps and workouts by hand right now', platform: 'Active' },
              ].map((d) => {
                const Icon = d.icon
                const isManual = d.platform === 'Active'
                return (
                  <div key={d.name} className="flex flex-wrap items-center gap-3 rounded-xl bg-tile px-3.5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-accent">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text">{d.name}</p>
                      <p className="truncate text-xs text-muted">{d.desc}</p>
                    </div>
                    {isManual ? (
                      <span className="shrink-0 rounded-full bg-accent-dim px-2.5 py-1 text-[10px] font-bold text-accent">Active</span>
                    ) : (
                      <button
                        onClick={async () => {
                          if (!healthNative) {
                            setDeviceMsg(true)
                            return
                          }
                          await connectHealthDevice()
                          setDeviceMsg(true)
                        }}
                        className="shrink-0 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-text transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {deviceMsg && (
              <p className="mt-3 rounded-xl bg-accent-dim px-3.5 py-2.5 text-xs leading-relaxed text-accent">
                {healthNative
                  ? 'Health connection requested — smartwatch data will sync automatically once the phone health app allows it.'
                  : 'Available in the FITTRACK mobile app (APK). Once installed, the app connects to Health Connect / Apple Health, and your smartwatch steps, workouts and heart rate sync automatically.'}
              </p>
            )}
          </div>
        </Card>

        {/* Units & theme */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Ruler size={17} className="text-accent" /> Units
          </h3>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {(
              [
                { key: 'metric', label: 'Metric (kg, ml)' },
                { key: 'imperial', label: 'Imperial (lb, oz)' },
              ] as { key: Units; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateProfile({ units: key })}
                className={`press cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                  profile.units === key ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-tile text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Palette size={17} className="text-accent" /> Theme Accent
          </h3>
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                onClick={() => updateProfile({ accent: a.value })}
                aria-label={`Accent ${a.name}`}
                className={`press flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                  profile.accent === a.value ? 'scale-110 border-white/80' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: a.value }}
              >
                {profile.accent === a.value && <Check size={18} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Bell size={17} className="text-accent" /> Notifications
          </h3>
          <div className="space-y-4">
            {(
              [
                { key: 'meals', label: 'Meal reminders', desc: 'Nudges at breakfast, lunch and dinner' },
                { key: 'water', label: 'Water reminders', desc: 'Hourly hydration reminders' },
                { key: 'weekly', label: 'Weekly progress report', desc: 'Sunday evening summary' },
              ] as const
            ).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-tile px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <Toggle
                  checked={profile.notifications[key]}
                  onChange={(v) => {
                    // switch on only after the OS/browser actually allows reminders
                    if (v) {
                      void ensureNotificationPermission().then((granted) => {
                        setNotifBlocked(!granted)
                        if (granted) {
                          updateProfile({ notifications: { ...profile.notifications, [key]: true } })
                        }
                      })
                    } else {
                      updateProfile({ notifications: { ...profile.notifications, [key]: false } })
                    }
                  }}
                  label={label}
                />
              </div>
            ))}
            {notifBlocked && (
              <p className="rounded-xl bg-danger/5 px-3.5 py-2.5 text-xs leading-relaxed text-danger">
                {isNativeApp
                  ? "Notifications are turned off for FITTRACK. Allow them in your phone's app settings, then switch a reminder on again."
                  : 'Notifications are blocked by this browser. Allow them from the lock icon in the address bar, then switch a reminder on again.'}
              </p>
            )}
          </div>
        </Card>

        {/* AI food scanner */}
        <Card>
          <h3 className="flex items-center gap-2 font-bold text-text">
            <Sparkles size={17} className="text-accent" /> AI Food Scanner
          </h3>
          <p className="mb-4 mt-1 text-xs leading-relaxed text-muted">
            Powers photo scanning and &ldquo;look up any dish&rdquo; in Food Search. Get a free key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent underline decoration-accent/30 underline-offset-2"
            >
              Google AI Studio
            </a>
            . It is stored only on this device.
          </p>

          <div className="flex items-center gap-2.5 rounded-xl bg-tile px-4 py-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${hasAiKey ? 'bg-accent' : 'bg-muted/40'}`}
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 text-sm font-semibold text-text">
              {hasAiKey ? 'Key saved — AI features active' : 'No key added yet'}
            </p>
            {hasAiKey && (
              <button
                type="button"
                onClick={removeAiKey}
                className="press shrink-0 cursor-pointer text-xs font-semibold text-danger hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveAiKey()
              }}
              placeholder="Paste your Gemini API key"
              autoComplete="off"
              spellCheck={false}
              aria-label="Gemini API key"
              className={`${inputCls} flex-1`}
            />
            <Button onClick={saveAiKey} disabled={!aiKey.trim()} className="shrink-0">
              {aiKeySaved ? (
                <>
                  <Check size={15} /> Saved
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Save button */}
      <div className="mt-5 flex justify-end">
        <Button size="lg" onClick={saveInfo}>
          {saved ? (
            <>
              <Check size={17} /> Saved!
            </>
          ) : (
            <>
              <Save size={16} /> Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
