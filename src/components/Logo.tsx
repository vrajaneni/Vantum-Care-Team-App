import React from 'react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10", 
  iconClassName = "w-6 h-6",
  variant = 'default'
}) => {
  return (
    <div className={`${className} ${variant === 'default' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-white shadow-white/10'} rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative group`}>
      <div className={`absolute inset-0 bg-gradient-to-tr ${variant === 'default' ? 'from-white/30' : 'from-emerald-500/10'} to-transparent`} />
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`${iconClassName} ${variant === 'default' ? 'text-white' : 'text-emerald-500'} relative z-10`}
      >
        {/* Stylized V with a pulse line */}
        <path d="M4 8L12 19L20 8" />
        <path d="M2 12H6L9 16L15 8L18 12H22" className="opacity-50" />
      </svg>
    </div>
  );
};

export default Logo;
