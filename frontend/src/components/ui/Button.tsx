import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-afro-gold to-afro-amber text-afro-950 font-bold ' +
    'hover:from-afro-amber hover:to-yellow-400 active:scale-95 ' +
    'shadow-lg shadow-afro-gold/30',
  secondary:
    'bg-white/10 text-white border border-white/20 ' +
    'hover:bg-white/18 hover:border-white/35 active:scale-95',
  ghost:
    'text-white/70 hover:text-white hover:bg-white/10 active:scale-95',
  outline:
    'border-2 border-afro-gold/60 text-afro-gold ' +
    'hover:bg-afro-gold/10 hover:border-afro-gold active:scale-95',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 text-white ' +
    'hover:from-red-500 hover:to-rose-500 active:scale-95 shadow-lg shadow-red-900/30',
  success:
    'bg-gradient-to-r from-afro-green to-emerald-500 text-white font-semibold ' +
    'hover:from-emerald-500 hover:to-emerald-400 active:scale-95 shadow-lg shadow-emerald-900/30',
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-3  py-1.5 text-xs  rounded-lg',
  md:  'px-5  py-2.5 text-sm  rounded-xl',
  lg:  'px-6  py-3   text-sm  rounded-2xl',
  xl:  'px-8  py-4   text-base rounded-2xl',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-all duration-150 select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 text-base">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
