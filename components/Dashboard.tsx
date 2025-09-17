
import React, { useMemo, useState, useRef } from 'react';
import { WorkoutSession, MuscleGroup } from '../types';
import ProgressChart from './ProgressChart';
import MuscleDistributionChart from './MuscleDistributionChart';
import RoutineLogbook from './RoutineLogbook';

type Tab = 'Overview' | 'Calendar' | 'Progress' | 'Logbook';
const TABS: Tab[] = ['Overview', 'Calendar', 'Progress', 'Logbook'];

interface DashboardProps {
    sessions: WorkoutSession[];
    setSessions: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
    onEditSession: (session: WorkoutSession) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, setSessions, onEditSession }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const sortedSessions = useMemo(() => 
    [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [sessions]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = TABS.indexOf(activeTab);
      let nextIndex;
      if (isLeftSwipe) { // Swiped left, go to next tab
        nextIndex = (currentIndex + 1) % TABS.length;
      } else { // Swiped right, go to previous tab
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      }
      setActiveTab(TABS[nextIndex]);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };


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
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        days.push(
            <div key={day} className={`p-2 text-sm rounded-xl h-24 flex flex-col bg-background/50 relative`}>
                <span className={`font-bold text-center ${isToday ? 'bg-secondary text-background rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
                {daySessions && (
                    <div className="flex-1 overflow-y-auto text-xs mt-1 space-y-1">
                        {daySessions.map(s => <p key={s.id} className="bg-primary/50 text-white rounded px-1 truncate text-[10px]">{s.routineName}</p>)}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-surface p-4 rounded-3xl border border-border">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-border">&lt;</button>
                <h3 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-border">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-text-secondary text-xs mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">{days}</div>
        </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-surface p-6 rounded-3xl border border-border border-t-2 border-t-primary">
                <p className="text-text-secondary text-sm">Total Workouts</p>
                <p className="text-4xl font-bold text-primary">{stats.totalWorkouts}</p>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-border border-t-2 border-t-secondary">
                <p className="text-text-secondary text-sm">Total Volume (kg)</p>
                <p className="text-4xl font-bold text-secondary">{stats.totalVolume.toLocaleString()}</p>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-border border-t-2 border-t-primary">
                <p className="text-text-secondary text-sm">Workouts This Month</p>
                <p className="text-4xl font-bold text-primary">{stats.workoutsThisMonth}</p>
              </div>
            </div>
            <div className="bg-surface p-4 rounded-3xl border border-border">
              <h2 className="text-xl font-bold mb-4 text-center">Recent Activity</h2>
              {sortedSessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex justify-between items-center border-b border-border py-3 last:border-b-0">
                    <div>
                        <p className="font-semibold">{session.routineName}</p>
                        <p className="text-text-secondary text-xs">{session.variantName ? `Variant ${session.variantName}` : ''}</p>
                    </div>
                    <p className="text-text-secondary text-sm">{new Date(session.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface p-4 rounded-3xl border border-border">
              <h2 className="text-xl font-bold mb-4 text-center">Muscle Distribution</h2>
              <MuscleDistributionChart data={muscleData} />
            </div>
          </div>
        );
      case 'Calendar':
        return renderCalendar();
      case 'Progress':
        return (
          <div className="bg-surface p-4 rounded-3xl border border-border">
            <h2 className="text-xl font-bold mb-4 text-center">Exercise Progress</h2>
            <ProgressChart sessions={sessions} />
          </div>
        );
      case 'Logbook':
        return <RoutineLogbook sessions={sessions} setSessions={setSessions} onEditSession={onEditSession} />;
      default: return null;
    }
  };

  if (sessions.length === 0) {
    return (
        <div className="p-6 text-center text-text-secondary flex flex-col justify-center items-center relative" style={{ minHeight: 'calc(100vh - 6rem)' }}>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Welcome to FGym!</h1>
            <p className="text-lg max-w-md mt-2">
                Ready to build a stronger you? 💪
                <br />
                Select a routine, crush your first workout, and watch this space fill with your achievements!
            </p>
            <p className="absolute bottom-[-1.5rem] left-0 right-0 text-center text-xs text-text-secondary">
                Made by Krish Murarka 💙
            </p>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto relative" style={{ minHeight: 'calc(100vh - 6rem)', paddingBottom: '3rem' }}>
      <h1 className="text-4xl font-bold text-center text-text-primary">Dashboard</h1>
      
      <div className="flex justify-center bg-surface p-1 rounded-full mx-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 font-semibold rounded-full transition-colors text-sm w-full whitespace-nowrap ${activeTab === tab ? 'bg-primary text-background shadow-md shadow-primary/30' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        key={activeTab}
        className="animate-fade-in"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {renderContent()}
      </div>

      <p className="absolute bottom-[-1.5rem] left-0 right-0 text-center text-xs text-text-secondary">
        Made by Krish Murarka 💙
      </p>
    </div>
  );
};

export default Dashboard;
