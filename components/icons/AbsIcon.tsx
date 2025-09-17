import React from 'react';

const AbsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5L7.5 3h9l2.25 4.5V18a2.25 2.25 0 01-2.25 2.25H7.5A2.25 2.25 0 015.25 18V7.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 11.25h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15h7.5" />
    </svg>
);

export default AbsIcon;
