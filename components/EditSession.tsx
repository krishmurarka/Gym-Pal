import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WorkoutSession, PerformedExercise, Exercise, MuscleGroup, Equipment } from '../types';
import { useExercises } from '../hooks/useExercises';
import DragHandleIcon from './icons/DragHandleIcon';

interface EditSessionProps {
    session: WorkoutSession;
    onFinish: (updatedSession?: WorkoutSession) => void;
}

const EditSession: React.FC<EditSessionProps> = ({ session, onFinish }) => {
    const { allExercises, findExerciseById, setCustomExercises } = useExercises();
    
    const [editedExercises, setEditedExercises] = useState<PerformedExercise[]>(() => JSON.parse(JSON.stringify(session.exercises)));
    const [sessionDate, setSessionDate] = useState(() => new Date(session.date).toISOString().split('T')[0]);

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

    const handleSaveChanges = () => {
        const updatedSession: WorkoutSession = {
            ...session,
            date: new Date(sessionDate + 'T12:00:00.000Z').toISOString(), // Use midday to avoid timezone issues
            exercises: editedExercises.filter(ex => ex.sets.length > 0),
        };
        onFinish(updatedSession);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    const updateSet = (exIndex: number, setIndex: number, field: 'weight' | 'reps', valueStr: string) => {
        setEditedExercises(prev => {
            const newExercises = [...prev];
            const targetSet = newExercises[exIndex].sets[setIndex];
            const value = field === 'weight' ? parseFloat(valueStr) : parseInt(valueStr, 10);
            
            if (field === 'reps') targetSet[field] = Math.min(50, Math.max(1, isNaN(value) ? 1 : value));
            else targetSet[field] = Math.min(1000, Math.max(0, isNaN(value) ? 0 : value));
            
            return newExercises;
        });
    };
    
    const handleNoteChange = (exIndex: number, newNote: string) => {
        if (newNote.length > 150) return;
        setEditedExercises(prev => {
            const newExercises = JSON.parse(JSON.stringify(prev));
            newExercises[exIndex].notes = newNote;
            return newExercises;
        });
    };

    const addSet = (exIndex: number) => {
        setEditedExercises(prev => {
            const newExercises = [...prev];
            const targetExercise = newExercises[exIndex];
            const lastSet = targetExercise.sets[targetExercise.sets.length - 1] || { reps: 10, weight: 20 };
            targetExercise.sets.push({ id: crypto.randomUUID(), ...lastSet, isCompleted: true });
            return newExercises;
        });
    };

    const removeSet = (exIndex: number, setIndex: number) => {
        setEditedExercises(prev => {
            const newExercises = [...prev];
            newExercises[exIndex].sets.splice(setIndex, 1);
            return newExercises;
        });
    };

    const removeExercise = (exIndex: number) => {
        setEditedExercises(prev => prev.filter((_, index) => index !== exIndex));
    };

    const addExerciseToSession = (exercise: Exercise) => {
        if (editedExercises.some(e => e.exerciseId === exercise.id)) {
            setIsPickerOpen(false);
            return;
        }
        const newPerformedExercise: PerformedExercise = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: [{ id: crypto.randomUUID(), reps: 10, weight: 20, isCompleted: true }],
        };
        setEditedExercises(prev => [...prev, newPerformedExercise]);
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

    const performDrop = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        setEditedExercises(prev => {
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
        if (draggedIndex !== null && index !== draggedIndex) setDragOverIndex(index);
    };

    const handleDrop = (dropIndex: number) => {
        if (draggedIndex !== null) performDrop(draggedIndex, dropIndex);
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
        const itemElement = e.currentTarget.closest('[data-drag-item="true"]') as HTMLElement;
        if (!itemElement) return;
        const initialY = e.touches[0].clientY;
        setDraggedIndex(index);
        touchDragData.current = { initialY, lastY: initialY, element: itemElement, height: itemElement.offsetHeight, ticking: false };
        document.body.classList.add('dragging-active');
        itemElement.classList.add('is-dragging');
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!touchDragData.current) return;
        e.preventDefault();
        touchDragData.current.lastY = e.touches[0].clientY;
        if (!touchDragData.current.ticking) {
            window.requestAnimationFrame(() => {
                if (!touchDragData.current || draggedIndex === null) {
                    if (touchDragData.current) touchDragData.current.ticking = false;
                    return;
                }
                const { element, initialY, lastY, height } = touchDragData.current;
                const deltaY = lastY - initialY;
                element.style.transform = `translateY(${deltaY}px) scale(1.03) rotate(1deg)`;
                const overIndex = draggedIndex + Math.round(deltaY / height);
                const clampedOverIndex = Math.max(0, Math.min(editedExercises.length - 1, overIndex));
                setDragOverIndex(prev => prev === clampedOverIndex ? prev : clampedOverIndex);
                touchDragData.current.ticking = false;
            });
            touchDragData.current.ticking = true;
        }
    }, [draggedIndex, editedExercises.length]);

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
        const currentExerciseIds = new Set(editedExercises.map(e => e.exerciseId));
        return allExercises.filter(ex => {
            if (currentExerciseIds.has(ex.id)) return false;
            const matchesSearch = ex.name.toLowerCase().includes(lowerCaseSearch) || ex.muscleGroup.toLowerCase().includes(lowerCaseSearch);
            const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
            return matchesSearch && matchesEquipment;
        });
    }, [allExercises, exerciseSearch, equipmentFilter, editedExercises]);

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
                        <h1 className="text-2xl font-bold truncate pr-2">Edit Session</h1>
                        <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="bg-surface border border-border text-text-primary px-3 py-1 rounded-full text-md"/>
                    </div>
                </header>

                <main className="px-4 space-y-4 mt-4 max-w-3xl mx-auto">
                    {editedExercises.map((pEx, exIndex) => (
                        <div key={pEx.exerciseId + exIndex} data-drag-item="true" draggable onDragStart={(e) => handleDragStart(e, exIndex)} onDragOver={(e) => e.preventDefault()} onDragEnter={() => handleDragEnter(exIndex)} onDragLeave={() => setDragOverIndex(null)} onDrop={() => handleDrop(exIndex)} onDragEnd={cleanupDragState}
                            className={`bg-surface border border-border p-4 rounded-2xl shadow-md transition-all duration-200 ${draggedIndex === exIndex ? 'opacity-50 shadow-2xl scale-105' : ''} ${dragOverIndex === exIndex && dragOverIndex !== draggedIndex ? 'outline-2 outline-dashed outline-primary -outline-offset-2' : ''}`}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div onTouchStart={(e) => handleTouchStart(e, exIndex)} className="cursor-grab p-2 -ml-2"><DragHandleIcon className="w-6 h-6 text-text-secondary flex-shrink-0" /></div>
                                    <h3 className="text-lg font-bold">{pEx.exerciseName}</h3>
                                </div>
                                <button onClick={() => removeExercise(exIndex)} className="text-danger hover:brightness-125 transition-colors text-sm font-semibold">Remove</button>
                            </div>
                            <div className="mb-3">
                                <div className="relative">
                                    <textarea
                                        value={pEx.notes || ''}
                                        onChange={(e) => handleNoteChange(exIndex, e.target.value)}
                                        maxLength={150}
                                        placeholder="Add a note..."
                                        className="w-full bg-input border border-border p-2 rounded-lg text-sm resize-none focus:border-secondary transition-colors"
                                        rows={2}
                                    />
                                    <span className="absolute bottom-2 right-2 text-xs text-text-secondary">{pEx.notes?.length || 0}/150</span>
                                </div>
                            </div>
                            {pEx.sets.map((set, setIndex) => (
                                <div key={set.id} className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-text-secondary w-8 text-center">{setIndex + 1}</span>
                                    <input type="number" min="0" max="1000" value={set.weight} onChange={e => updateSet(exIndex, setIndex, 'weight', e.target.value)} onFocus={handleFocus} className="w-full bg-input border border-border p-2 rounded text-center" placeholder="kg" />
                                    <span className="text-text-secondary text-sm">kg</span>
                                    <input type="number" min="1" max="50" value={set.reps} onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)} onFocus={handleFocus} className="w-full bg-input border border-border p-2 rounded text-center" placeholder="Reps" />
                                    <span className="text-text-secondary text-sm">reps</span>
                                    <button onClick={() => removeSet(exIndex, setIndex)} className="text-danger text-2xl font-light hover:brightness-125 w-8 text-center">×</button>
                                </div>
                            ))}
                            <button onClick={() => addSet(exIndex)} className="w-full bg-secondary/20 text-secondary p-2 rounded-lg mt-2 font-semibold hover:bg-secondary/30 transition-colors text-sm">Add Set</button>
                        </div>
                    ))}
                </main>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border z-10">
                <div className="space-y-3 max-w-3xl mx-auto">
                    <button onClick={() => setIsPickerOpen(true)} className="w-full border-2 border-dashed border-border text-text-secondary p-3 rounded-lg font-semibold hover:bg-surface hover:border-solid transition-all">+ Add Exercise</button>
                    <div className="flex gap-4">
                         <button onClick={() => onFinish()} className="w-full btn btn-ghost">Cancel</button>
                         <button onClick={handleSaveChanges} className="w-full btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </footer>

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

export default EditSession;