'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'full' | 'banner' | 'icon' | 'wordmark' | 'print';
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = 'banner',
  className = '',
  width,
  height,
  alt = 'Kiran Marriage Bureau',
  priority = false,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  const fileMap = {
    full: '/brand/logo-full-transparent.png',
    banner: '/brand/logo-banner.png',
    icon: '/brand/logo-icon.png',
    wordmark: '/brand/logo-wordmark.png',
    print: '/brand/logo-print.png',
  };

  const defaultDimensions = {
    full: { w: 200, h: 200 },
    banner: { w: 280, h: 80 },
    icon: { w: 48, h: 48 },
    wordmark: { w: 200, h: 50 },
    print: { w: 220, h: 90 },
  };

  const src = fileMap[variant];
  const w = width || defaultDimensions[variant].w;
  const h = height || defaultDimensions[variant].h;

  if (hasError) {
    return (
      <div className={`flex items-center gap-2 font-serif font-bold text-[#D9A93F] ${className}`}>
        <span className="text-xl tracking-wider">KIRAN</span>
        <span className="text-xs uppercase tracking-widest text-[#E9DDC3] border-l border-[#D9A93F]/40 pl-2">
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
        onError={() => setHasError(true)}
        className="object-contain max-h-full"
      />
    </div>
  );
}
