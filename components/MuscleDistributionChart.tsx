
import React from 'react';
import { MuscleGroup } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MUSCLE_GROUP_COLORS } from '../constants';

interface MuscleData {
    name: MuscleGroup;
    value: number;
}

interface MuscleDistributionChartProps {
    data: MuscleData[];
}

const MuscleDistributionChart: React.FC<MuscleDistributionChartProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-text-secondary">
                <p>No workout data available.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={MUSCLE_GROUP_COLORS[entry.name]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #444' }} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MuscleDistributionChart;
