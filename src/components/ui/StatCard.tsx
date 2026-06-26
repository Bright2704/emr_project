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
      iconColor: 'text-[#1e3a5f]',
      progressColor: 'bg-[#1e3a5f]',
    },
    success: {
      iconColor: 'text-green-600',
      progressColor: 'bg-green-500',
    },
    warning: {
      iconColor: 'text-orange-500',
      progressColor: 'bg-orange-500',
    },
    danger: {
      iconColor: 'text-red-600',
      progressColor: 'bg-red-500',
    },
    info: {
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-500',
    },
  };

  const IconComponent = Icon || (variant === 'warning' ? AlertTriangle : variant === 'danger' ? LogOut : ArrowRight);

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-5 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold', variantStyles[variant].iconColor)}>
              {value}
            </span>
            {subtitle && <span className="text-gray-500 text-sm">{subtitle}</span>}
          </div>
        </div>
        <div className={cn('p-2', variantStyles[variant].iconColor)}>
          <IconComponent size={24} />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all', variantStyles[variant].progressColor)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
