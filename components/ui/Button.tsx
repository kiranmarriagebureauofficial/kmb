import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  const variantClasses = {
    // Primary = deep maroon with ivory text
    primary:
      'bg-[#800F2F] text-[#F8F5F0] hover:bg-[#660A22] active:bg-[#52061A] shadow-sm border border-[#96163A]',
    // Secondary = ivory with maroon border
    secondary:
      'bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F] hover:bg-[#F8F5F0] active:bg-[#E5DFD5]',
    // Accent/Premium = gold with maroon text
    accent:
      'bg-[#D4AF37] text-[#660A22] hover:bg-[#F0D58A] active:bg-[#B88B22] font-semibold shadow-sm border border-[#B88B22]',
    // Danger = lighter maroon #A3182E
    danger:
      'bg-[#A3182E] text-[#F8F5F0] hover:bg-[#96163A] active:bg-[#800F2F] shadow-sm',
    // Ghost
    ghost:
      'bg-transparent text-[#800F2F] hover:bg-[#E5DFD5]/40 active:bg-[#E5DFD5]',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

