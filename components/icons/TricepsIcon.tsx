import React from 'react';

const TricepsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75H14.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75v16.5h4.5V3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c-1.5 0-1.5 3 0 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75c1.5 0 1.5 3 0 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v7.5" />
    </svg>
);

export default TricepsIcon;
