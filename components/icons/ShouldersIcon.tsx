import React from 'react';

const ShouldersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c-3.75 0-6-1.5-6-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c3.75 0 6-1.5 6-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 5.25v15L12 15l6 5.25v-15" />
    </svg>
);

export default ShouldersIcon;
