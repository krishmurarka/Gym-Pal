import React from 'react';

const DragHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <circle cx="10" cy="6" r="1.5" />
    <circle cx="14" cy="6" r="1.5" />
    <circle cx="10" cy="12" r="1.5" />
    <circle cx="14" cy="12" r="1.5" />
    <circle cx="10" cy="18" r="1.5" />
    <circle cx="14" cy="18" r="1.5" />
  </svg>
);

export default DragHandleIcon;
