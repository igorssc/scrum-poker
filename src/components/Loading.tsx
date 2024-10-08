import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Loading = () => {
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'];

  return (
    <div className="flex justify-center items-center space-x-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={twMerge(
            'w-3 h-3 rounded-full animate-custom-bounce',
            colors[index % colors.length],
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s',
          }}
        ></div>
      ))}
    </div>
  );
};
