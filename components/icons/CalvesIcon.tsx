import React from 'react';

const CalvesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21V12.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 21V12.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75c-1.5 0-2.25.75-2.25 2.25s.75 3 2.25 3h4.5c1.5 0 2.25-.75 2.25-2.25s-.75-3-2.25-3h-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75V9a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21h7.5" />
    </svg>
);

export default CalvesIcon;
