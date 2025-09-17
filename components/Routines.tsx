import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Routine, Exercise, RoutineExercise, MuscleGroup, Equipment, RoutineVariant } from '../types';
import { useExercises } from '../hooks/useExercises';
import DragHandleIcon from './icons/DragHandleIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface RoutinesProps {
    onStartWorkout: (workout: { routine: Routine, variant: RoutineVariant }) => void;
}

// Helper function to create default sets
const createSets = (count: number, reps: number, weight: number): { id: string; reps: number; weight: number; }[] => {
    return Array.from({ length: count }, () => ({
        id: crypto.randomUUID(),
        reps,
        weight,
    }));
};

const DEFAULT_ROUTINES: Routine[] = [
    {
        id: 'default-pull',
        name: 'Pull Day',
        nextVariantIndex: 0,
        variants: [
            { // Variant A
                id: 'default-pull-a',
                name: 'A',
                exercises: [
                    { exerciseId: 'ex_back_5', sets: createSets(3, 10, 25) }, // Bent Over Row Dumbbell
                    { exerciseId: 'ex8', sets: createSets(3, 10, 40) }, // Lat Pulldown
                    { exerciseId: 'ex_back_11', sets: createSets(3, 10, 40) }, // Seated Rowing Machine
                    { exerciseId: 'ex_back_12', sets: createSets(3, 12, 30) }, // Reverse Grip Lat Pulldown
                    { exerciseId: 'ex_shoulders_8', sets: createSets(3, 12, 25) }, // Reverse Pec Deck Fly
                    { exerciseId: 'ex_biceps_3', sets: createSets(3, 10, 20) }, // Barbell Curl
                    { exerciseId: 'ex_biceps_6', sets: createSets(3, 12, 30) }, // Machine Hammer Curl
                    { exerciseId: 'ex_biceps_5', sets: createSets(3, 12, 20) }, // Cable Curl
                    { exerciseId: 'ex_back_15', sets: createSets(3, 15, 30) }, // Dumbbell Shrugs
                ],
            },
            { // Variant B
                id: 'default-pull-b',
                name: 'B',
                exercises: [
                    { exerciseId: 'ex6', sets: createSets(3, 5, 100) }, // Deadlift
                    { exerciseId: 'ex8', sets: createSets(3, 10, 40) }, // Lat Pulldown
                    { exerciseId: 'ex_back_11', sets: createSets(3, 10, 40) }, // Seated Rowing Machine
                    { exerciseId: 'ex_back_13', sets: createSets(3, 12, 25) }, // Straight Arm Pulldown
                    { exerciseId: 'ex_shoulders_8', sets: createSets(3, 12, 25) }, // Reverse Pec Deck Fly
                    { exerciseId: 'ex17', sets: createSets(3, 10, 12) }, // DB Curl
                    { exerciseId: 'ex_biceps_7', sets: createSets(3, 12, 20) }, // Reverse Cable Curl
                    { exerciseId: 'ex_biceps_5', sets: createSets(3, 12, 20) }, // Cable Curl
                    { exerciseId: 'ex_back_15', sets: createSets(3, 15, 30) }, // Dumbbell Shrugs
                ],
            }
        ]
    },
    {
        id: 'default-push',
        name: 'Push Day',
        nextVariantIndex: 0,
        variants: [
            { // Variant A
                id: 'default-push-a',
                name: 'A',
                exercises: [
                    { exerciseId: 'ex_chest_12', sets: createSets(3, 10, 25) }, // Flat Dumbbell Press
                    { exerciseId: 'ex2', sets: createSets(3, 10, 20) }, // Incline Dumbbell Press
                    { exerciseId: 'ex_chest_13', sets: createSets(3, 10, 20) }, // Decline Dumbbell Press
                    { exerciseId: 'ex_chest_8', sets: createSets(3, 12, 40) }, // Pec Deck Machine
                    { exerciseId: 'ex_shoulders_9', sets: createSets(3, 10, 15) }, // Dumbbell Overhead Press
                    { exerciseId: 'ex15', sets: createSets(3, 15, 8) }, // Lateral Raises
                    { exerciseId: 'ex20', sets: createSets(3, 12, 30) }, // Tricep Pushdowns
                    { exerciseId: 'ex_triceps_4', sets: createSets(3, 12, 10) }, // Overhead Tricep Extension
                    { exerciseId: 'ex_triceps_6', sets: createSets(3, 12, 25) }, // Rope Extension
                ],
            },
            { // Variant B
                id: 'default-push-b',
                name: 'B',
                exercises: [
                    { exerciseId: 'ex_chest_12', sets: createSets(3, 10, 25) }, // Flat Dumbbell Press
                    { exerciseId: 'ex_chest_7', sets: createSets(3, 10, 50) }, // Incline Chest Press Machine
                    { exerciseId: 'ex_chest_15', sets: createSets(3, 12, 40) }, // Decline Machine Chest Press
                    { exerciseId: 'ex_chest_14', sets: createSets(3, 12, 30) }, // Cable Chest Press
                    { exerciseId: 'ex14', sets: createSets(3, 8, 40) }, // Overhead Press (Barbell)
                    { exerciseId: 'ex15', sets: createSets(3, 15, 8) }, // Lateral Raises
                    { exerciseId: 'ex20', sets: createSets(3, 12, 30) }, // Tricep Pushdowns
                    { exerciseId: 'ex_triceps_4', sets: createSets(3, 12, 10) }, // Overhead Tricep Extension
                    { exerciseId: 'ex_triceps_6', sets: createSets(3, 12, 25) }, // Rope Extension
                ],
            }
        ]
    },
    {
        id: 'default-legs',
        name: 'Legs Day',
        nextVariantIndex: 0,
        variants: [
            { // Variant A
                id: 'default-legs-a',
                name: 'A',
                exercises: [
                    { exerciseId: 'ex9', sets: createSets(3, 8, 80) }, // Squat
                    { exerciseId: 'ex11', sets: createSets(3, 12, 15) }, // Lunges
                    { exerciseId: 'ex13', sets: createSets(3, 12, 40) }, // Leg Extensions
                    { exerciseId: 'ex_legs_6', sets: createSets(3, 10, 60) }, // Romanian Deadlift
                    { exerciseId: 'ex_calves_1', sets: createSets(3, 20, 0) }, // Calf Raises
                    { exerciseId: 'ex_legs_12', sets: createSets(3, 12, 40) }, // Seated Leg Curl
                ],
            },
            { // Variant B
                id: 'default-legs-b',
                name: 'B',
                exercises: [
                    { exerciseId: 'ex_legs_10', sets: createSets(3, 8, 60) }, // Front Squat
                    { exerciseId: 'ex_legs_11', sets: createSets(3, 12, 60) }, // Single Leg Press
                    { exerciseId: 'ex13', sets: createSets(3, 12, 40) }, // Leg Extensions
                    { exerciseId: 'ex_glutes_1', sets: createSets(3, 10, 80) }, // Hip Thrust
                    { exerciseId: 'ex_calves_1', sets: createSets(3, 20, 0) }, // Calf Raises
                    { exerciseId: 'ex_legs_12', sets: createSets(3, 12, 40) }, // Seated Leg Curl
                ],
            }
        ]
    }
];

