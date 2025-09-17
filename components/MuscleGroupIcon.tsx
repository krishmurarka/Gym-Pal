import React from 'react';
import { MuscleGroup } from '../types';

import ChestIcon from './icons/ChestIcon';
import BackIcon from './icons/BackIcon';
import LegsIcon from './icons/LegsIcon';
import ShouldersIcon from './icons/ShouldersIcon';
import BicepsIcon from './icons/BicepsIcon';
import TricepsIcon from './icons/TricepsIcon';
import AbsIcon from './icons/AbsIcon';
import ForearmsIcon from './icons/ForearmsIcon';
import CalvesIcon from './icons/CalvesIcon';
import GlutesIcon from './icons/GlutesIcon';
import DumbbellIcon from './icons/DumbbellIcon'; // Fallback

interface MuscleGroupIconProps extends React.SVGProps<SVGSVGElement> {
    muscleGroup: MuscleGroup;
}

const MuscleGroupIcon: React.FC<MuscleGroupIconProps> = ({ muscleGroup, ...props }) => {
    switch (muscleGroup) {
        case MuscleGroup.Chest:
            return <ChestIcon {...props} />;
        case MuscleGroup.Back:
            return <BackIcon {...props} />;
        case MuscleGroup.Legs:
            return <LegsIcon {...props} />;
        case MuscleGroup.Shoulders:
            return <ShouldersIcon {...props} />;
        case MuscleGroup.Biceps:
            return <BicepsIcon {...props} />;
        case MuscleGroup.Triceps:
            return <TricepsIcon {...props} />;
        case MuscleGroup.Abs:
            return <AbsIcon {...props} />;
        case MuscleGroup.Forearms:
            return <ForearmsIcon {...props} />;
        case MuscleGroup.Calves:
            return <CalvesIcon {...props} />;
        case MuscleGroup.Glutes:
            return <GlutesIcon {...props} />;
        default:
            return <DumbbellIcon {...props} />;
    }
};

export default MuscleGroupIcon;
