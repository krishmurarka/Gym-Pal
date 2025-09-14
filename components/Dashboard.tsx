
import React, { useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { WorkoutSession, MuscleGroup } from '../types';
import ProgressChart from './ProgressChart';
import MuscleDistributionChart from './MuscleDistributionChart';
import RoutineLogbook from './RoutineLogbook';

type Tab = 'Overview' | 'Calendar' | 'Progress' | 'Logbook';

const Dashboard: React.FC = () => {
  const [sessions] = useLocalStorage<WorkoutSession[]>('workoutSessions', []);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [currentDate, setCurrentDate] = useState(new Date());

  const sortedSessions = useMemo(() => 
    [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [sessions]);

  const stats = useMemo(() => {
    const totalWorkouts = sessions.length;
    const totalVolume = sessions.reduce((acc, session) => 
      acc + session.exercises.reduce((exAcc, ex) => 
        exAcc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0), 0);
    
    const now = new Date();
    const workoutsThisMonth = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getFullYear() === now.getFullYear() && sessionDate.getMonth() === now.getMonth();
    }).length;

    return { totalWorkouts, totalVolume, workoutsThisMonth };
  }, [sessions]);

  const muscleData = useMemo(() => {
    const muscleCounts: { [key in MuscleGroup]?: number } = {};
    sessions.forEach(session => {
        session.exercises.forEach(ex => {
            muscleCounts[ex.muscleGroup] = (muscleCounts[ex.muscleGroup] || 0) + 1;
        });
    });
    return Object.entries(muscleCounts).map(([name, value]) => ({ name: name as MuscleGroup, value }));
  }, [sessions]);
  
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(session);
    });
    return map;
  }, [sessions]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-1"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const daySessions = sessionsByDate.get(dateKey);
        days.push(
            <div key={day} className={`p-1 text-sm rounded-lg h-24 flex flex-col ${daySessions ? 'bg-primary/20' : 'bg-surface/50'}`}>
                <span className={`font-bold ${new Date().toDateString() === new Date(year, month, day).toDateString() ? 'text-primary' : ''}`}>{day}</span>
                {daySessions && (
                    <div className="flex-1 overflow-y-auto text-xs mt-1">
                        {daySessions.map(s => <p key={s.id} className="bg-primary/50 text-white rounded px-1 truncate">{s.routineName}</p>)}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-surface p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                <h3 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-text-secondary text-xs mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">{days}</div>
        </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-text-secondary">Total Workouts</p>
                <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
              </div>
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-text-secondary">Total Volume (kg)</p>
                <p className="text-3xl font-bold">{stats.totalVolume.toLocaleString()}</p>
              </div>
              <div className="bg-surface p-4 rounded-lg">
                <p className="text-text-secondary">Workouts This Month</p>
                <p className="text-3xl font-bold">{stats.workoutsThisMonth}</p>
              </div>
            </div>
            <div className="bg-surface p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Recent Activity</h2>
              {sortedSessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex justify-between items-center border-b border-gray-700 py-2 last:border-b-0">
                    <p className="font-semibold">{session.routineName}</p>
                    <p className="text-text-secondary text-sm">{new Date(session.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Muscle Distribution</h2>
              <MuscleDistributionChart data={muscleData} />
            </div>
          </div>
        );
      case 'Calendar':
        return renderCalendar();
      case 'Progress':
        return (
          <div className="bg-surface p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Exercise Progress</h2>
            <ProgressChart sessions={sessions} />
          </div>
        );
      case 'Logbook':
        return <RoutineLogbook sessions={sessions} />;
      default: return null;
    }
  };

  if (sessions.length === 0) {
    return (
        <div className="p-4 text-center text-text-secondary">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Dashboard</h1>
            <p>Welcome to GymPal!</p>
            <p>Complete a workout to see your progress here.</p>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Dashboard</h1>
      
      <div className="flex justify-center border-b border-surface overflow-x-auto">
        {(['Overview', 'Calendar', 'Progress', 'Logbook'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default Dashboard;
