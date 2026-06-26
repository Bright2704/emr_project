import { cn } from '@/lib/utils';
import { LucideIcon, ArrowRight, AlertTriangle, LogOut } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  progress?: number;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  progress,
  onClick,
}: StatCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand',
      valueColor: 'text-brand',
      progressColor: 'bg-brand',
    },
    success: {
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      progressColor: 'bg-green-500',
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      progressColor: 'bg-amber-500',
    },
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      progressColor: 'bg-red-500',
    },
    info: {
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-600',
      progressColor: 'bg-sky-500',
    },
  };

  const IconComponent = Icon || (variant === 'warning' ? AlertTriangle : variant === 'danger' ? LogOut : ArrowRight);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200/80 shadow-card p-5',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:border-gray-300 transition-[box-shadow,border-color] duration-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold tracking-tight tabular-nums', variantStyles[variant].valueColor)}>
              {value}
            </span>
            {subtitle && <span className="text-gray-400 text-sm">{subtitle}</span>}
          </div>
        </div>
        <div className={cn('p-2.5 rounded-xl', variantStyles[variant].iconBg)}>
          <IconComponent size={20} className={variantStyles[variant].iconColor} />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full', variantStyles[variant].progressColor)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
