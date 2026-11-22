import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Timer,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Dumbbell,
  Flame,
  Target,
  Timer as TimerIcon,
  ChevronLeft,
  Edit3,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatTime } from '../utils/date'
import { tapSoft } from '../utils/haptics'
import { EXERCISES, exerciseById } from '../data/exercises'
import { formatDistanceTopNow } from 'date-fns'

type SetEntry = {
  id: string
  weight: number
  reps: number
  completed: boolean
  restTimer: number
}

type ExerciseInWorkout = {
  exerciseId: string
  name: string
  sets: SetEntry[]
  currentSetIndex: number
  isResting: boolean
  restTimeLeft: number
  completed: boolean
}

export default function Workout() {
  const { workoutId } = useParams()
  const { exercises: storedExercises, addWorkoutExercise, updateExercise, user } = useApp()
  const navigate = useNavigate()

  const [workoutExercises, setWorkoutExercises] = useState<ExerciseInWorkout[]>([])
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null)
  const [isRestTimerActive, setIsRestTimerActive] = useState(false)
  const [restSecondsLeft, setRestSecondsLeft] = useState(90)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)

  // Initialize from stored data or start fresh
  useEffect(() => {
    if (workoutExercises.length === 0 && storedExercises.length > 0) {
      // Load last workout's exercises as template
      const lastWorkout = storedExercises[storedExercises.length - 1]
      if (lastWorkout) {
        setWorkoutExercises([
          {
            exerciseId: lastWorkout.exerciseId,
            name: lastWorkout.name,
            sets: lastWorkout.sets.map((s: any) => ({
              id: s.id || Date.now().toString(),
              weight: s.weight || 0,
              reps: s.reps || 0,
              completed: false,
              restTimer: 90,
            })),
            currentSetIndex: 0,
            isResting: false,
            restTimeLeft: 90,
            completed: false,
          },
        ])
      }
    }
  }, [storedExercises, workoutExercises.length])

  // Rest timer
  useEffect(() => {
    if (!isRestTimerActive || restSecondsLeft <= 0) return
    const id = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRestTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRestTimerActive, restSecondsLeft])

  const activeExercise = activeExerciseIndex !== null ? workoutExercises[activeExerciseIndex] : null
  const currentSet = activeExercise?.sets[activeExercise?.currentSetIndex ?? 0]

  const addExercise = () => {
    tapSoft()
    setShowExerciseSelector(true)
  }

  const removeExercise = (index: number) => {
    tapSoft()
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== index))
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(null)
    }
  }

  const selectExercise = (exerciseId: string) => {
    tapSoft()
    const ex = exerciseById(exerciseId)
    if (!ex) return
    setWorkoutExercises((prev) => [
      ...prev,
      {
        exerciseId,
        name: ex.name,
        sets: [
          {
            id: '1',
            weight: 0,
            reps: 0,
            completed: false,
            restTimer: 90,
          },
        ],
        currentSetIndex: 0,
        isResting: false,
        restTimeLeft: 90,
        completed: false,
      },
    ])
    setShowExerciseSelector(false)
  }

  const updateSet = (field: 'weight' | 'reps', value: number) => {
    if (!activeExercise || !currentSet) return
    tapSoft()
    setWorkoutExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== activeExerciseIndex) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === currentSet.id ? { ...s, [field]: value } : s
          ),
        }
      })
    )
  }

  const increment = (field: 'weight' | 'reps') => {
    if (!currentSet) return
    const currentValue = field === 'weight' ? currentSet.weight : currentSet.reps
    updateSet(field, currentValue + (field === 'weight' ? 2.5 : 1))
  }

  const decrement = (field: 'weight' | 'reps') => {
    if (!currentSet) return
    const currentValue = field === 'weight' ? currentSet.weight : currentSet.reps
    const newValue = Math.max(0, currentValue - (field === 'weight' ? 2.5 : 1))
    updateSet(field, newValue)
  }

  const addSet = () => {
    if (!activeExercise) return
    tapSoft()
    const newSet: SetEntry = {
      id: Date.now().toString(),
      weight: currentSet?.weight || 0,
      reps: currentSet?.reps || 0,
      completed: false,
      restTimer: 90,
    }
    setWorkoutExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== activeExerciseIndex) return ex
        return {
          ...ex,
          sets: [...ex.sets, newSet],
          currentSetIndex: ex.sets.length,
        }
      })
    )
  }

  const completeSet = () => {
    if (!activeExercise || !currentSet) return
    tapSoft()
    
    // Mark current set as completed
    setWorkoutExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== activeExerciseIndex) return ex
        const sets = ex.sets.map((s) =>
          s.id === currentSet.id ? { ...s, completed: true } : s
        )
        const nextSetIndex = sets.findIndex((s) => !s.completed)
        
        if (nextSetIndex === -1) {
          // All sets completed
          return {
            ...ex,
            sets,
            completed: true,
            currentSetIndex: ex.sets.length - 1,
          }
        }
        
        // Start rest timer for next set
        return {
          ...ex,
          sets,
          currentSetIndex: nextSetIndex,
          isResting: true,
          restTimeLeft: 90,
        }
      })
    )
    
    setIsRestTimerActive(true)
    setRestSecondsLeft(90)
  }

  const startRestTimer = () => {
    setIsRestTimerActive(true)
    setRestSecondsLeft(90)
  }

  const finishWorkout = () => {
    tapSoft()
    navigate('/dashboard')
  }

  const totalSets = useMemo(() => {
    return workoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  }, [workoutExercises])

  const completedSets = useMemo(() => {
    return workoutExercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    )
  }, [workoutExercises])

  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  if (showExerciseSelector) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-6 max-w-md w-full border border-border">
          <h2 className="font-bold text-lg mb-4">Add Exercise</h2>
          <div className="space-y-2">
            {EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => selectExercise(ex.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-tile hover:bg-accent/10 hover:border-accent/50 press transition-colors"
              >
                <span className="text-sm font-medium text-text">{ex.name}</span>
                <span className="text-xs text-muted">{ex.muscleGroup}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowExerciseSelector(false)}
            className="w-full mt-4 py-3 rounded-xl border border-border bg-tile text-text font-medium press hover:bg-tile/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <nav className="glass-strong sticky top-0 z-40 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-accent font-medium press hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-colors"
          >
            <ChevronLeft size={18} /> Workouts
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={finishWorkout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-tile text-sm font-medium text-text press hover:bg-accent/10 transition-colors"
            >
              Finish
            </button>
            <button
              onClick={addExercise}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium press hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
            >
              <Plus size={18} /> Add Exercise
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
        {/* Progress header */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
          <div>
            <h1 className="text-xl font-bold text-text">{workoutExercises.length} Exercises</h1>
            <p className="text-sm text-muted">{completedSets}/{totalSets} sets completed</p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42"
                stroke="var(--color-border)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42"
                stroke="var(--color-accent)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(progress / 100) * 264}, 264`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text">{Math.round(progress)}%</span>
              <span className="text-xs text-muted">Complete</span>
            </div>
          </div>
        </div>

        {/* Rest timer overlay */}
        {isRestTimerActive && restSecondsLeft > 0 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-surface rounded-3xl p-8 text-center max-w-md w-full border border-border">
              <TimerIcon size={48} className="mx-auto mb-4 text-accent" />
              <h2 className="text-2xl font-bold text-text">Rest Time</h2>
              <div className="text-6xl font-bold text-accent mt-2">
                {formatTime(restSecondsLeft)}
              </div>
              <button
                onClick={() => {
                  setIsRestTimerActive(false)
                  setRestSecondsLeft(0)
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Exercises list */}
        <div className="space-y-4">
          {workoutExercises.length === 0 ? (
            <div className="text-center py-20">
              <Dumbbell size={64} className="mx-auto mb-4 text-muted" />
              <h3 className="font-bold text-text">No exercises yet</h3>
              <p className="text-muted">Tap "Add Exercise" to start your workout</p>
              <button
                onClick={addExercise}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
              >
                <Plus size={18} /> Add Exercise
              </button>
            </div>
          ) : (
            workoutExercises.map((ex, exIndex) => {
              const isActive = exIndex === activeExerciseIndex
              const incompleteSets = ex.sets.filter((s) => !s.completed)
              const nextSet = incompleteSets[0]
              const allCompleted = ex.sets.length > 0 && ex.sets.every((s) => s.completed)

              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl border border-border bg-surface p-5 transition-all duration-200 ${
                    isActive ? 'ring-2 ring-accent/50 bg-tile shadow-lg shadow-green-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent font-bold text-xs">
                        {exIndex + 1}
                      </span>
                      <h3 className="font-semibold text-text">{ex.name}</h3>
                    </div>
                    {allCompleted ? (
                      <CheckCircle2 size={20} className="text-accent" />
                    ) : (
                      <button
                        onClick={() => removeExercise(exIndex)}
                        className="text-muted hover:text-danger transition-colors"
                        title="Remove exercise"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {ex.sets.map((set, setIndex) => {
                      const isCurrentSet = isActive && setIndex === ex.currentSetIndex
                      return (
                        <div
                          key={set.id}
                          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition-colors ${
                            set.completed
                              ? 'border-accent bg-accent/10'
                              : isCurrentSet
                                ? 'border-accent/50 bg-accent/5'
                                : 'border-border bg-transparent hover:bg-tile'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium {set.completed ? 'text-accent' : 'text-text'}">
                              Set {setIndex + 1}
                            </span>
                            <span className="text-xs text-muted ml-auto">
                              {set.weight}kg × {set.reps} reps
                            </span>
                            {set.completed && (
                              <CheckCircle2 size={16} className="text-accent" />
                            )}
                          </div>
                          {!set.completed && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decrement('weight')}
                                className="w-8 h-8 rounded-lg border border-border bg-tile text-sm font-bold text-text press hover:bg-accent/10 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-12 text-center font-mono text-sm text-text">
                                {set.weight}
                              </span>
                              <button
                                onClick={() => increment('weight')}
                                className="w-8 h-8 rounded-lg border border-border bg-tile text-sm font-bold text-text press hover:bg-accent/10 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                              <span className="w-16 text-xs text-muted text-center">kg</span>
                              <button
                                onClick={() => decrement('reps')}
                                className="w-8 h-8 rounded-lg border border-border bg-tile text-sm font-bold text-text press hover:bg-accent/10 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-12 text-center font-mono text-sm text-text">
                                {set.reps}
                              </span>
                              <button
                                onClick={() => increment('reps')}
                                className="w-8 h-8 rounded-lg border border-border bg-tile text-sm font-bold text-text press hover:bg-accent/10 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                              <span className="w-16 text-xs text-muted text-center">reps</span>
                              <button
                                onClick={completeSet}
                                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold press hover:bg-green-700 transition-colors shadow-sm shadow-green-900/30"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {!allCompleted && nextSet && (
                      <button
                        onClick={addSet}
                        className="w-full py-2.5 rounded-xl border border-dashed border-border bg-transparent text-accent text-sm font-medium press hover:bg-accent/10 transition-colors"
                      >
                        <Plus size={14} className="mr-2" /> Add Set
                      </button>
                    )}
                  </div>

                  {isActive && !allCompleted && !nextSet && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3 text-sm">
                      <span className="text-muted">Exercise complete!</span>
                      <button
                        onClick={() => setActiveExerciseIndex((prev) => (prev === exIndex ? null : prev + 1 < workoutExercises.length ? prev + 1 : null))}
                        className="text-accent font-medium press hover:underline"
                      >
                        Next Exercise →
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {activeExercise !== null && activeExercise.completed === false && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-bold text-text mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startRestTimer}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-tile text-text font-medium press hover:bg-accent/10 transition-colors"
              >
                <TimerIcon size={16} className="mr-1" />
                Rest Timer (90s)
              </button>
              <button
                onClick={addSet}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
              >
                <Plus size={16} className="mr-1" />
                Add Set
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}