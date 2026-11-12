'use client';

import React from 'react';
import { Star, User } from 'lucide-react';

interface ProfileAvatarProps {
  name?: string;
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isPremium?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ProfileAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-[11px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function ProfileAvatar({
  name,
  photoUrl,
  size = 'md',
  isPremium = false,
  className = '',
}: ProfileAvatarProps) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center font-serif font-bold border ${
        isPremium
          ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
          : 'border-[#E5DFD5]'
      } ${photoUrl ? 'bg-[#F8F5F0]' : 'bg-[#800F2F] text-[#D4AF37]'} ${sizeClass} ${className}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name || 'Client photo'}
          className="w-full h-full object-cover"
        />
      ) : initial !== '?' ? (
        <span>{initial}</span>
      ) : (
        <User className="w-1/2 h-1/2 opacity-80" />
      )}
      {isPremium && size !== 'xs' && (
        <span
          title="Premium Member"
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D4AF37] border border-white flex items-center justify-center shadow-xs"
        >
          <Star className="w-2.5 h-2.5 fill-[#800F2F] text-[#800F2F]" />
        </span>
      )}
    </div>
  );
}

/**
 * Resize and compress a selected image File into a lightweight JPEG base64 Data URL
 * suitable for localStorage persistence and jsPDF embedding.
 */
export function compressImageToDataUrl(
  file: File,
  maxDimension: number = 400,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, or WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode selected image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        // Fill pearl white background in case source PNG/WebP has transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

