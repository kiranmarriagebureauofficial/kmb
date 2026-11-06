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
      'bg-[#5A0A14] text-[#FBF4E6] hover:bg-[#420610] active:bg-[#32040B] shadow-sm border border-[#7A1424]',
    // Secondary = ivory with maroon border
    secondary:
      'bg-[#FFFDF8] text-[#5A0A14] border border-[#5A0A14] hover:bg-[#FBF4E6] active:bg-[#E9DDC3]',
    // Accent/Premium = gold with maroon text
    accent:
      'bg-[#D9A93F] text-[#420610] hover:bg-[#EBCB7C] active:bg-[#B08626] font-semibold shadow-sm border border-[#B08626]',
    // Danger = lighter maroon #8E1B2B
    danger:
      'bg-[#8E1B2B] text-[#FBF4E6] hover:bg-[#7A1424] active:bg-[#5A0A14] shadow-sm',
    // Ghost
    ghost:
      'bg-transparent text-[#5A0A14] hover:bg-[#E9DDC3]/40 active:bg-[#E9DDC3]',
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

