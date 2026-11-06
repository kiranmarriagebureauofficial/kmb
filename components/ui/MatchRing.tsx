'use client';

import React from 'react';

interface MatchRingProps {
  score: number; // 0 to 100
  size?: number; // width & height in px
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function MatchRing({
  score,
  size = 56,
  strokeWidth = 5,
  showLabel = true,
  className = '',
}: MatchRingProps) {
  // Never show below 50% according to specification
  if (score < 50) {
    return null;
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // 75%+ is gold, 50-74% is maroon
  const isPremium = score >= 75;
  const ringColor = isPremium ? '#D9A93F' : '#5A0A14';
  const trackColor = '#DECEAC'; // ivory-dark track

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`${score}% Match Compatibility (${isPremium ? 'Premium' : 'Standard'})`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transform"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-serif font-bold leading-none tracking-tight"
            style={{
              fontSize: Math.max(10, Math.round(size * 0.28)),
              color: isPremium ? '#B08626' : '#5A0A14',
            }}
          >
            {score}%
          </span>
        </div>
      )}
    </div>
  );
}

