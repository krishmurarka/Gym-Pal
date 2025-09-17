import React from 'react';

const BicepsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V7.5a3.75 3.75 0 00-7.5 0v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5a3.75 3.75 0 01-7.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5s.75 3 3.75 3 3.75-3 3.75-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15v5.25a.75.75 0 00.75.75h6a.75.75 0 00.75-.75V15" />
    </svg>
);

export default BicepsIcon;
