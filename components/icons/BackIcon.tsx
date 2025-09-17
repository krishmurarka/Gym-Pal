import React from 'react';

const BackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-3 0L6 21m9-15l4.5 15M12 6V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 21h12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3 3-4.5 7.5-4.5 15m4.5-15c3 3 4.5 7.5 4.5 15" />
    </svg>
);

export default BackIcon;
