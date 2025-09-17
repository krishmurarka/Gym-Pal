import React from 'react';

const ForearmsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25a.75.75 0 00-.75-.75h-6a.75.75 0 00-.75.75V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 01-7.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9v10.5a.75.75 0 00.75.75h6a.75.75 0 00.75-.75V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15h7.5" />
    </svg>
);

export default ForearmsIcon;
