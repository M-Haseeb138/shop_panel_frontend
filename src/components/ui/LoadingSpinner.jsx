// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'black', text = '' }) => {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const colorClasses = {
    black: 'border-black border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif" }}>
          {text}
        </p>
      )}
    </div>
  );
};

// Ultra-fast inline spinner for immediate feedback
export const InlineSpinner = ({ size = 'sm', color = 'black' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-1',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
  };

  const colorClasses = {
    black: 'border-black border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;