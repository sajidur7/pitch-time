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
    hero: 'text-4xl sm:text-6xl lg:text-7xl',
  };

  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-[-0.04em] text-[#000000] select-none leading-none ${sizeClasses[size]} ${className}`}
    >
      <span>pitch time</span>
      <span className="text-[#0075de] font-extrabold ml-[0.5px]">.</span>
    </span>
  );
}
