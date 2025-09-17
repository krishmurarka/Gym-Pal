import React from 'react';

const LegsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3h4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v11.25a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 14.25V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 14.25V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c2.25 0 4.5-1.5 4.5-3.75" />
    </svg>
);

export default LegsIcon;
