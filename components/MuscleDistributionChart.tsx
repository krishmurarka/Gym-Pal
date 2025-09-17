import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { MuscleGroup } from '../types';
import { MUSCLE_GROUP_COLORS } from '../constants';

interface MuscleData {
    name: MuscleGroup;
    value: number;
    // Fix: Add index signature to make interface compatible with recharts' data prop type.
    // The recharts library expects data objects to have a string index signature.
    [key: string]: any;
}

interface MuscleDistributionChartProps {
    data: MuscleData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface p-2 border border-border rounded-lg shadow-lg">
                <p className="label text-text-primary">{`${payload[0].name} : ${payload[0].value} exercises`}</p>
            </div>
        );
    }
    return null;
};


const MuscleDistributionChart: React.FC<MuscleDistributionChartProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-text-secondary">
                <p>No workout data available.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={MUSCLE_GROUP_COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{paddingTop: '20px', color: '#E6EDF3'}} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MuscleDistributionChart;