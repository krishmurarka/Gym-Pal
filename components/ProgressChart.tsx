import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutSession, Exercise, Routine } from '../types';
import { useExercises } from '../hooks/useExercises';
import useLocalStorage from '../hooks/useLocalStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
    sessions: WorkoutSession[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-surface p-3 border border-gray-700 rounded-lg shadow-lg text-sm">
          <p className="label font-bold text-text-primary mb-1">{`Date: ${label}`}</p>
          <p className="intro text-primary font-semibold">{`Peak Set Volume: ${point.maxVolume.toFixed(0)}`}</p>
          <p className="desc text-text-secondary">{`Strongest set: ${point.details}`}</p>
        </div>
      );
    }
    return null;
};

const ProgressChart: React.FC<ProgressChartProps> = ({ sessions }) => {
    const { allExercises } = useExercises();
    const [routines] = useLocalStorage<Routine[]>('routines', []);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

    const trackableExercises = useMemo(() => {
        const routineExerciseIds = new Set<string>();
        // Also include exercises that have been performed, even if not in a routine anymore
        sessions.forEach(session => {
            session.exercises.forEach(ex => routineExerciseIds.add(ex.exerciseId));
        });
        // Fix: Iterate through variants to get exercises as `routine.exercises` does not exist.
        routines.forEach(routine => {
            if (routine.variants) {
                routine.variants.forEach(variant => {
                    variant.exercises.forEach(ex => routineExerciseIds.add(ex.exerciseId));
                });
            }
        });
        
        return allExercises
            .filter(ex => routineExerciseIds.has(ex.id))
            .sort((a,b) => a.name.localeCompare(b.name));

    }, [routines, allExercises, sessions]);

    useEffect(() => {
        if (trackableExercises.length > 0 && !trackableExercises.some(ex => ex.id === selectedExerciseId)) {
            setSelectedExerciseId(trackableExercises[0].id);
        } else if (trackableExercises.length === 0) {
            setSelectedExerciseId('');
        }
    }, [trackableExercises, selectedExerciseId]);

    const chartData = useMemo(() => {
        if (!selectedExerciseId || sessions.length === 0) return [];

        const dailyMaxes = new Map<string, { maxVolumeSet: number; date: Date; details: string }>();

        sessions.forEach(session => {
            const exerciseData = session.exercises.find(ex => ex.exerciseId === selectedExerciseId);
            if (exerciseData && exerciseData.sets.length > 0) {
                const dateKey = new Date(session.date).toISOString().split('T')[0];

                let maxSetVolume = 0;
                let maxSetDetails = '';
                exerciseData.sets.forEach(set => {
                    const currentSetVolume = set.weight * set.reps;
                    if (currentSetVolume > maxSetVolume) {
                        maxSetVolume = currentSetVolume;
                        maxSetDetails = `${set.weight}kg x ${set.reps} reps`;
                    }
                });

                if (dailyMaxes.has(dateKey)) {
                    const existing = dailyMaxes.get(dateKey)!;
                    if (maxSetVolume > existing.maxVolumeSet) {
                        existing.maxVolumeSet = maxSetVolume;
                        existing.details = maxSetDetails;
                    }
                } else {
                    dailyMaxes.set(dateKey, {
                        maxVolumeSet: maxSetVolume,
                        date: new Date(session.date),
                        details: maxSetDetails,
                    });
                }
            }
        });

        return Array.from(dailyMaxes.values())
            .map(data => ({
                date: data.date,
                displayDate: data.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                maxVolume: data.maxVolumeSet,
                details: data.details,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
            
    }, [sessions, selectedExerciseId]);

    if (sessions.length === 0) return null;

    if (trackableExercises.length === 0) {
        return (
            <div className="text-center text-text-secondary h-[300px] flex items-center justify-center">
                <p>Create a routine and perform a workout to start tracking your progress.</p>
            </div>
        );
    }

    return (
        <div>
            <select
                value={selectedExerciseId}
                onChange={e => setSelectedExerciseId(e.target.value)}
                className="w-full bg-background p-2 rounded-lg mb-4 border border-surface"
                aria-label="Select an exercise to view progress"
            >
                {trackableExercises.map((ex: Exercise) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
            </select>
            
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="displayDate" stroke="#8E8E93" />
                        <YAxis dataKey="maxVolume" stroke="#8E8E93" unit="" domain={['auto', 'auto']} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="maxVolume" stroke="#30D158" activeDot={{ r: 8 }} name="Max Set Volume (kg*reps)" dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center text-text-secondary h-[300px] flex items-center justify-center">
                    <p>No data for this exercise yet. Complete a workout with it to see your progress.</p>
                </div>
            )}
        </div>
    );
};

export default ProgressChart;