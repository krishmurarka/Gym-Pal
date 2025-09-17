import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Routine, PerformedExercise, WorkoutSession, Exercise, MuscleGroup, Equipment, RoutineExercise, RoutineVariant } from '../types';
import { useExercises } from '../hooks/useExercises';
import StopwatchIcon from './icons/StopwatchIcon';
import CheckIcon from './icons/CheckIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface ActiveWorkoutProps {
    routine: Routine;
    variant: RoutineVariant;
    onFinish: () => void;
    sessions: WorkoutSession[];
    setSessions: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
}

// A helper type for sets within the active workout component's state
type ActiveWorkoutSet = {
    id: string;
    weight: number;
    reps: number;
    isCompleted: boolean;
    lastPerformed?: string | null;
};

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ routine, variant, onFinish, sessions, setSessions }) => {
    const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', []);
    const { allExercises, findExerciseById, setCustomExercises } = useExercises();
    
    const [performedExercises, setPerformedExercises] = useState<Array<Omit<PerformedExercise, 'sets' | 'notes'> & { sets: ActiveWorkoutSet[]; notes: string; lastNotes?: string }>>(() => {
        const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const findLastPerformance = (exerciseId: string): PerformedExercise | undefined => {
            for (const session of sortedSessions) {
                const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
                if (exercise) return exercise;
            }
            return undefined;
        };
        
        return variant.exercises.map(routineEx => {
            const exerciseDetails = findExerciseById(routineEx.exerciseId);
            const lastPerformance = findLastPerformance(routineEx.exerciseId);
            
            return {
                exerciseId: routineEx.exerciseId,
                exerciseName: exerciseDetails?.name || 'Unknown Exercise',
                muscleGroup: exerciseDetails?.muscleGroup!,
                notes: '',
                lastNotes: lastPerformance?.notes,
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
    const touchDragData = useRef<{ initialY: number; element: HTMLElement; height: number; lastY: number; ticking: boolean; } | null>(null);

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
    
    const handleNoteChange = (exerciseIndex: number, newNote: string) => {
        if (newNote.length > 150) return;
        setPerformedExercises(prev => {
            const newExercises = JSON.parse(JSON.stringify(prev));
            newExercises[exerciseIndex].notes = newNote;
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
        const completedExercises: PerformedExercise[] = performedExercises
            .map(ex => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                muscleGroup: ex.muscleGroup,
                notes: ex.notes,
                sets: ex.sets
                    .filter(set => set.isCompleted)
                    .map(({ id, weight, reps }) => ({ id, weight, reps, isCompleted: true })),
            }))
            .filter(ex => ex.sets.length > 0);

        if (completedExercises.length > 0) {
            const finalWorkout: WorkoutSession = {
                id: crypto.randomUUID(),
                routineId: routine.id,
                routineName: routine.name,
                variantId: variant.id,
                variantName: variant.name,
                date: new Date().toISOString(),
                exercises: completedExercises,
                durationSeconds: duration
            };
            
            setSessions(prevSessions => [...prevSessions, finalWorkout]);
        }
        onFinish();
    }, [routine.id, routine.name, variant.id, variant.name, performedExercises, duration, setSessions, onFinish]);
    
    const updateRoutineAndFinish = () => {
        const updatedVariantExercises: RoutineExercise[] = performedExercises.map(pEx => ({
            exerciseId: pEx.exerciseId,
            sets: pEx.sets.map(set => ({
                id: set.id,
                weight: set.weight,
                reps: set.reps,
            })),
        }));
    
        setRoutines(prevRoutines =>
            prevRoutines.map(r => {
                if (r.id !== routine.id) return r;
    
                const updatedVariants = r.variants.map(v => {
                    if (v.id !== variant.id) return v;
                    return { ...v, exercises: updatedVariantExercises };
                });
    
                return { ...r, variants: updatedVariants };
            })
        );
    
        saveSessionAndFinish();
    };

    const handleAttemptFinish = () => {
        const originalExerciseIds = new Set(variant.exercises.map(ex => ex.exerciseId));
        const hasNewExercises = performedExercises.some(pEx => !originalExerciseIds.has(pEx.exerciseId));

        const hasSetCountChanges = performedExercises.some(pEx => {
            const originalEx = variant.exercises.find(rEx => rEx.exerciseId === pEx.exerciseId);
            if (!originalEx) return false;
            return originalEx.sets.length !== pEx.sets.length;
        });

        const originalExerciseOrder = variant.exercises.map(ex => ex.exerciseId);
        const currentExerciseOrder = performedExercises.map(ex => ex.exerciseId);
        const hasOrderChanged = JSON.stringify(originalExerciseOrder) !== JSON.stringify(currentExerciseOrder);

        if (hasNewExercises || hasSetCountChanges || hasOrderChanged) {
            setIsConfirmingFinish(true);
        } else {
            saveSessionAndFinish();
        }
    };
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    const addExerciseToSession = (exercise: Exercise) => {
        if (performedExercises.some(e => e.exerciseId === exercise.id)) {
            setIsPickerOpen(false); // Already exists, just close picker
            return;
        }

        const newPerformedExercise: Omit<PerformedExercise, 'sets' | 'notes'> & { sets: ActiveWorkoutSet[]; notes: string; lastNotes?: string } = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            notes: '',
            lastNotes: undefined,
            sets: [{ id: crypto.randomUUID(), reps: 10, weight: 20, isCompleted: false, lastPerformed: null }],
        };
        setPerformedExercises(prev => [...prev, newPerformedExercise]);
        setIsPickerOpen(false);
        setExerciseSearch('');
        setEquipmentFilter('all');
    };
    
    const removeExercise = (exIndex: number) => {
        setPerformedExercises(prev => prev.filter((_, index) => index !== exIndex));
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

    const performDrop = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        setPerformedExercises(prev => {
            const newExercises = [...prev];
            const [movedItem] = newExercises.splice(fromIndex, 1);
            newExercises.splice(toIndex, 0, movedItem);
            return newExercises;
        });
    }, []);

    const cleanupDragState = useCallback(() => {
        document.body.classList.remove('dragging-active');
        if (touchDragData.current) {
            touchDragData.current.element.classList.remove('is-dragging');
            touchDragData.current.element.style.transform = '';
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
        touchDragData.current = null;
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex !== null && index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (dropIndex: number) => {
        if (draggedIndex !== null) {
            performDrop(draggedIndex, dropIndex);
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
        const itemElement = e.currentTarget.closest('[data-drag-item="true"]') as HTMLElement;
        if (!itemElement) return;

        const initialY = e.touches[0].clientY;
        setDraggedIndex(index);
        touchDragData.current = {
            initialY,
            lastY: initialY,
            element: itemElement,
            height: itemElement.offsetHeight,
            ticking: false
        };
        document.body.classList.add('dragging-active');
        itemElement.classList.add('is-dragging');
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!touchDragData.current) return;
        e.preventDefault(); // Prevent scrolling
        touchDragData.current.lastY = e.touches[0].clientY;

        if (!touchDragData.current.ticking) {
            window.requestAnimationFrame(() => {
                if (!touchDragData.current || draggedIndex === null) {
                    if(touchDragData.current) touchDragData.current.ticking = false;
                    return;
                };

                const { element, initialY, lastY, height } = touchDragData.current;
                const deltaY = lastY - initialY;

                element.style.transform = `translateY(${deltaY}px) scale(1.03) rotate(1deg)`;

                const overIndex = draggedIndex + Math.round(deltaY / height);
                const clampedOverIndex = Math.max(0, Math.min(performedExercises.length - 1, overIndex));
                setDragOverIndex(prev => prev === clampedOverIndex ? prev : clampedOverIndex);

                touchDragData.current.ticking = false;
            });
            touchDragData.current.ticking = true;
        }
    }, [draggedIndex, performedExercises.length]);


    const handleTouchEnd = useCallback(() => {
        if (draggedIndex !== null && dragOverIndex !== null) {
            performDrop(draggedIndex, dragOverIndex);
        }
        cleanupDragState();
    }, [draggedIndex, dragOverIndex, performDrop, cleanupDragState]);


    useEffect(() => {
        if (draggedIndex !== null && touchDragData.current) {
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
            window.addEventListener('touchcancel', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [draggedIndex, handleTouchMove, handleTouchEnd]);

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
        <div className="pb-40">
            <header className="sticky top-0 z-20 p-4 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex justify-between items-center max-w-3xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold truncate pr-2">{routine.name}</h1>
                        <p className="text-text-secondary font-semibold">{variant.name ? `Variant ${variant.name}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full text-lg">
                        <StopwatchIcon className="w-6 h-6 text-secondary" />
                        <span className="font-mono font-semibold">{formatDuration(duration)}</span>
                    </div>
                </div>
            </header>

            <main className="px-4 space-y-4 mt-4 max-w-3xl mx-auto">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-center text-xs text-text-secondary font-bold px-4 mb-2">
                    <span>SET</span>
                    <span>LAST</span>
                    <span>KG</span>
                    <span>REPS</span>
                </div>
                {performedExercises.map((pEx, exIndex) => {
                    return (
                        <div key={pEx.exerciseId + exIndex} data-drag-item="true" draggable onDragStart={(e) => handleDragStart(e, exIndex)} onDragOver={(e) => e.preventDefault()} onDragEnter={() => handleDragEnter(exIndex)} onDragLeave={() => setDragOverIndex(null)} onDrop={() => handleDrop(exIndex)} onDragEnd={cleanupDragState}
                        className={`bg-surface border border-border p-4 rounded-2xl shadow-md transition-all duration-200 ${draggedIndex === exIndex ? 'opacity-50 shadow-2xl scale-105' : ''} ${dragOverIndex === exIndex && dragOverIndex !== draggedIndex ? 'outline-2 outline-dashed outline-primary -outline-offset-2' : ''}`}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div onTouchStart={(e) => handleTouchStart(e, exIndex)} className="cursor-grab p-2 -ml-2"><DragHandleIcon className="w-6 h-6 text-text-secondary flex-shrink-0" /></div>
                                    <h3 className="text-lg font-bold">{pEx.exerciseName}</h3>
                                </div>
                                <button onClick={() => removeExercise(exIndex)} className="text-danger hover:brightness-125 transition-colors text-sm font-semibold">Remove</button>
                            </div>
                            <div className="mb-3 space-y-1">
                                {pEx.lastNotes && <p className="text-xs text-text-secondary italic">Last note: "{pEx.lastNotes}"</p>}
                                <div className="relative">
                                    <textarea
                                        value={pEx.notes}
                                        onChange={(e) => handleNoteChange(exIndex, e.target.value)}
                                        maxLength={150}
                                        placeholder="Add a note (e.g., form check, felt good...)"
                                        className="w-full bg-input border border-border p-2 rounded-lg text-sm resize-none focus:border-secondary transition-colors"
                                        rows={2}
                                    />
                                    <span className="absolute bottom-2 right-2 text-xs text-text-secondary">{pEx.notes?.length || 0}/150</span>
                                </div>
                            </div>
                            {pEx.sets.map((set, setIndex) => (
                                <div key={set.id} className="grid grid-cols-[30px_1fr_1fr_1fr_40px] items-center gap-2 mb-2">
                                    <span className="font-bold text-text-secondary text-center">{setIndex + 1}</span>
                                    <p className="text-xs text-text-secondary text-center bg-input rounded-lg py-3">{set.lastPerformed || '-'}</p>
                                    <input type="number" min="0" max="1000" disabled={set.isCompleted} value={set.weight} onFocus={handleFocus} onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)} className="w-full bg-input border border-border p-2 rounded-lg text-center disabled:opacity-70" placeholder="kg" />
                                    <input type="number" min="1" max="50" disabled={set.isCompleted} value={set.reps} onFocus={handleFocus} onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)} className="w-full bg-input border border-border p-2 rounded-lg text-center disabled:opacity-70" placeholder="Reps" />
                                    <button onClick={() => toggleSetCompletion(exIndex, setIndex)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${set.isCompleted ? 'bg-primary text-background shadow-lg shadow-primary/30' : 'bg-surface-alt hover:bg-border'}`}>
                                        {set.isCompleted && <CheckIcon className="w-6 h-6" />}
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addSet(exIndex)} className="w-full bg-secondary/20 text-secondary p-2 rounded-lg mt-2 font-semibold hover:bg-secondary/30 transition-colors text-sm">+ Add Set</button>
                        </div>
                    )
                })}
            </main>
        </div>
        
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border z-10">
            <div className="space-y-3 max-w-3xl mx-auto">
                <button onClick={() => setIsPickerOpen(true)} className="w-full border-2 border-dashed border-border text-text-secondary p-3 rounded-lg font-semibold hover:bg-surface hover:border-solid transition-all">+ Add Exercise</button>
                <button onClick={handleAttemptFinish} className="w-full btn btn-primary">Finish Workout</button>
            </div>
        </footer>

        {isConfirmingFinish && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div className="bg-surface rounded-xl p-6 max-w-sm w-full text-center shadow-2xl border border-border">
                    <h2 className="text-xl font-bold mb-4">Save Changes?</h2>
                    <p className="text-text-secondary mb-6">You've made changes to this workout. Do you want to save these changes to the routine for next time?</p>
                    <div className="space-y-3">
                        <button onClick={updateRoutineAndFinish} className="w-full btn btn-primary">Save & Finish</button>
                        <button onClick={saveSessionAndFinish} className="w-full btn btn-ghost">Finish Without Saving</button>
                        <button onClick={() => setIsConfirmingFinish(false)} className="w-full text-sm text-text-secondary hover:text-text-primary pt-2">Cancel</button>
                    </div>
                </div>
            </div>
        )}

        {(isPickerOpen || isCreatingExercise) && (
             <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col p-4 z-50">
                 {isCreatingExercise ? (
                     <div className="w-full max-w-md mx-auto mt-10">
                         <h3 className="text-xl font-bold mb-4">Create New Exercise</h3>
                         <input type="text" placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} className="w-full bg-input border border-border p-3 rounded-lg mb-4"/>
                         <select value={newExercise.muscleGroup} onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value as MuscleGroup})} className="w-full bg-input border border-border p-3 rounded-lg mb-4">
                             {Object.values(MuscleGroup).map(group => <option key={group} value={group}>{group}</option>)}
                         </select>
                         <select value={newExercise.equipment} onChange={e => setNewExercise({...newExercise, equipment: e.target.value as Equipment})} className="w-full bg-input border border-border p-3 rounded-lg mb-6">
                             {Object.values(Equipment).map(eq => <option key={eq} value={eq}>{eq}</option>)}
                         </select>
                         <div className="flex gap-4">
                             <button onClick={() => setIsCreatingExercise(false)} className="w-full btn btn-ghost">Back</button>
                             <button onClick={handleSaveCustomExercise} className="w-full btn btn-primary">Save Exercise</button>
                         </div>
                     </div>
                 ) : (
                    <>
                     <div className="flex-none">
                         <h3 className="text-xl font-bold text-center">Select an Exercise</h3>
                         <input type="text" placeholder="Search exercises..." value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} className="w-full bg-surface border border-border p-3 rounded-lg my-4"/>
                         <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                             {['all', ...Object.values(Equipment)].map(eq => (
                                 <button key={eq} onClick={() => setEquipmentFilter(eq as Equipment | 'all')} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${equipmentFilter === eq ? 'bg-secondary text-white' : 'bg-surface text-text-secondary hover:bg-border'}`}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</button>
                             ))}
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto mt-4">
                         <div className="sticky top-0 z-20 bg-background/95 py-3"><button onClick={() => setIsCreatingExercise(true)} className="w-full bg-primary/20 text-primary p-3 rounded-lg font-semibold hover:bg-primary/30 transition-colors">+ Add Custom Exercise</button></div>
                         {Object.keys(groupedExercises).length === 0 && <p className="text-center text-text-secondary mt-8">No exercises match your filters.</p>}
                         {Object.entries(groupedExercises).map(([group, exercises]) => (
                             <div key={group} className="mb-4">
                                 <h4 className="font-bold text-secondary mb-2 sticky top-16 z-10 bg-background/95 py-1">{group}</h4>
                                 {exercises.map(ex => <button key={ex.id} onClick={() => addExerciseToSession(ex)} className="w-full text-left bg-surface border border-border p-3 rounded-lg mb-2 hover:bg-border transition-colors">{ex.name}</button>)}
                             </div>
                         ))}
                     </div>
                     <div className="flex-none pt-4"><button onClick={() => setIsPickerOpen(false)} className="w-full btn btn-ghost">Cancel</button></div>
                    </>
                 )}
             </div>
        )}
        </>
    );
};

export default ActiveWorkout;