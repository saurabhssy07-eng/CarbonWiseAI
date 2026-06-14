import React from 'react';

export default function LoadingSpinner({ size = 'md', color = 'green' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = { green: 'border-green-500', teal: 'border-teal-500', white: 'border-white' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-carbon-700 ${colors[color]} border-t-transparent animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-forest-800 border-t-green-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-forest-700 border-b-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Loading your data...</p>
      </div>
    </div>
  );
}