const Routines: React.FC<RoutinesProps> = ({ onStartWorkout }) => {
    const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', DEFAULT_ROUTINES);
    const [isEditing, setIsEditing] = useState<Routine | null>(null);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell });
    const [searchQuery, setSearchQuery] = useState('');
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    const { allExercises, setCustomExercises, findExerciseById } = useExercises();

    // State for exercise picker
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');

    // State for drag and drop
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const touchDragData = useRef<{ initialY: number; element: HTMLElement; height: number; lastY: number; ticking: boolean; } | null>(null);

    useEffect(() => {
        // A one-time migration for old routine structures
        const needsMigration = routines.some(r => !r.variants || typeof r.nextVariantIndex !== 'number');
    
        if (needsMigration) {
            const migratedRoutines = routines.map(r => {
                const newRoutine = { ...r };
                // If `variants` array doesn't exist, create it from old `exercises` property
                // @ts-ignore - checking for old property
                if (!newRoutine.variants || !Array.isArray(newRoutine.variants) || newRoutine.variants.length === 0) {
                    newRoutine.variants = [{ 
                        id: crypto.randomUUID(), 
                        name: 'A', 
                        // @ts-ignore
                        exercises: r.exercises || [] 
                    }];
                }
                // If `nextVariantIndex` is missing, add it.
                if (typeof newRoutine.nextVariantIndex !== 'number') {
                    newRoutine.nextVariantIndex = 0;
                }
                return newRoutine;
            });
            setRoutines(migratedRoutines);
        }
    }, [routines, setRoutines]);

    const handleSaveRoutine = () => {
        if (!isEditing || !isEditing.name.trim()) {
            alert('Routine name cannot be blank.');
            setIsNameInvalid(true);
            return;
        }

        setIsNameInvalid(false);
        const existing = routines.find(r => r.id === isEditing.id);
        if (existing) {
            setRoutines(routines.map(r => r.id === isEditing.id ? isEditing : r));
        } else {
            setRoutines([...routines, isEditing]);
        }
        setIsEditing(null);
    };

    const handleCreateNew = () => {
        setIsEditing({ 
            id: crypto.randomUUID(), 
            name: '', 
            variants: [{ id: crypto.randomUUID(), name: 'A', exercises: [] }],
            nextVariantIndex: 0 
        });
        setActiveVariantIndex(0);
        setIsNameInvalid(false);
    };

    const handleDeleteRoutine = (id: string) => {
        setRoutines(routines.filter(r => r.id !== id));
    };
    
    const addExerciseToRoutine = (exercise: Exercise) => {
        if (isEditing) {
            const currentVariant = isEditing.variants[activeVariantIndex];
            if (!currentVariant.exercises.some(e => e.exerciseId === exercise.id)) {
                const newRoutineExercise: RoutineExercise = {
                    exerciseId: exercise.id,
                    sets: [{ id: crypto.randomUUID(), reps: 10, weight: 20 }], // Start with one default set
                };
                
                const newVariants = [...isEditing.variants];
                newVariants[activeVariantIndex] = {
                    ...currentVariant,
                    exercises: [...currentVariant.exercises, newRoutineExercise]
                };

                setIsEditing({ ...isEditing, variants: newVariants });
            }
        }
        setIsPickerOpen(false);
        setExerciseSearch('');
        setEquipmentFilter('all');
    };

    const removeExerciseFromRoutine = (exerciseId: string) => {
        if (isEditing) {
            const newVariants = [...isEditing.variants];
            const currentVariant = newVariants[activeVariantIndex];
            newVariants[activeVariantIndex] = {
                ...currentVariant,
                exercises: currentVariant.exercises.filter(e => e.exerciseId !== exerciseId)
            };
            setIsEditing({ ...isEditing, variants: newVariants });
        }
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
        if (!isEditing) return;
        
        const numValue = field === 'weight' ? parseFloat(value) : parseInt(value, 10);
        const newVariants = [...isEditing.variants];
        const currentVariant = newVariants[activeVariantIndex];
        const updatedExercises = [...currentVariant.exercises];
        const targetSet = updatedExercises[exIndex].sets[setIndex];
        
        if (field === 'reps') targetSet.reps = Math.min(50, Math.max(1, isNaN(numValue) ? 1 : numValue));
        else targetSet.weight = Math.min(1000, Math.max(0, isNaN(numValue) ? 0 : numValue));
        
        newVariants[activeVariantIndex] = { ...currentVariant, exercises: updatedExercises };
        setIsEditing({ ...isEditing, variants: newVariants });
    };

    const addSetToExercise = (exIndex: number) => {
        if (!isEditing) return;
        const newVariants = [...isEditing.variants];
        const currentVariant = newVariants[activeVariantIndex];
        const updatedExercises = [...currentVariant.exercises];
        const targetExercise = updatedExercises[exIndex];
        const lastSet = targetExercise.sets[targetExercise.sets.length - 1] || { reps: 10, weight: 20 };
        targetExercise.sets.push({ id: crypto.randomUUID(), ...lastSet });
        
        newVariants[activeVariantIndex] = { ...currentVariant, exercises: updatedExercises };
        setIsEditing({ ...isEditing, variants: newVariants });
    };

    const removeSetFromExercise = (exIndex: number, setIndex: number) => {
        if (!isEditing) return;
        const newVariants = [...isEditing.variants];
        const currentVariant = newVariants[activeVariantIndex];
        const updatedExercises = [...currentVariant.exercises];
        updatedExercises[exIndex].sets.splice(setIndex, 1);
        
        newVariants[activeVariantIndex] = { ...currentVariant, exercises: updatedExercises };
        setIsEditing({ ...isEditing, variants: newVariants });
    };
    
    const handleSaveCustomExercise = () => {
        if (newExercise.name.trim()) {
            const newEx: Exercise = { id: crypto.randomUUID(), ...newExercise, name: newExercise.name.trim() };
            setCustomExercises(prev => [...prev, newEx]);
            setIsCreatingExercise(false);
            setNewExercise({ name: '', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell });
        }
    };
    
    const addVariant = () => {
        if (!isEditing) return;
        const nextVariantName = String.fromCharCode('A'.charCodeAt(0) + isEditing.variants.length);
        const newVariant: RoutineVariant = { id: crypto.randomUUID(), name: nextVariantName, exercises: [] };
        setIsEditing({ ...isEditing, variants: [...isEditing.variants, newVariant] });
        setActiveVariantIndex(isEditing.variants.length);
    };

    const deleteVariant = (index: number) => {
        if (!isEditing || isEditing.variants.length <= 1) return;
        const newVariants = isEditing.variants.filter((_, i) => i !== index);
        setIsEditing({ ...isEditing, variants: newVariants });
        setActiveVariantIndex(Math.max(0, index - 1));
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    const performDrop = useCallback((fromIndex: number, toIndex: number) => {
        if (!isEditing || fromIndex === toIndex) return;

        const newVariants = [...isEditing.variants];
        const currentVariant = newVariants[activeVariantIndex];
        const newExercises = [...currentVariant.exercises];
        const [movedItem] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, movedItem);

        newVariants[activeVariantIndex] = { ...currentVariant, exercises: newExercises };
        setIsEditing({ ...isEditing, variants: newVariants });
    }, [isEditing, activeVariantIndex]);

    const cleanupDragState = useCallback(() => { /* ... unchanged ... */ }, []);
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { /* ... unchanged ... */ };
    const handleDragEnter = (index: number) => { /* ... unchanged ... */ };
    const handleDrop = (dropIndex: number) => { /* ... unchanged ... */ };
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => { /* ... unchanged ... */ };
    const handleTouchMove = useCallback((e: TouchEvent) => { /* ... unchanged ... */ }, [draggedIndex, isEditing, activeVariantIndex]);
    const handleTouchEnd = useCallback(() => { /* ... unchanged ... */ }, [draggedIndex, dragOverIndex, performDrop, cleanupDragState]);

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

    const handleStartWorkout = (routine: Routine) => {
        const variantIndex = routine.nextVariantIndex || 0;
        const variant = routine.variants[variantIndex];
        if (!variant) {
            alert("This routine has no workouts defined. Please edit it and add exercises.");
            return;
        }
    
        onStartWorkout({ routine, variant });
    
        // Update the next index for the next workout
        const updatedRoutine = {
            ...routine,
            nextVariantIndex: (variantIndex + 1) % routine.variants.length,
        };
        setRoutines(routines.map(r => r.id === routine.id ? updatedRoutine : r));
    };

    const filteredExercises = useMemo(() => {
        const lowerCaseSearch = exerciseSearch.toLowerCase();
        if (!isEditing) return [];
        const currentExerciseIds = new Set(isEditing.variants[activeVariantIndex]?.exercises.map(e => e.exerciseId) || []);

        return allExercises.filter(ex => {
            if (currentExerciseIds.has(ex.id)) return false;
            const matchesSearch = ex.name.toLowerCase().includes(lowerCaseSearch) || 
                                  ex.muscleGroup.toLowerCase().includes(lowerCaseSearch);
            const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
            return matchesSearch && matchesEquipment;
        });
    }, [allExercises, exerciseSearch, equipmentFilter, isEditing, activeVariantIndex]);
    
    const groupedExercises = useMemo(() => {
        return filteredExercises.reduce((acc, ex) => {
            (acc[ex.muscleGroup] = acc[ex.muscleGroup] || []).push(ex);
            return acc;
        }, {} as Record<string, Exercise[]>);
    }, [filteredExercises]);
    
    const filteredRoutines = routines.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isEditing) {
        const currentExercises = isEditing.variants[activeVariantIndex]?.exercises || [];
        return (
            <div className="p-4">
                <h2 className="text-3xl font-bold mb-4 text-center">{isEditing.id.length > 20 ? 'Create Routine' : 'Edit Routine'}</h2>
                <input
                    type="text"
                    value={isEditing.name}
                    onChange={(e) => { setIsEditing({ ...isEditing, name: e.target.value }); if (isNameInvalid) setIsNameInvalid(false); }}
                    placeholder="Routine Name (e.g., Push Day)"
                    className={`w-full bg-surface p-3 rounded-lg mb-4 text-lg text-text-primary placeholder-text-secondary transition-all ${isNameInvalid ? 'border-2 border-red-500' : 'border-2 border-transparent focus:border-primary'}`}
                />

                <div className="flex items-center border-b border-surface mb-4 overflow-x-auto">
                    {isEditing.variants.map((variant, index) => (
                        <div key={variant.id} className="flex items-center">
                            <button
                                onClick={() => setActiveVariantIndex(index)}
                                className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${activeVariantIndex === index ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-white'}`}
                            >
                                {variant.name}
                            </button>
                            {isEditing.variants.length > 1 && (
                                <button onClick={() => deleteVariant(index)} className="ml-1 text-text-secondary hover:text-red-400 p-1">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addVariant} className="p-2 text-text-secondary hover:text-primary">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>


                <div className="space-y-4 mb-6">
                    {currentExercises.map((exConfig, exIndex) => {
                        const exercise = findExerciseById(exConfig.exerciseId);
                        if (!exercise) return null;
                        return (
                            <div 
                                key={exConfig.exerciseId}
                                data-drag-item="true"
                                draggable
                                onDragStart={(e) => handleDragStart(e, exIndex)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => handleDragEnter(exIndex)}
                                onDragLeave={() => setDragOverIndex(null)}
                                onDrop={() => handleDrop(exIndex)}
                                onDragEnd={cleanupDragState}
                                className={`bg-surface/80 p-4 rounded-lg space-y-3 shadow-md transition-all duration-200 
                                    ${draggedIndex === exIndex ? 'opacity-50 shadow-2xl scale-105' : ''}
                                    ${dragOverIndex === exIndex && dragOverIndex !== draggedIndex ? 'outline-2 outline-dashed outline-primary -outline-offset-2' : ''}
                                `}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div onTouchStart={(e) => handleTouchStart(e, exIndex)} className="cursor-grab p-2 -ml-2">
                                            <DragHandleIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg text-text-primary">{exercise.name}</h4>
                                            <p className="text-xs text-text-secondary tracking-wide">{exercise.muscleGroup} &bull; {exercise.equipment}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeExerciseFromRoutine(exConfig.exerciseId)} className="text-red-400 hover:text-red-500 transition-colors text-sm">Remove</button>
                                </div>
                                {exConfig.sets.map((set, setIndex) => (
                                    <div key={set.id} className="flex items-center gap-2">
                                        <span className="font-bold text-text-secondary w-8 text-center">{setIndex + 1}</span>
                                        <input type="number" min="0" max="1000" value={set.weight} onChange={e => handleSetChange(exIndex, setIndex, 'weight', e.target.value)} onFocus={handleFocus} className="w-full bg-background p-2 rounded text-center" placeholder="kg" />
                                        <span className="text-text-secondary">kg</span>
                                        <input type="number" min="1" max="50" value={set.reps} onChange={e => handleSetChange(exIndex, setIndex, 'reps', e.target.value)} onFocus={handleFocus} className="w-full bg-background p-2 rounded text-center" placeholder="Reps" />
                                        <span className="text-text-secondary">reps</span>
                                        <button onClick={() => removeSetFromExercise(exIndex, setIndex)} className="text-red-500 text-2xl font-light hover:text-red-400 w-8 text-center">×</button>
                                    </div>
                                ))}
                                <button onClick={() => addSetToExercise(exIndex)} className="w-full bg-primary/20 text-primary p-2 rounded-lg mt-2 font-semibold hover:bg-primary/30 transition-colors text-sm">Add Set</button>
                            </div>
                        );
                    })}
                </div>

                <button onClick={() => setIsPickerOpen(true)} className="w-full bg-primary/20 text-primary p-3 rounded-lg mb-4 font-semibold hover:bg-primary/30 transition-colors">Add Exercise to '{isEditing.variants[activeVariantIndex]?.name}'</button>
                <div className="flex gap-4">
                    <button onClick={() => setIsEditing(null)} className="w-full bg-surface p-3 rounded-lg hover:bg-surface/80 transition-colors">Cancel</button>
                    <button onClick={handleSaveRoutine} className="w-full bg-primary p-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">Save Routine</button>
                </div>

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
                                    <input type="text" placeholder="Search exercises..." value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} className="w-full bg-surface p-3 rounded-lg my-4"/>
                                    <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                                        {(['all', ...Object.values(Equipment)] as const).map(eq => (
                                            <button key={eq} onClick={() => setEquipmentFilter(eq)} className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${equipmentFilter === eq ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-gray-700'}`}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto mt-4">
                                    <div className="sticky top-0 z-20 bg-background py-3"><button onClick={() => setIsCreatingExercise(true)} className="w-full bg-tertiary/20 text-tertiary p-3 rounded-lg font-semibold hover:bg-tertiary/30 transition-colors">+ Add Custom Exercise</button></div>
                                    {Object.keys(groupedExercises).length === 0 && <p className="text-center text-text-secondary mt-8">No exercises match your filters.</p>}
                                    {Object.entries(groupedExercises).map(([group, exercises]) => (
                                        <div key={group} className="mb-4">
                                            <h4 className="font-bold text-primary mb-2 sticky top-16 z-10 bg-background py-1">{group}</h4>
                                            {exercises.map(ex => <button key={ex.id} onClick={() => addExerciseToRoutine(ex)} className="w-full text-left bg-surface p-3 rounded-lg mb-2 hover:bg-surface/80 transition-colors">{ex.name}</button>)}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-none pt-4"><button onClick={() => setIsPickerOpen(false)} className="w-full bg-gray-600 p-3 rounded-lg">Cancel</button></div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-3xl font-bold text-center mb-4">Your Routines</h1>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search routines..."
                className="w-full bg-surface p-3 rounded-lg text-text-primary placeholder-text-secondary"
            />
            {filteredRoutines.length === 0 && (
                <div className="text-center text-text-secondary py-10 bg-surface rounded-lg">
                    <p className="text-lg">No routines found.</p>
                     {routines.length > 0 && <p>Try a different search term.</p>}
                </div>
            )}
            {filteredRoutines.map(routine => {
                const nextVariantName = routine.variants[routine.nextVariantIndex || 0]?.name || 'A';
                const totalExercises = routine.variants.reduce((sum, v) => sum + v.exercises.length, 0);

                return (
                    <div key={routine.id} className="bg-surface p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold">{routine.name}</h3>
                        <p className="text-text-secondary text-sm mb-4">{totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'} across {routine.variants.length} {routine.variants.length === 1 ? 'variant' : 'variants'}</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => handleStartWorkout(routine)} className="flex-1 bg-primary hover:bg-primary/90 transition-colors p-2 rounded-lg font-semibold">Start Workout ({nextVariantName})</button>
                            <button onClick={() => { setIsEditing(routine); setActiveVariantIndex(0); }} className="flex-1 bg-gray-600 hover:bg-gray-500 transition-colors p-2 rounded-lg">Edit</button>
                            <button onClick={() => handleDeleteRoutine(routine.id)} className="bg-red-600 hover:bg-red-500 transition-colors p-2 rounded-lg">Delete</button>
                        </div>
                    </div>
                );
            })}
            <button onClick={handleCreateNew} className="w-full bg-tertiary p-3 rounded-lg font-bold text-lg mt-6 hover:bg-tertiary/90 transition-shadow shadow-lg hover:shadow-xl">
                Create New Routine
            </button>
        </div>
    );
};

export default Routines;