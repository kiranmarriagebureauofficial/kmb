import React from 'react';

interface DividerProps {
  className?: string;
  variant?: 'simple' | 'flourish';
}

export function Divider({ className = '', variant = 'flourish' }: DividerProps) {
  if (variant === 'simple') {
    return <hr className={`border-t border-[#E5DFD5] my-4 ${className}`} />;
  }

  return (
    <div className={`relative flex items-center justify-center my-6 select-none ${className}`}>
      {/* Left line */}
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
      
      {/* Center Flourish Ornament */}
      <div className="mx-3 flex items-center gap-1 text-[#D4AF37]">
        <span className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37] bg-[#FFFFFF]" />
        <svg
          width="18"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[#D4AF37]"
        >
          <path d="M12 2C8 6 3 8 3 13a9 9 0 0 0 18 0c0-5-5-7-9-11z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 22V12" />
        </svg>
        <span className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37] bg-[#FFFFFF]" />
      </div>

      {/* Right line */}
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
    </div>
  );
}

