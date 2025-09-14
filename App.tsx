
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Routines from './components/Routines';
import ActiveWorkout from './components/ActiveWorkout';
import { Page, Routine } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);

  const startWorkout = (routine: Routine) => {
    setActiveWorkout(routine);
    setCurrentPage(Page.ActiveWorkout);
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    setCurrentPage(Page.Dashboard);
  };

  const renderContent = () => {
    if (activeWorkout) {
        return <ActiveWorkout routine={activeWorkout} onFinish={finishWorkout} />;
    }
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard />;
      case Page.Routines:
        return <Routines onStartWorkout={startWorkout} />;
      case Page.ActiveWorkout: // Fallback in case activeWorkout is null
        return <Routines onStartWorkout={startWorkout} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
        <main className="pb-20">
            {renderContent()}
        </main>
        {!activeWorkout && (
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}
    </div>
  );
};

export default App;
