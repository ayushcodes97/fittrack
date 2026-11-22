export type WorkoutProgram = {
  id: string
  name: string
  description: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  daysPerWeek: number
  exercises: string[]
}

export const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'ppl',
    name: 'PPL (Push/Pull/Legs)',
    description: '6-day split focusing on push, pull, and legs days',
    level: 'Intermediate',
    daysPerWeek: 6,
    exercises: ['bench-press', 'incline-press', 'cable-fly', 'overhead-press', 'lateral-raise', 'tricep-pushdown', 'pull-ups', 'bent-over-row', 'lat-pulldown', 'biceps-curl', 'hammer-curl', 'squat', 'leg-press', 'lunges', 'leg-curl'],
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    description: '4-day split alternating upper and lower body days',
    level: 'Intermediate',
    daysPerWeek: 4,
    exercises: ['bench-press', 'dumbbell-press', 'bent-over-row', 'lat-pulldown', 'overhead-press', 'lateral-raise', 'biceps-curl', 'tricep-pushdown', 'squat', 'leg-press', 'deadlift', 'calf-raise'],
  },
  {
    id: 'bro-split',
    name: 'Bro Split',
    description: '5-day split hitting one muscle group per day',
    level: 'Advanced',
    daysPerWeek: 5,
    exercises: ['bench-press', 'incline-press', 'cable-fly', 'pull-ups', 'bent-over-row', 'lat-pulldown', 'squat', 'lunges', 'leg-press', 'overhead-press', 'lateral-raise', 'biceps-curl', 'tricep-pushdown', 'deadlift', 'calf-raise'],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: '3-day full body workout for beginners',
    level: 'Beginner',
    daysPerWeek: 3,
    exercises: ['bench-press', 'pull-ups', 'squat', 'overhead-press', 'biceps-curl', 'tricep-pushdown', 'plank'],
  },
  {
    id: 'beginner',
    name: 'Beginner Program',
    description: 'Simple 3-day program for those new to lifting',
    level: 'Beginner',
    daysPerWeek: 3,
    exercises: ['push-ups', 'dumbbell-press', 'seated-row', 'leg-press', 'dumbbell-lunges', 'leg-curl', 'plank', 'crunches'],
  },
]

export function programById(id: string): WorkoutProgram | undefined {
  return WORKOUT_PROGRAMS.find((p) => p.id === id)
}