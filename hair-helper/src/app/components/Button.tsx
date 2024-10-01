import React from 'react';

interface ButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    title: string;
    type: 'submit' | 'reset' | 'button'
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ onClick, title, type, className }) => {
    return (
        <button 
            onClick={onClick}
            type={type}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}>
            {title}
        </button>
    )
}