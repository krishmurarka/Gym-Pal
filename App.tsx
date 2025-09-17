
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Routines from './components/Routines';
import ActiveWorkout from './components/ActiveWorkout';
import EditSession from './components/EditSession';
import { Page, Routine, WorkoutSession, RoutineVariant } from './types';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>('workoutSessions', []);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeWorkout, setActiveWorkout] = useState<{ routine: Routine, variant: RoutineVariant } | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);


  const startWorkout = (workout: { routine: Routine, variant: RoutineVariant }) => {
    setActiveWorkout(workout);
    setCurrentPage(Page.ActiveWorkout);
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    setCurrentPage(Page.Dashboard);
  };
  
  const startEditingSession = (session: WorkoutSession) => {
    setSessionToEdit(session);
    setCurrentPage(Page.EditSession);
  };

  const finishEditingSession = (updatedSession?: WorkoutSession) => {
    if (updatedSession) {
        setSessions(prevSessions =>
            prevSessions.map(s => (s.id === updatedSession.id ? updatedSession : s))
        );
    }
    setSessionToEdit(null);
    setCurrentPage(Page.Dashboard);
  };


  const renderContent = () => {
    if (sessionToEdit) {
      return <EditSession session={sessionToEdit} onFinish={finishEditingSession} />;
    }
    if (activeWorkout) {
        return <ActiveWorkout routine={activeWorkout.routine} variant={activeWorkout.variant} onFinish={finishWorkout} sessions={sessions} setSessions={setSessions} />;
    }
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard sessions={sessions} setSessions={setSessions} onEditSession={startEditingSession} />;
      case Page.Routines:
        return <Routines onStartWorkout={startWorkout} />;
      case Page.ActiveWorkout: // Fallback in case activeWorkout is null
      case Page.EditSession: // Fallback in case sessionToEdit is null
        return <Routines onStartWorkout={startWorkout} />;
      default:
        return <Dashboard sessions={sessions} setSessions={setSessions} onEditSession={startEditingSession} />;
    }
  };

  const showNav = !activeWorkout && !sessionToEdit;

  return (
    <div className="min-h-screen bg-background font-sans">
        <main className={showNav ? 'pb-28' : ''}>
            {renderContent()}
        </main>
        {showNav && (
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}
    </div>
  );
};

export default App;
