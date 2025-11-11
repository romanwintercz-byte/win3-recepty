import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        {...props}
    >
        <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Chef hat */}
            <path d="M50 35 C 30 35, 25 20, 40 15 S 60 15, 75 20 S 70 35, 50 35 Z" fill="currentColor" stroke="none" />
            <rect x="25" y="32" width="50" height="10" rx="5" fill="currentColor" stroke="none" />
            
            {/* "W" for Win3 */}
            <path d="M30 55 L 40 75 L 50 60 L 60 75 L 70 55" />
        </g>
    </svg>
);
