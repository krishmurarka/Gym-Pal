import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Routine, PerformedExercise, WorkoutSession, WorkoutSet } from '../types';
import { useExercises } from '../hooks/useExercises';
import StopwatchIcon from './icons/StopwatchIcon';
import CheckIcon from './icons/CheckIcon';

interface ActiveWorkoutProps {
    routine: Routine;
    onFinish: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ routine, onFinish }) => {
    const [, setSessions] = useLocalStorage<WorkoutSession[]>('workoutSessions', []);
    const { findExerciseById } = useExercises();
    
    const [performedExercises, setPerformedExercises] = useState<PerformedExercise[]>(() => 
        routine.exercises.map(routineEx => {
            const exerciseDetails = findExerciseById(routineEx.exerciseId);
            return {
                exerciseId: routineEx.exerciseId,
                exerciseName: exerciseDetails?.name || 'Unknown Exercise',
                muscleGroup: exerciseDetails?.muscleGroup!,
                sets: routineEx.sets.map(s => ({ ...s, isCompleted: false })), // Deep copy with completion state
            };
        })
    );

    const [startTime] = useState(Date.now());
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const addSet = (exerciseIndex: number) => {
        setPerformedExercises(prev => {
            const newExercises = [...prev];
            const targetExercise = newExercises[exerciseIndex];
            const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
            targetExercise.sets.push({
                id: crypto.randomUUID(),
                weight: lastSet ? lastSet.weight : 0,
                reps: lastSet ? lastSet.reps : 0,
                isCompleted: false,
            });
            return newExercises;
        });
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', valueStr: string) => {
        setPerformedExercises(prev => {
            const newExercises = JSON.parse(JSON.stringify(prev)); // Deep copy
            const targetSet = newExercises[exerciseIndex].sets[setIndex];
            
            if (targetSet.isCompleted) return prev; // Don't update completed sets

            const value = field === 'weight' ? parseFloat(valueStr) : parseInt(valueStr, 10);
            
            if (field === 'reps') {
                targetSet[field] = Math.min(50, Math.max(1, isNaN(value) ? 1 : value));
            } else {
                targetSet[field] = Math.min(1000, Math.max(0, isNaN(value) ? 0 : value));
            }
            
            return newExercises;
        });
    };
    
    const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
         setPerformedExercises(prev => {
            const newExercises = [...prev];
            const targetSet = newExercises[exerciseIndex].sets[setIndex];
            targetSet.isCompleted = !targetSet.isCompleted;
            return newExercises;
        });
    };

    const handleFinishWorkout = useCallback(() => {
        const completedExercises = performedExercises
            .map(ex => ({
                ...ex,
                sets: ex.sets.filter(set => set.isCompleted), // Keep only completed sets
            }))
            .filter(ex => ex.sets.length > 0); // Keep only exercises with at least one completed set

        if (completedExercises.length > 0) {
            const finalWorkout: WorkoutSession = {
                id: crypto.randomUUID(),
                routineId: routine.id,
                routineName: routine.name,
                date: new Date().toISOString(),
                exercises: completedExercises,
                durationSeconds: duration
            };
            
            setSessions(prevSessions => {
                const now = new Date();
                const oneYearAgo = new Date(new Date().setFullYear(now.getFullYear() - 1));
                
                const recentSessions = prevSessions.filter(session => new Date(session.date) >= oneYearAgo);

                return [...recentSessions, finalWorkout];
            });
        }
        onFinish();
    }, [routine.id, routine.name, performedExercises, duration, setSessions, onFinish]);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4">
                 <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{routine.name}</h1>
                    <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full text-lg">
                        <StopwatchIcon className="w-5 h-5" />
                        <span>{formatDuration(duration)}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 space-y-4">
                {performedExercises.map((pEx, exIndex) => (
                    <div key={pEx.exerciseId} className="bg-surface p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-3">{pEx.exerciseName}</h3>
                        <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-x-3 text-center text-text-secondary text-sm mb-2">
                            <span>Set</span>
                            <span>Weight (kg)</span>
                            <span>Reps</span>
                            <span>Done</span>
                        </div>
                        {pEx.sets.map((set, setIndex) => (
                            <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-x-3 items-center mb-2">
                                <span className="text-center font-bold text-text-secondary">{setIndex + 1}</span>
                                <input 
                                    type="number" 
                                    step="0.5"
                                    min="0"
                                    max="1000"
                                    value={set.weight}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                                    onFocus={handleFocus}
                                    disabled={set.isCompleted}
                                    className={`bg-background text-center rounded p-2 w-full min-w-0 transition-colors ${set.isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                                />
                                <input 
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={set.reps}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                    onFocus={handleFocus}
                                    disabled={set.isCompleted}
                                    className={`bg-background text-center rounded p-2 w-full min-w-0 transition-colors ${set.isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                                />
                                <button 
                                    onClick={() => toggleSetCompletion(exIndex, setIndex)} 
                                    aria-label={`Mark set ${setIndex + 1} as ${set.isCompleted ? 'incomplete' : 'complete'}`}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 mx-auto focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                                        set.isCompleted ? 'bg-tertiary' : 'border-2 border-gray-600 hover:bg-gray-700'
                                    }`}
                                >
                                    {set.isCompleted && <CheckIcon className="w-5 h-5 text-background" />}
                                </button>
                            </div>
                        ))}
                        <button onClick={() => addSet(exIndex)} className="w-full bg-primary/20 text-primary p-2 rounded-lg mt-3 font-semibold hover:bg-primary/30 transition-colors">Add Set</button>
                    </div>
                ))}
            </main>
            <footer className="p-4 bg-background/80 backdrop-blur-sm border-t border-surface mt-auto">
                <button onClick={handleFinishWorkout} className="w-full bg-tertiary p-3 rounded-lg font-bold text-lg hover:bg-tertiary/90 transition-colors">
                    Finish Workout
                </button>
            </footer>
        </div>
    );
};

export default ActiveWorkout;