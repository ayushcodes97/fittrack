import { useEffect, useState } from 'react'
import { useApp } from '../store/AppContext'
import { todayISO } from '../utils/date'
import { tapSoft } from '../utils/haptics'
import { Button, Card, Input, StatCard } from '../components/ui'

type Measurement = {
  id: string
  date: string
  chest: number
  waist: number
  hips: number
  biceps: number
  thighs: number
}

export default function BodyMeasurements() {
  const { weights, addWeight, profile } = useApp()
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [form, setForm] = useState({
    chest: '', waist: '', hips: '', biceps: '', thighs: '',
  })

  const today = todayISO()
  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null

  const save = () => {
    tapSoft()
    const m: Measurement = {
      id: crypto.randomUUID(),
      date: today,
      chest: Number(form.chest) || 0,
      waist: Number(form.waist) || 0,
      hips: Number(form.hips) || 0,
      biceps: Number(form.biceps) || 0,
      thighs: Number(form.thighs) || 0,
    }
    setMeasurements([...measurements, m])
    setForm({ chest: '', waist: '', hips: '', biceps: '', thighs: '' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Body Measurements</h1>
        <p className="text-sm text-muted">Track your body transformation over time</p>
      </div>

      <Card className="p-5">
        <h2 className="font-bold text-text mb-4">Log Today's Measurements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Chest', key: 'chest', unit: 'cm' },
            { label: 'Waist', key: 'waist', unit: 'cm' },
            { label: 'Hips', key: 'hips', unit: 'cm' },
            { label: 'Biceps', key: 'biceps', unit: 'cm' },
            { label: 'Thighs', key: 'thighs', unit: 'cm' },
          ].map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">{field.label}</label>
              <input
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.unit}
                className="px-3 py-2 rounded-xl border border-border bg-tile text-sm focus:ring-2 focus:ring-accent/50 outline-none"
              />
            </div>
          ))}
          <button
            onClick={save}
            disabled={!form.chest && !form.waist}
            className="col-span-2 sm:col-span-1 py-2 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
          >
            Save
          </button>
        </div>
      </Card>

      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Chest', value: latest.chest, unit: 'cm' },
            { label: 'Waist', value: latest.waist, unit: 'cm' },
            { label: 'Hips', value: latest.hips, unit: 'cm' },
            { label: 'Biceps', value: latest.biceps, unit: 'cm' },
            { label: 'Thighs', value: latest.thighs, unit: 'cm' },
          ].map((m) => (
            <StatCard
              key={m.label}
              icon={null}
              label={m.label}
              value={m.value > 0 ? `${m.value}${m.unit}` : '—'}
              sub={`Logged ${latest.date}`}
            />
          ))}
        </div>
      )}

      <div className="h-64 flex items-center justify-center text-muted">
        {measurements.length === 0 ? 'No measurements logged yet.' : 'Measurement history coming soon.'}
      </div>
    </div>
  )
}