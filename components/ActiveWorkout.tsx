import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Routine, PerformedExercise, WorkoutSession, Exercise, MuscleGroup, Equipment, RoutineExercise } from '../types';
import { useExercises } from '../hooks/useExercises';
import StopwatchIcon from './icons/StopwatchIcon';
import CheckIcon from './icons/CheckIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface ActiveWorkoutProps {
    routine: Routine;
    onFinish: () => void;
}

// A helper type for sets within the active workout component's state
type ActiveWorkoutSet = {
    id: string;
    weight: number;
    reps: number;
    isCompleted: boolean;
    lastPerformed?: string | null;
};

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ routine, onFinish }) => {
    const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>('workoutSessions', []);
    const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', []);
    const { allExercises, findExerciseById, setCustomExercises } = useExercises();
    
    const [performedExercises, setPerformedExercises] = useState<Array<Omit<PerformedExercise, 'sets'> & { sets: ActiveWorkoutSet[] }>>(() => {
        const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const findLastPerformance = (exerciseId: string): PerformedExercise | undefined => {
            for (const session of sortedSessions) {
                const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
                if (exercise) return exercise;
            }
            return undefined;
        };
        
        return routine.exercises.map(routineEx => {
            const exerciseDetails = findExerciseById(routineEx.exerciseId);
            const lastPerformance = findLastPerformance(routineEx.exerciseId);
            
            return {
                exerciseId: routineEx.exerciseId,
                exerciseName: exerciseDetails?.name || 'Unknown Exercise',
                muscleGroup: exerciseDetails?.muscleGroup!,
                sets: routineEx.sets.map((s, index) => {
                    const lastSetData = lastPerformance?.sets[index];
                    return {
                        id: s.id,
                        weight: lastSetData?.weight ?? s.weight,
                        reps: lastSetData?.reps ?? s.reps,
                        isCompleted: false,
                        lastPerformed: lastSetData ? `${lastSetData.weight}kg x ${lastSetData.reps}` : null,
                    };
                }),
            };
        });
    });

    const [startTime] = useState(Date.now());
    const [duration, setDuration] = useState(0);
    const [isConfirmingFinish, setIsConfirmingFinish] = useState(false);

    // State for exercise picker
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell });
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');

    // State for drag and drop
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
            const newExercises = JSON.parse(JSON.stringify(prev));
            const targetSet = newExercises[exerciseIndex].sets[setIndex];
            targetSet.isCompleted = !targetSet.isCompleted;
            return newExercises;
        });
    };

    const saveSessionAndFinish = useCallback(() => {
        const completedExercises = performedExercises
            .map(ex => ({
                ...ex,
                sets: ex.sets
                    .filter(set => set.isCompleted)
                    .map(({ id, weight, reps }) => ({ id, weight, reps, isCompleted: true })), // Strip extra props
            }))
            .filter(ex => ex.sets.length > 0);

        if (completedExercises.length > 0) {
            const finalWorkout: WorkoutSession = {
                id: crypto.randomUUID(),
                routineId: routine.id,
                routineName: routine.name,
                date: new Date().toISOString(),
                exercises: completedExercises,
                durationSeconds: duration
            };
            
            setSessions(prevSessions => [...prevSessions, finalWorkout]);
        }
        onFinish();
    }, [routine.id, routine.name, performedExercises, duration, setSessions, onFinish]);
    
    const updateRoutineAndFinish = () => {
        const updatedRoutineExercises: RoutineExercise[] = performedExercises.map(pEx => ({
            exerciseId: pEx.exerciseId,
            sets: pEx.sets.map(set => ({
                id: set.id,
                weight: set.weight,
                reps: set.reps,
            })),
        }));

        const updatedRoutine: Routine = { ...routine, exercises: updatedRoutineExercises };
        setRoutines(prevRoutines => prevRoutines.map(r => r.id === routine.id ? updatedRoutine : r));

        saveSessionAndFinish();
    };

    const handleAttemptFinish = () => {
        const originalExerciseIds = new Set(routine.exercises.map(ex => ex.exerciseId));
        const hasNewExercises = performedExercises.some(pEx => !originalExerciseIds.has(pEx.exerciseId));

        const hasSetCountChanges = performedExercises.some(pEx => {
            const originalEx = routine.exercises.find(rEx => rEx.exerciseId === pEx.exerciseId);
            if (!originalEx) return false;
            return originalEx.sets.length !== pEx.sets.length;
        });

        const originalExerciseOrder = routine.exercises.map(ex => ex.exerciseId);
        const currentExerciseOrder = performedExercises.map(ex => ex.exerciseId);
        const hasOrderChanged = JSON.stringify(originalExerciseOrder) !== JSON.stringify(currentExerciseOrder);

        if (hasNewExercises || hasSetCountChanges || hasOrderChanged) {
            setIsConfirmingFinish(true);
        } else {
            saveSessionAndFinish();
        }
    };

    const addExerciseToSession = (exercise: Exercise) => {
        if (performedExercises.some(e => e.exerciseId === exercise.id)) {
            setIsPickerOpen(false);
            return;
        }

        const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const findLastPerformance = (exerciseId: string): PerformedExercise | undefined => {
            for (const session of sortedSessions) {
                const ex = session.exercises.find(e => e.exerciseId === exerciseId);
                if (ex) return ex;
            }
            return undefined;
        };
        
        const lastPerformance = findLastPerformance(exercise.id);
        let newSets: ActiveWorkoutSet[];

        if (lastPerformance && lastPerformance.sets.length > 0) {
            newSets = lastPerformance.sets.map(s => ({
                id: crypto.randomUUID(),
                weight: s.weight,
                reps: s.reps,
                isCompleted: false,
                lastPerformed: `${s.weight}kg x ${s.reps}`,
            }));
        } else {
            newSets = [{ id: crypto.randomUUID(), reps: 10, weight: 20, isCompleted: false, lastPerformed: null }];
        }

        const newPerformedExercise = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: newSets,
        };
        setPerformedExercises(prev => [...prev, newPerformedExercise]);

        setIsPickerOpen(false);
        setExerciseSearch('');
        setEquipmentFilter('all');
    };
    
    const handleSaveCustomExercise = () => {
        if (newExercise.name.trim()) {
            const newEx: Exercise = {
                id: crypto.randomUUID(),
                name: newExercise.name.trim(),
                muscleGroup: newExercise.muscleGroup,
                equipment: newExercise.equipment,
            };
            setCustomExercises(prev => [...prev, newEx]);
            setIsCreatingExercise(false);
            setNewExercise({ name: '', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell });
        }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (dropIndex: number) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        setPerformedExercises(prev => {
            const newExercises = [...prev];
            const [draggedItem] = newExercises.splice(draggedIndex, 1);
            newExercises.splice(dropIndex, 0, draggedItem);
            return newExercises;
        });
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const filteredExercises = useMemo(() => {
        const lowerCaseSearch = exerciseSearch.toLowerCase();
        const currentExerciseIds = new Set(performedExercises.map(e => e.exerciseId));
        return allExercises.filter(ex => {
            if (currentExerciseIds.has(ex.id)) return false;
            const matchesSearch = ex.name.toLowerCase().includes(lowerCaseSearch) || 
                                  ex.muscleGroup.toLowerCase().includes(lowerCaseSearch);
            const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
            return matchesSearch && matchesEquipment;
        });
    }, [allExercises, exerciseSearch, equipmentFilter, performedExercises]);

    const groupedExercises = useMemo(() => {
        return filteredExercises.reduce((acc, ex) => {
            (acc[ex.muscleGroup] = acc[ex.muscleGroup] || []).push(ex);
            return acc;
        }, {} as Record<string, Exercise[]>);
    }, [filteredExercises]);


    return (
        <>
            {/* Scrollable content area */}
            <div className="pb-40"> {/* Padding at the bottom to make space for the fixed footer */}
                <header className="sticky top-0 z-10 p-4 bg-background/90 backdrop-blur-sm border-b border-surface">
                    <div className="flex justify-between items-center max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold truncate pr-2">{routine.name}</h1>
                        <div className="flex items-center flex-shrink-0 gap-2 bg-surface px-3 py-1 rounded-full text-lg">
                            <StopwatchIcon className="w-5 h-5" />
                            <span>{formatDuration(duration)}</span>
                        </div>
                    </div>
                </header>

                <main className="px-4 space-y-4 mt-4 max-w-3xl mx-auto">
                    {performedExercises.map((pEx, exIndex) => (
                        <div 
                            key={pEx.exerciseId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, exIndex)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => handleDragEnter(exIndex)}
                            onDragLeave={() => setDragOverIndex(null)}
                            onDrop={() => handleDrop(exIndex)}
                            onDragEnd={handleDragEnd}
                            className={`bg-surface p-4 rounded-lg shadow-md cursor-grab transition-all duration-200 
                                ${draggedIndex === exIndex ? 'opacity-50 shadow-2xl scale-105' : ''}
                                ${dragOverIndex === exIndex ? 'outline-2 outline-dashed outline-primary -outline-offset-2' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <DragHandleIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                <h3 className="text-lg font-bold">{pEx.exerciseName}</h3>
                            </div>
                            <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-x-3 text-center text-text-secondary text-sm mb-2">
                                <span>Set</span>
                                <span>Weight (kg)</span>
                                <span>Reps</span>
                                <span>Done</span>
                            </div>
                            {pEx.sets.map((set, setIndex) => (
                                <React.Fragment key={set.id}>
                                    <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-x-3 items-center mb-2">
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
                                    {set.lastPerformed && !set.isCompleted && (
                                        <div className="text-right text-xs text-text-secondary pr-12 -mt-1 mb-2">
                                            Last: {set.lastPerformed}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            <button onClick={() => addSet(exIndex)} className="w-full bg-primary/20 text-primary p-2 rounded-lg mt-3 font-semibold hover:bg-primary/30 transition-colors">Add Set</button>
                        </div>
                    ))}
                </main>
            </div>

            {/* Floating action footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-surface z-10">
                <div className="space-y-3 max-w-3xl mx-auto">
                    <button onClick={() => setIsPickerOpen(true)} className="w-full bg-secondary/20 text-secondary p-3 rounded-lg font-semibold hover:bg-secondary/30 transition-colors">
                        + Add Exercise
                    </button>
                    <button onClick={handleAttemptFinish} className="w-full bg-tertiary p-3 rounded-lg font-bold text-lg hover:bg-tertiary/90 transition-colors">
                        Finish Workout
                    </button>
                </div>
            </footer>

            {isConfirmingFinish && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-6 max-w-sm w-full text-center shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Update Routine?</h2>
                        <p className="text-text-secondary mb-6">
                            You've changed exercises or sets. Save these changes to your "{routine.name}" routine for next time?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={updateRoutineAndFinish}
                                className="w-full bg-primary p-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                Update Routine & Finish
                            </button>
                            <button
                                onClick={saveSessionAndFinish}
                                className="w-full bg-gray-600 p-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                            >
                                Finish without Updating
                            </button>
                            <button
                                onClick={() => setIsConfirmingFinish(false)}
                                className="w-full text-text-secondary p-2 mt-2 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(isPickerOpen || isCreatingExercise) && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col p-4 z-50">
                    {isCreatingExercise ? (
                        <div className="w-full max-w-md mx-auto mt-10">
                            <h3 className="text-xl font-bold mb-4">Create New Exercise</h3>
                            <input type="text" placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} className="w-full bg-surface p-3 rounded-lg mb-4"/>
                            <select value={newExercise.muscleGroup} onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value as MuscleGroup})} className="w-full bg-surface p-3 rounded-lg mb-4">
                                {Object.values(MuscleGroup).map(group => <option key={group} value={group}>{group}</option>)}
                            </select>
                            <select value={newExercise.equipment} onChange={e => setNewExercise({...newExercise, equipment: e.target.value as Equipment})} className="w-full bg-surface p-3 rounded-lg mb-6">
                                {Object.values(Equipment).map(eq => <option key={eq} value={eq}>{eq}</option>)}
                            </select>
                            <div className="flex gap-4">
                                <button onClick={() => setIsCreatingExercise(false)} className="w-full bg-gray-600 p-3 rounded-lg">Back to Picker</button>
                                <button onClick={handleSaveCustomExercise} className="w-full bg-primary p-3 rounded-lg">Save Exercise</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div className="flex-none">
                            <h3 className="text-xl font-bold text-center">Select an Exercise</h3>
                            <input 
                                type="text"
                                placeholder="Search exercises..."
                                value={exerciseSearch}
                                onChange={(e) => setExerciseSearch(e.target.value)}
                                className="w-full bg-surface p-3 rounded-lg my-4"
                            />
                            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                                {['all', ...Object.values(Equipment)].map(eq => (
                                    <button key={eq} onClick={() => setEquipmentFilter(eq as Equipment | 'all')} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${equipmentFilter === eq ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-gray-700'}`}>
                                        {eq.charAt(0).toUpperCase() + eq.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4">
                            <div className="sticky top-0 z-20 bg-background py-3">
                                <button onClick={() => setIsCreatingExercise(true)} className="w-full bg-tertiary/20 text-tertiary p-3 rounded-lg font-semibold hover:bg-tertiary/30 transition-colors">
                                    + Add Custom Exercise
                                </button>
                            </div>
                            {Object.keys(groupedExercises).length === 0 && (
                                <p className="text-center text-text-secondary mt-8">No exercises match your filters.</p>
                            )}
                            {Object.entries(groupedExercises).map(([group, exercises]) => (
                                <div key={group} className="mb-4">
                                    <h4 className="font-bold text-primary mb-2 sticky top-16 z-10 bg-background py-1">{group}</h4>
                                    {exercises.map(ex => (
                                        <button key={ex.id} onClick={() => addExerciseToSession(ex)} className="w-full text-left bg-surface p-3 rounded-lg mb-2 hover:bg-surface/80 transition-colors">
                                            {ex.name}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="flex-none pt-4">
                            <button onClick={() => setIsPickerOpen(false)} className="w-full bg-gray-600 p-3 rounded-lg">Cancel</button>
                        </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ActiveWorkout;