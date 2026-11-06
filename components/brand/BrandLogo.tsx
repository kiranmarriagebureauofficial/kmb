'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'full' | 'banner' | 'icon' | 'emblem' | 'wordmark' | 'print';
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = 'full',
  className = '',
  width,
  height,
  alt = 'Kiran Marriage Bureau',
  priority = false,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  const fileMap: Record<string, string> = {
    full: '/brand/logo-full-transparent.png',
    banner: '/brand/logo-banner.png',
    icon: '/brand/logo-icon.png',
    emblem: '/brand/logo-emblem.png',
    wordmark: '/brand/logo-full-transparent.png',
    print: '/brand/logo-print.png',
  };

  const defaultDimensions: Record<string, { w: number; h: number }> = {
    full: { w: 150, h: 150 },
    banner: { w: 240, h: 80 }, // 3:1 aspect ratio of original 2172x724
    icon: { w: 48, h: 48 },
    emblem: { w: 140, h: 140 },
    wordmark: { w: 160, h: 160 },
    print: { w: 160, h: 160 },
  };

  const src = fileMap[variant] || fileMap.full;
  const w = width || defaultDimensions[variant]?.w || 150;
  const h = height || defaultDimensions[variant]?.h || 150;

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center font-serif font-bold text-[#D4AF37] text-center ${className}`}>
        <span className="text-xl tracking-wider">KIRAN</span>
        <span className="text-[10px] uppercase tracking-widest text-[#E5DFD5]">
          Marriage Bureau
        </span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        unoptimized
        onError={() => setHasError(true)}
        className="object-contain max-h-full transition-opacity duration-200"
      />
    </div>
  );
}
