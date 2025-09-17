import React from 'react';

const LegsDayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <circle cx="12" cy="6" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l-3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15l-2 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l2 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20h12" />
    </svg>
);

export default LegsDayIcon;
