import React from 'react';
import { Page } from '../types';
import HomeIcon from './icons/HomeIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';

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
        className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 rounded-lg ${
            currentPage === page ? 'bg-surface text-primary' : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-label={`Go to ${label}`}
        aria-current={currentPage === page ? 'page' : undefined}
    >
        {children}
        <span className="text-xs font-medium mt-1">{label}</span>
    </button>
);


const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <nav className="flex justify-around items-center h-16 max-w-lg mx-auto px-4 gap-2">
          <NavItem page={Page.Dashboard} label="Dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage}>
              <HomeIcon className="w-6 h-6" />
          </NavItem>
          <NavItem page={Page.Routines} label="Routines" currentPage={currentPage} setCurrentPage={setCurrentPage}>
              <ClipboardListIcon className="w-6 h-6" />
          </NavItem>
      </nav>
    </footer>
  );
};

export default Layout;