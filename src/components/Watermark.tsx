'use client';

import React from 'react';

interface WatermarkProps {
  text?: string;
}

export function Watermark({ text = 'PITCH TIME' }: WatermarkProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
    >
      <span className="watermark-ledger select-none uppercase tracking-[-0.04em] whitespace-nowrap opacity-[0.035] text-black">
        {text}
      </span>
    </div>
  );
}
