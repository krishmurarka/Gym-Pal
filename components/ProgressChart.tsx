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
          <p className="intro text-primary font-semibold">{`Total Volume: ${point.totalVolume.toFixed(0)} kg`}</p>
          <p className="desc text-text-secondary">{`${point.totalSets} sets, ${point.totalReps} total reps`}</p>
          <p className="desc text-text-secondary">{`Avg. Weight: ${point.avgWeight.toFixed(1)} kg`}</p>
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
        routines.forEach(routine => {
            routine.exercises.forEach(ex => routineExerciseIds.add(ex.exerciseId));
        });
        return allExercises.filter(ex => routineExerciseIds.has(ex.id));
    }, [routines, allExercises]);

    useEffect(() => {
        if (trackableExercises.length > 0 && !trackableExercises.some(ex => ex.id === selectedExerciseId)) {
            setSelectedExerciseId(trackableExercises[0].id);
        } else if (trackableExercises.length === 0) {
            setSelectedExerciseId('');
        }
    }, [trackableExercises, selectedExerciseId]);

    const chartData = useMemo(() => {
        if (!selectedExerciseId || sessions.length === 0) return [];

        // Aggregate data by day to handle multiple sessions on the same day correctly
        const dailyData = new Map<string, { totalVolume: number; totalReps: number; totalSets: number; date: Date }>();

        sessions.forEach(session => {
            const exerciseData = session.exercises.find(ex => ex.exerciseId === selectedExerciseId);
            if (exerciseData && exerciseData.sets.length > 0) {
                const dateKey = new Date(session.date).toISOString().split('T')[0];
                
                const sessionVolume = exerciseData.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                const sessionReps = exerciseData.sets.reduce((sum, set) => sum + set.reps, 0);
                const sessionSets = exerciseData.sets.length;

                if (dailyData.has(dateKey)) {
                    const existing = dailyData.get(dateKey)!;
                    existing.totalVolume += sessionVolume;
                    existing.totalReps += sessionReps;
                    existing.totalSets += sessionSets;
                } else {
                    dailyData.set(dateKey, {
                        totalVolume: sessionVolume,
                        totalReps: sessionReps,
                        totalSets: sessionSets,
                        date: new Date(session.date),
                    });
                }
            }
        });

        return Array.from(dailyData.values())
            .map(data => {
                const avgWeight = data.totalReps > 0 ? data.totalVolume / data.totalReps : 0;
                return {
                    date: data.date,
                    displayDate: data.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    totalVolume: data.totalVolume,
                    totalSets: data.totalSets,
                    totalReps: data.totalReps,
                    avgWeight,
                };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
            
    }, [sessions, selectedExerciseId]);

    if (sessions.length === 0) return null;

    if (trackableExercises.length === 0) {
        return (
            <div className="text-center text-text-secondary h-[300px] flex items-center justify-center">
                <p>Create a routine and add exercises to it to start tracking your progress.</p>
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
                        <YAxis dataKey="totalVolume" stroke="#8E8E93" unit="kg" domain={['auto', 'auto']} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="totalVolume" stroke="#30D158" activeDot={{ r: 8 }} name="Total Volume (kg)" dot={{ r: 4 }} />
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