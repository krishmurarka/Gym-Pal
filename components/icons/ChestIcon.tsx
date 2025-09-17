import React from 'react';

const ChestIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75V19.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5h15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5c-2.25 0-3-3-1.5-4.5L7.5 3h9l4.5 3c1.5 1.5.75 4.5-1.5 4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5s.75 9 4.5 9 4.5-9 4.5-9" />
    </svg>
);

export default ChestIcon;
