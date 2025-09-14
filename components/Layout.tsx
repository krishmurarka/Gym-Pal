import React from 'react';
import { Page } from '../types';
import ChartIcon from './icons/ChartIcon';
import DumbbellIcon from './icons/DumbbellIcon';

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
    page: Page;
    label: string;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, label, currentPage, setCurrentPage, children }) => (
    <button
        onClick={() => setCurrentPage(page)}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            currentPage === page ? 'text-primary' : 'text-text-secondary hover:text-white'
        }`}
        aria-label={`Go to ${label}`}
        aria-current={currentPage === page ? 'page' : undefined}
    >
        {children}
        <span className="text-xs font-medium">{label}</span>
    </button>
);


const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <p className="text-center text-xs text-text-secondary py-1 bg-background italic">
          Made by Krish Murarka <span className="not-italic">💙</span>
      </p>
      <div className="bg-surface/80 backdrop-blur-sm border-t border-gray-800 shadow-2xl">
        <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
            <NavItem page={Page.Dashboard} label="Dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage}>
                <ChartIcon className="w-6 h-6" />
            </NavItem>
            <NavItem page={Page.Routines} label="Routines" currentPage={currentPage} setCurrentPage={setCurrentPage}>
                <DumbbellIcon className="w-6 h-6" />
            </NavItem>
        </nav>
      </div>
    </footer>
  );
};

export default Layout;