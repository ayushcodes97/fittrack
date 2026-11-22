import { useState } from 'react'
import { Plus, Search, Edit3, Trash2, Clock, Utensils, Calendar, Flame } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { tapSoft } from '../utils/haptics'
import { Button, Card, Input, EmptyState } from '../components/ui'

type MealPlanEntry = {
  id: string
  day: string
  mealType: string
  recipeName: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function MealPlanner() {
  const [plans, setPlans] = useState<MealPlanEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newPlan, setNewPlan] = useState({
    day: '',
    mealType: '',
    recipeName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

  const addPlan = () => {
    tapSoft()
    const plan: MealPlanEntry = {
      id: crypto.randomUUID(),
      ...newPlan,
    }
    setPlans([plan, ...plans])
    setShowForm(false)
    setNewPlan({ day: '', mealType: '', recipeName: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const deletePlan = (id: string) => {
    tapSoft()
    setPlans(plans.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Meal Planner</h1>
          <p className="text-sm text-muted">Plan your meals for the week</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
        >
          <Plus size={18} /> Add Meal
        </button>
      </div>

      {showForm && (
        <Card className="p-5">
          <h2 className="font-bold text-text mb-4">Add Meal to Plan</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Day</label>
              <select
                value={newPlan.day}
                onChange={(e) => setNewPlan({ ...newPlan, day: e.target.value })}
                className="px-3 py-2 rounded-xl border border-border bg-tile text-sm focus:ring-2 focus:ring-accent/50 outline-none"
              >
                <option value="">Select day</option>
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Meal Type</label>
              <select
                value={newPlan.mealType}
                onChange={(e) => setNewPlan({ ...newPlan, mealType: e.target.value })}
                className="px-3 py-2 rounded-xl border border-border bg-tile text-sm focus:ring-2 focus:ring-accent/50 outline-none"
              >
                <option value="">Select meal</option>
                {mealTypes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <Input
              label="Recipe / Food Name"
              value={newPlan.recipeName}
              onChange={(e) => setNewPlan({ ...newPlan, recipeName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Calories"
                type="number"
                value={newPlan.calories}
                onChange={(e) => setNewPlan({ ...newPlan, calories: Number(e.target.value) || 0 })}
              />
              <Input
                label="Protein (g)"
                type="number"
                value={newPlan.protein}
                onChange={(e) => setNewPlan({ ...newPlan, protein: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Carbs (g)"
                type="number"
                value={newPlan.carbs}
                onChange={(e) => setNewPlan({ ...newPlan, carbs: Number(e.target.value) || 0 })}
              />
              <Input
                label="Fat (g)"
                type="number"
                value={newPlan.fat}
                onChange={(e) => setNewPlan({ ...newPlan, fat: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={addPlan}
              className="flex-1 py-3 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
            >
              Add to Plan
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl border border-border bg-tile text-text font-medium press hover:bg-tile/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {plans.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} className="mx-auto mb-4 text-muted" />}
            title="No meal plans yet"
            desc="Plan your meals for the week by adding meals above"
            action={
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
              >
                Add Meal
              </button>
            }
          />
        ) : (
          days.map((day) => {
            const dayPlans = plans.filter((p) => p.day === day)
            if (dayPlans.length === 0) return null
            const dayCalories = dayPlans.reduce((sum, p) => sum + p.calories, 0)
            return (
              <Card key={day} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-text">{day}</h3>
                  <span className="text-xs font-medium text-accent">
                    {dayCalories} kcal total
                  </span>
                </div>
                <div className="space-y-2">
                  {dayPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-tile p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-text">{plan.mealType}</p>
                        <p className="text-sm text-muted">{plan.recipeName}</p>
                        <p className="text-xs text-muted mt-1">
                          {plan.protein}P / {plan.carbs}C / {plan.fat}F
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text">{plan.calories} kcal</span>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="ml-2 p-1.5 rounded-lg border border-border bg-transparent text-muted press hover:text-danger hover:border-danger/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        )}
      </div>
    </div>
  )
}