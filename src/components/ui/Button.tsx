import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};