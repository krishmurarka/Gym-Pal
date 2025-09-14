import { Exercise, MuscleGroup, Equipment } from './types';

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex1', name: 'Bench Press', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell },
  { id: 'ex2', name: 'Incline Dumbbell Press', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Dumbbell },
  { id: 'ex3', name: 'Dumbbell Flyes', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Dumbbell },
  { id: 'ex4', name: 'Push-ups', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Bodyweight },
  { id: 'ex_chest_5', name: 'Incline Bench Press', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell },
  { id: 'ex_chest_6', name: 'Decline Bench Press', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell },
  { id: 'ex_chest_7', name: 'Chest Press Machine', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Machine },
  { id: 'ex_chest_8', name: 'Pec Deck Machine', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Machine },
  { id: 'ex_chest_9', name: 'Cable Crossover', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Other },
  { id: 'ex_chest_10', name: 'Dips', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Bodyweight },
  { id: 'ex_chest_11', name: 'Kettlebell Floor Press', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Kettlebell },
  
  // Back
  { id: 'ex5', name: 'Pull-ups', muscleGroup: MuscleGroup.Back, equipment: Equipment.Bodyweight },
  { id: 'ex6', name: 'Deadlift', muscleGroup: MuscleGroup.Back, equipment: Equipment.Barbell },
  { id: 'ex7', name: 'Bent Over Row', muscleGroup: MuscleGroup.Back, equipment: Equipment.Barbell },
  { id: 'ex8', name: 'Lat Pulldown', muscleGroup: MuscleGroup.Back, equipment: Equipment.Machine },
  { id: 'ex_back_5', name: 'Dumbbell Row', muscleGroup: MuscleGroup.Back, equipment: Equipment.Dumbbell },
  { id: 'ex_back_6', name: 'T-Bar Row', muscleGroup: MuscleGroup.Back, equipment: Equipment.Barbell },
  { id: 'ex_back_7', name: 'Seated Cable Row', muscleGroup: MuscleGroup.Back, equipment: Equipment.Machine },
  { id: 'ex_back_8', name: 'Chin-ups', muscleGroup: MuscleGroup.Back, equipment: Equipment.Bodyweight },
  { id: 'ex_back_9', name: 'Kettlebell Swings', muscleGroup: MuscleGroup.Back, equipment: Equipment.Kettlebell },
  { id: 'ex_back_10', name: 'Back Extension', muscleGroup: MuscleGroup.Back, equipment: Equipment.Machine },

  // Legs
  { id: 'ex9', name: 'Squat', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Barbell },
  { id: 'ex10', name: 'Leg Press', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Machine },
  { id: 'ex11', name: 'Lunges', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Dumbbell },
  { id: 'ex12', name: 'Leg Curls', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Machine },
  { id: 'ex13', name: 'Leg Extensions', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Machine },
  { id: 'ex_legs_6', name: 'Romanian Deadlift', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Barbell },
  { id: 'ex_legs_7', name: 'Goblet Squat', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Kettlebell },
  { id: 'ex_legs_8', name: 'Bulgarian Split Squat', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Dumbbell },
  { id: 'ex_legs_9', name: 'Bodyweight Squat', muscleGroup: MuscleGroup.Legs, equipment: Equipment.Bodyweight },
  
  // Glutes
  { id: 'ex_glutes_1', name: 'Hip Thrust', muscleGroup: MuscleGroup.Glutes, equipment: Equipment.Barbell },
  { id: 'ex_glutes_2', name: 'Glute Bridge', muscleGroup: MuscleGroup.Glutes, equipment: Equipment.Bodyweight },
  { id: 'ex_glutes_3', name: 'Cable Kickback', muscleGroup: MuscleGroup.Glutes, equipment: Equipment.Other },

  // Calves
  { id: 'ex_calves_1', name: 'Calf Raises', muscleGroup: MuscleGroup.Calves, equipment: Equipment.Bodyweight },
  { id: 'ex_calves_2', name: 'Seated Calf Raise', muscleGroup: MuscleGroup.Calves, equipment: Equipment.Machine },
  { id: 'ex_calves_3', name: 'Standing Calf Raise', muscleGroup: MuscleGroup.Calves, equipment: Equipment.Machine },

  // Shoulders
  { id: 'ex14', name: 'Overhead Press', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Barbell },
  { id: 'ex15', name: 'Lateral Raises', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Dumbbell },
  { id: 'ex16', name: 'Face Pulls', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Other },
  { id: 'ex_shoulders_4', name: 'Arnold Press', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Dumbbell },
  { id: 'ex_shoulders_5', name: 'Shoulder Press Machine', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Machine },
  { id: 'ex_shoulders_6', name: 'Upright Row', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Barbell },
  { id: 'ex_shoulders_7', name: 'Kettlebell Press', muscleGroup: MuscleGroup.Shoulders, equipment: Equipment.Kettlebell },
  
  // Biceps
  { id: 'ex17', name: 'Bicep Curls', muscleGroup: MuscleGroup.Biceps, equipment: Equipment.Dumbbell },
  { id: 'ex18', name: 'Hammer Curls', muscleGroup: MuscleGroup.Biceps, equipment: Equipment.Dumbbell },
  { id: 'ex_biceps_3', name: 'Barbell Curl', muscleGroup: MuscleGroup.Biceps, equipment: Equipment.Barbell },
  { id: 'ex_biceps_4', name: 'Preacher Curl', muscleGroup: MuscleGroup.Biceps, equipment: Equipment.Machine },
  { id: 'ex_biceps_5', name: 'Cable Curl', muscleGroup: MuscleGroup.Biceps, equipment: Equipment.Other },
  
  // Triceps
  { id: 'ex19', name: 'Tricep Dips', muscleGroup: MuscleGroup.Triceps, equipment: Equipment.Bodyweight },
  { id: 'ex20', name: 'Tricep Pushdowns', muscleGroup: MuscleGroup.Triceps, equipment: Equipment.Other },
  { id: 'ex_triceps_3', name: 'Skull Crushers', muscleGroup: MuscleGroup.Triceps, equipment: Equipment.Barbell },
  { id: 'ex_triceps_4', name: 'Overhead Tricep Extension', muscleGroup: MuscleGroup.Triceps, equipment: Equipment.Dumbbell },
  { id: 'ex_triceps_5', name: 'Close Grip Bench Press', muscleGroup: MuscleGroup.Triceps, equipment: Equipment.Barbell },
  
  // Abs
  { id: 'ex21', name: 'Crunches', muscleGroup: MuscleGroup.Abs, equipment: Equipment.Bodyweight },
  { id: 'ex22', name: 'Plank', muscleGroup: MuscleGroup.Abs, equipment: Equipment.Bodyweight },
  { id: 'ex23', name: 'Leg Raises', muscleGroup: MuscleGroup.Abs, equipment: Equipment.Bodyweight },
  { id: 'ex_abs_4', name: 'Russian Twist', muscleGroup: MuscleGroup.Abs, equipment: Equipment.Kettlebell },
  { id: 'ex_abs_5', name: 'Cable Crunches', muscleGroup: MuscleGroup.Abs, equipment: Equipment.Machine },

  // Forearms
  { id: 'ex_forearms_1', name: 'Wrist Curls', muscleGroup: MuscleGroup.Forearms, equipment: Equipment.Dumbbell },
  { id: 'ex_forearms_2', name: 'Reverse Wrist Curls', muscleGroup: MuscleGroup.Forearms, equipment: Equipment.Dumbbell },
  { id: 'ex_forearms_3', name: 'Farmer\'s Walk', muscleGroup: MuscleGroup.Forearms, equipment: Equipment.Kettlebell },
];

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: '#0A84FF',
  [MuscleGroup.Back]: '#BF5AF2',
  [MuscleGroup.Legs]: '#30D158',
  [MuscleGroup.Shoulders]: '#FF9500',
  [MuscleGroup.Biceps]: '#FFCC00',
  [MuscleGroup.Triceps]: '#5AC8FA',
  [MuscleGroup.Abs]: '#FF3B30',
  [MuscleGroup.Forearms]: '#A2845E',
  [MuscleGroup.Calves]: '#F4A460',
  [MuscleGroup.Glutes]: '#FF2D55',
};