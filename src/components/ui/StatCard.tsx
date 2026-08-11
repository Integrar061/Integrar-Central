import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false
}) => {
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
      highlight 
        ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white border-brand-500 shadow-soft shadow-brand-500/20' 
        : 'bg-white border-slate-200/80 shadow-card hover:shadow-soft text-slate-900'
    }`}>
      {/* Background Decorator */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${highlight ? 'bg-white' : 'bg-brand-500'}`} />

      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-brand-100' : 'text-slate-500'}`}>
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${highlight ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </div>

        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            trend.isPositive 
              ? highlight ? 'bg-emerald-400/30 text-emerald-100' : 'bg-emerald-50 text-emerald-700'
              : highlight ? 'bg-rose-400/30 text-rose-100' : 'bg-rose-50 text-rose-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`text-xs mt-2 ${highlight ? 'text-brand-100' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
