import type { Exercise } from '../types'

export const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', color: 'var(--color-chest)' },
  { id: 'back', label: 'Back', color: 'var(--color-back)' },
  { id: 'legs', label: 'Legs', color: 'var(--color-legs)' },
  { id: 'shoulders', label: 'Shoulders', color: 'var(--color-shoulders)' },
  { id: 'biceps', label: 'Biceps', color: 'var(--color-biceps)' },
  { id: 'triceps', label: 'Triceps', color: 'var(--color-triceps)' },
  { id: 'abs', label: 'Abs / Core', color: 'var(--color-abs)' },
  { id: 'glutes', label: 'Glutes', color: 'var(--color-glutes)' },
  { id: 'cardio', label: 'Cardio', color: 'var(--color-cardio)' },
]

export const EXERCISES: Exercise[] = [
  // Chest
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to mid-chest, press back up.',
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Bench Press',
    muscleGroup: 'chest',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Lie on a flat bench with dumbbells, press up until arms are extended, lower with control.',
  },
  {
    id: 'incline-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Set bench to 30-45 degree incline, press dumbbells up from upper chest position.',
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    muscleGroup: 'chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Plank position, lower chest to floor, push back up keeping body straight.',
  },
  {
    id: 'cable-fly',
    name: 'Cable Crossover Fly',
    muscleGroup: 'chest',
    equipment: 'Cable Machine',
    difficulty: 'Intermediate',
    instructions: 'Stand between cables, bring hands together in front of chest with slight elbow bend.',
  },

  // Back
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    muscleGroup: 'back',
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    instructions: 'Hang from bar, pull chin above bar, lower with control.',
  },
  {
    id: 'bent-over-row',
    name: 'Bent Over Barbell Row',
    muscleGroup: 'back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Hinge at hips, pull bar to lower chest, squeeze shoulder blades.',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Sit at lat pulldown machine, pull bar to upper chest, lean back slightly.',
  },
  {
    id: 'seated-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Sit with feet braced, pull handle to lower chest, keep back straight.',
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscleGroup: 'back',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Stand with feet hip-width, grip bar, lift by extending hips and knees, keep back flat.',
  },

  // Legs
  {
    id: 'squat',
    name: 'Back Squat',
    muscleGroup: 'legs',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Bar on upper back, squat down until thighs parallel, drive back up.',
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Sit in leg press machine, press platform away by extending legs.',
  },
  {
    id: 'lunges',
    name: 'Dumbbell Lunges',
    muscleGroup: 'legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Hold dumbbells, step forward, lower back knee toward floor, return to start.',
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Lie face down in machine, curl pad toward glutes by bending knees.',
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Stand on edge of step, raise heels as high as possible, lower with control.',
  },

  // Shoulders
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Stand with bar at front rack position, press overhead until arms locked.',
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Stand with dumbbells at sides, raise out to sides to shoulder height.',
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Bend forward at hips, raise dumbbells out to sides squeezing rear delts.',
  },
  {
    id: 'shrugs',
    name: 'Barbell Shrugs',
    muscleGroup: 'shoulders',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    instructions: 'Hold bar at sides, shrug shoulders straight up toward ears.',
  },

  // Biceps
  {
    id: 'biceps-curl',
    name: 'Barbell Biceps Curl',
    muscleGroup: 'biceps',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    instructions: 'Stand with bar at thighs, curl up keeping elbows tucked, lower with control.',
  },
  {
    id: 'hammer-curl',
    name: 'Dumbbell Hammer Curl',
    muscleGroup: 'biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Hold dumbbells with neutral grip, curl up toward shoulders.',
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'biceps',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Sit at preacher bench, curl bar upward with upper arms supported.',
  },

  // Triceps
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'triceps',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Stand at cable machine, push bar down until arms extended, keep elbows tucked.',
  },
  {
    id: 'overhead-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'triceps',
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    instructions: 'Hold dumbbell with both hands overhead, lower behind head, extend back up.',
  },
  {
    id: 'dips',
    name: 'Tricep Dips',
    muscleGroup: 'triceps',
    equipment: 'Parallel Bars',
    difficulty: 'Intermediate',
    instructions: 'Support on parallel bars, lower body by bending elbows, press back up.',
  },

  // Abs
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Hold forearm plank position, keep body in straight line, engage core.',
  },
  {
    id: 'crunches',
    name: 'Crunches',
    muscleGroup: 'abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Lie on back with knees bent, lift shoulders off floor, lower with control.',
  },
  {
    id: 'leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'abs',
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    instructions: 'Hang from bar, raise legs forward to 90 degrees, lower with control.',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side.',
  },

  // Glutes
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'glutes',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Sit on floor with upper back on bench, bar across hips, thrust upward.',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    muscleGroup: 'glutes',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Lie on back with knees bent, lift hips toward ceiling squeezing glutes.',
  },

  // Cardio
  {
    id: 'running',
    name: 'Running',
    muscleGroup: 'cardio',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: 'Run at steady pace, maintain good form and breathing.',
  },
  {
    id: 'cycling',
    name: 'Cycling',
    muscleGroup: 'cardio',
    equipment: 'Bike',
    difficulty: 'Beginner',
    instructions: 'Cycle at steady pace, maintain cadence and resistance.',
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    muscleGroup: 'cardio',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Jump feet out while raising arms overhead, return to start.',
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroup: 'cardio',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    instructions: 'Drop to squat, kick back to plank, push-up, jump feet back, jump up.',
  },
]

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}

export function exercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISES.filter((e) => e.muscleGroup === muscleGroup)
}