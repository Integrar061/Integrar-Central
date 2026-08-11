import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'slate' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  icon,
  className = ''
}) => {
  const styles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
    brand: 'bg-brand-50 text-brand-700 border-brand-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/60'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border tracking-wide uppercase ${styles[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};
