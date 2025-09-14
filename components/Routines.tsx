import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Routine, Exercise, RoutineExercise, MuscleGroup, Equipment } from '../types';
import { useExercises } from '../hooks/useExercises';

interface RoutinesProps {
    onStartWorkout: (routine: Routine) => void;
}

const Routines: React.FC<RoutinesProps> = ({ onStartWorkout }) => {
    const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', []);
    const [isEditing, setIsEditing] = useState<Routine | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: MuscleGroup.Chest, equipment: Equipment.Barbell });
    const [searchQuery, setSearchQuery] = useState('');
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    const { allExercises, setCustomExercises, findExerciseById } = useExercises();

    // State for exercise picker
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');

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
        setIsEditing({ id: crypto.randomUUID(), name: '', exercises: [] });
        setIsNameInvalid(false);
    };

    const handleDeleteRoutine = (id: string) => {
        setRoutines(routines.filter(r => r.id !== id));
    };
    
    const addExerciseToRoutine = (exercise: Exercise) => {
        if (isEditing && !isEditing.exercises.some(e => e.exerciseId === exercise.id)) {
            const newRoutineExercise: RoutineExercise = {
                exerciseId: exercise.id,
                sets: [{ id: crypto.randomUUID(), reps: 10, weight: 20 }], // Start with one default set
            };
            setIsEditing(prev => ({ ...prev!, exercises: [...prev!.exercises, newRoutineExercise] }));
        }
        setIsPickerOpen(false);
        setExerciseSearch('');
        setEquipmentFilter('all');
    };

    const removeExerciseFromRoutine = (exerciseId: string) => {
        if (isEditing) {
            setIsEditing({ ...isEditing, exercises: isEditing.exercises.filter(e => e.exerciseId !== exerciseId) });
        }
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
        if (!isEditing) return;
        const numValue = field === 'weight' ? parseFloat(value) : parseInt(value, 10);
        
        const updatedExercises = [...isEditing.exercises];
        const targetSet = updatedExercises[exIndex].sets[setIndex];
        
        if (field === 'reps') {
            targetSet.reps = Math.min(50, Math.max(1, isNaN(numValue) ? 1 : numValue));
        } else {
            targetSet.weight = Math.min(1000, Math.max(0, isNaN(numValue) ? 0 : numValue));
        }

        setIsEditing({ ...isEditing, exercises: updatedExercises });
    };

    const addSetToExercise = (exIndex: number) => {
        if (!isEditing) return;
        const updatedExercises = [...isEditing.exercises];
        const targetExercise = updatedExercises[exIndex];
        const lastSet = targetExercise.sets[targetExercise.sets.length - 1] || { reps: 10, weight: 20 };
        targetExercise.sets.push({ id: crypto.randomUUID(), ...lastSet });
        setIsEditing({ ...isEditing, exercises: updatedExercises });
    };

    const removeSetFromExercise = (exIndex: number, setIndex: number) => {
        if (!isEditing) return;
        const updatedExercises = [...isEditing.exercises];
        updatedExercises[exIndex].sets.splice(setIndex, 1);
        setIsEditing({ ...isEditing, exercises: updatedExercises });
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

    const filteredExercises = useMemo(() => {
        const lowerCaseSearch = exerciseSearch.toLowerCase();
        return allExercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(lowerCaseSearch) || 
                                  ex.muscleGroup.toLowerCase().includes(lowerCaseSearch);
            const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
            return matchesSearch && matchesEquipment;
        });
    }, [allExercises, exerciseSearch, equipmentFilter]);

    const groupedExercises = useMemo(() => {
        return filteredExercises.reduce((acc, ex) => {
            (acc[ex.muscleGroup] = acc[ex.muscleGroup] || []).push(ex);
            return acc;
        }, {} as Record<string, Exercise[]>);
    }, [filteredExercises]);

    const filteredRoutines = routines.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isEditing) {
        return (
            <div className="p-4">
                <h2 className="text-3xl font-bold mb-6 text-center">{isEditing.id.length > 20 ? 'Create Routine' : 'Edit Routine'}</h2>
                <input
                    type="text"
                    value={isEditing.name}
                    onChange={(e) => {
                        setIsEditing({ ...isEditing, name: e.target.value });
                        if (isNameInvalid) setIsNameInvalid(false);
                    }}
                    placeholder="Routine Name (e.g., Push Day)"
                    className={`w-full bg-surface p-3 rounded-lg mb-6 text-lg text-text-primary placeholder-text-secondary transition-all ${isNameInvalid ? 'border-2 border-red-500' : 'border-2 border-transparent focus:border-primary'}`}
                />

                <div className="space-y-4 mb-6">
                    {isEditing.exercises.map((exConfig, exIndex) => {
                        const exercise = findExerciseById(exConfig.exerciseId);
                        if (!exercise) return null;
                        return (
                            <div key={exConfig.exerciseId} className="bg-surface/80 p-4 rounded-lg space-y-3 shadow-md">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-lg text-text-primary">{exercise.name}</h4>
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

                <button onClick={() => setIsPickerOpen(true)} className="w-full bg-primary/20 text-primary p-3 rounded-lg mb-4 font-semibold hover:bg-primary/30 transition-colors">Add Exercise</button>
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
                                            <button key={ex.id} onClick={() => addExerciseToRoutine(ex)} className="w-full text-left bg-surface p-3 rounded-lg mb-2 hover:bg-surface/80 transition-colors">
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
            {filteredRoutines.map(routine => (
                <div key={routine.id} className="bg-surface p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold">{routine.name}</h3>
                    <p className="text-text-secondary text-sm mb-4">{routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'}</p>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => onStartWorkout(routine)} className="flex-1 bg-primary hover:bg-primary/90 transition-colors p-2 rounded-lg font-semibold">Start Workout</button>
                        <button onClick={() => setIsEditing(routine)} className="flex-1 bg-gray-600 hover:bg-gray-500 transition-colors p-2 rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteRoutine(routine.id)} className="bg-red-600 hover:bg-red-500 transition-colors p-2 rounded-lg">Delete</button>
                    </div>
                </div>
            ))}
            <button onClick={handleCreateNew} className="w-full bg-tertiary p-3 rounded-lg font-bold text-lg mt-6 hover:bg-tertiary/90 transition-shadow shadow-lg hover:shadow-xl">
                Create New Routine
            </button>
        </div>
    );
};

export default Routines;