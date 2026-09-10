'use client';

import React from 'react';

interface PitchTimeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export function PitchTimeLogo({ size = 'md', className = '' }: PitchTimeLogoProps) {
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    hero: 'text-5xl sm:text-7xl lg:text-8xl',
  };

  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-[-0.04em] text-black select-none leading-none ${sizeClasses[size]} ${className}`}
    >
      <span>pitch time</span>
      <span className="text-black font-extrabold ml-[1px]">.</span>
    </span>
  );
}
