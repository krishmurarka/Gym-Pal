import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { Exercise } from '../types';
import { EXERCISES as PREDEFINED_EXERCISES } from '../constants';

export const useExercises = () => {
  const [customExercises, setCustomExercises] = useLocalStorage<Exercise[]>('customExercises', []);

  const allExercises = useMemo(() => 
    [...PREDEFINED_EXERCISES, ...customExercises].sort((a, b) => a.name.localeCompare(b.name)),
    [customExercises]
  );

  const findExerciseById = (id: string): Exercise | undefined => {
    return allExercises.find(ex => ex.id === id);
  };

  return { allExercises, customExercises, setCustomExercises, findExerciseById };
};
