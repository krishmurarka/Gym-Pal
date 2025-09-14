
import { Exercise, MuscleGroup } from './types';

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex1', name: 'Bench Press', muscleGroup: MuscleGroup.Chest },
  { id: 'ex2', name: 'Incline Dumbbell Press', muscleGroup: MuscleGroup.Chest },
  { id: 'ex3', name: 'Dumbbell Flyes', muscleGroup: MuscleGroup.Chest },
  { id: 'ex4', name: 'Push-ups', muscleGroup: MuscleGroup.Chest },
  
  // Back
  { id: 'ex5', name: 'Pull-ups', muscleGroup: MuscleGroup.Back },
  { id: 'ex6', name: 'Deadlift', muscleGroup: MuscleGroup.Back },
  { id: 'ex7', name: 'Bent Over Row', muscleGroup: MuscleGroup.Back },
  { id: 'ex8', name: 'Lat Pulldown', muscleGroup: MuscleGroup.Back },
  
  // Legs
  { id: 'ex9', name: 'Squat', muscleGroup: MuscleGroup.Legs },
  { id: 'ex10', name: 'Leg Press', muscleGroup: MuscleGroup.Legs },
  { id: 'ex11', name: 'Lunges', muscleGroup: MuscleGroup.Legs },
  { id: 'ex12', name: 'Leg Curls', muscleGroup: MuscleGroup.Legs },
  { id: 'ex13', name: 'Leg Extensions', muscleGroup: MuscleGroup.Legs },

  // Shoulders
  { id: 'ex14', name: 'Overhead Press', muscleGroup: MuscleGroup.Shoulders },
  { id: 'ex15', name: 'Lateral Raises', muscleGroup: MuscleGroup.Shoulders },
  { id: 'ex16', name: 'Face Pulls', muscleGroup: MuscleGroup.Shoulders },
  
  // Biceps
  { id: 'ex17', name: 'Bicep Curls', muscleGroup: MuscleGroup.Biceps },
  { id: 'ex18', name: 'Hammer Curls', muscleGroup: MuscleGroup.Biceps },
  
  // Triceps
  { id: 'ex19', name: 'Tricep Dips', muscleGroup: MuscleGroup.Triceps },
  { id: 'ex20', name: 'Tricep Pushdowns', muscleGroup: MuscleGroup.Triceps },
  
  // Abs
  { id: 'ex21', name: 'Crunches', muscleGroup: MuscleGroup.Abs },
  { id: 'ex22', name: 'Plank', muscleGroup: MuscleGroup.Abs },
  { id: 'ex23', name: 'Leg Raises', muscleGroup: MuscleGroup.Abs },
];

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: '#3498db',
  [MuscleGroup.Back]: '#e74c3c',
  [MuscleGroup.Legs]: '#2ecc71',
  [MuscleGroup.Shoulders]: '#9b59b6',
  [MuscleGroup.Biceps]: '#f1c40f',
  [MuscleGroup.Triceps]: '#1abc9c',
  [MuscleGroup.Abs]: '#e67e22',
  [MuscleGroup.Forearms]: '#34495e',
  [MuscleGroup.Calves]: '#95a5a6',
  [MuscleGroup.Glutes]: '#d35400',
};
