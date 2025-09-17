export enum MuscleGroup {
  Chest = 'Chest',
  Back = 'Back',
  Legs = 'Legs',
  Shoulders = 'Shoulders',
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Abs = 'Abs',
  Forearms = 'Forearms',
  Calves = 'Calves',
  Glutes = 'Glutes',
}

export enum Equipment {
  Barbell = 'Barbell',
  Dumbbell = 'Dumbbell',
  Machine = 'Machine',
  Kettlebell = 'Kettlebell',
  Bodyweight = 'Bodyweight',
  Other = 'Other',
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

export interface WorkoutSet {
  id:string;
  weight: number;
  reps: number;
  isCompleted?: boolean;
}

// Represents an exercise within a routine, with user-defined sets
export interface RoutineExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface RoutineVariant {
  id: string;
  name: string; // e.g., "A", "B", "Heavy Day"
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  variants: RoutineVariant[];
  nextVariantIndex: number;
}

export interface PerformedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  variantId: string;
  variantName: string;
  date: string; // ISO string
  exercises: PerformedExercise[];
  durationSeconds: number;
}

export enum Page {
    Dashboard = 'Dashboard',
    Routines = 'Routines',
    ActiveWorkout = 'ActiveWorkout',
    EditSession = 'EditSession',
}