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
      iconBg: 'bg-[#002d73]',
      iconColor: 'text-white',
      valueColor: 'text-[#002d73]',
      progressColor: 'bg-[#002d73]',
    },
    success: {
      iconBg: 'bg-green-600',
      iconColor: 'text-white',
      valueColor: 'text-green-600',
      progressColor: 'bg-green-500',
    },
    warning: {
      iconBg: 'bg-yellow-500',
      iconColor: 'text-white',
      valueColor: 'text-yellow-600',
      progressColor: 'bg-yellow-500',
    },
    danger: {
      iconBg: 'bg-red-600',
      iconColor: 'text-white',
      valueColor: 'text-red-600',
      progressColor: 'bg-red-500',
    },
    info: {
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      valueColor: 'text-blue-600',
      progressColor: 'bg-blue-500',
    },
  };

  const IconComponent = Icon || (variant === 'warning' ? AlertTriangle : variant === 'danger' ? LogOut : ArrowRight);

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-5',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold', variantStyles[variant].valueColor)}>
              {value}
            </span>
            {subtitle && <span className="text-gray-400 text-sm">{subtitle}</span>}
          </div>
        </div>
        <div className={cn('p-2 rounded-lg', variantStyles[variant].iconBg)}>
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
