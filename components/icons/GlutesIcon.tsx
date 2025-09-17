import React from 'react';

const GlutesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9 15h.01M15 15h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75V12a6 6 0 1112 0v6.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75c0-3 2.686-5.25 6-5.25s6 2.25 6 5.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75h12" />
    </svg>
);

export default GlutesIcon;
