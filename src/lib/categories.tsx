import {
  FlaskConical,
  Radiation,
  Activity,
  Microscope,
  Stethoscope,
  Pill,
  HeartPulse,
  Syringe,
  FileSignature,
  Send,
  Folder,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Document category groups (clinical workflow ordering)
export type CategoryGroup = 'lab' | 'clinical' | 'admin';

export const CATEGORY_GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: 'lab', label: 'ผลตรวจ / วินิจฉัย' },
  { id: 'clinical', label: 'บันทึกการรักษา' },
  { id: 'admin', label: 'เอกสาร / ธุรการ' },
];

export interface CategoryMeta {
  icon: LucideIcon;
  group: CategoryGroup;
  fg: string; // icon foreground (text color)
  bg: string; // soft icon background
  ring: string; // ring/border tint
}

// Visual + grouping metadata keyed by category id.
// Decoupled from the store so admin-added categories fall back gracefully.
export const CATEGORY_META: Record<string, CategoryMeta> = {
  'cat-1': { icon: FlaskConical, group: 'lab', fg: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' },
  'cat-2': { icon: Radiation, group: 'lab', fg: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
  'cat-8': { icon: Activity, group: 'lab', fg: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200' },
  'cat-9': { icon: Microscope, group: 'lab', fg: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  'cat-3': { icon: Stethoscope, group: 'clinical', fg: 'text-sky-600', bg: 'bg-sky-50', ring: 'ring-sky-200' },
  'cat-4': { icon: Pill, group: 'clinical', fg: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' },
  'cat-6': { icon: HeartPulse, group: 'clinical', fg: 'text-teal-600', bg: 'bg-teal-50', ring: 'ring-teal-200' },
  'cat-10': { icon: Syringe, group: 'clinical', fg: 'text-fuchsia-600', bg: 'bg-fuchsia-50', ring: 'ring-fuchsia-200' },
  'cat-5': { icon: FileSignature, group: 'admin', fg: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  'cat-11': { icon: Send, group: 'admin', fg: 'text-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-200' },
  'cat-7': { icon: Folder, group: 'admin', fg: 'text-gray-500', bg: 'bg-gray-100', ring: 'ring-gray-200' },
};

const FALLBACK_META: CategoryMeta = {
  icon: FileText,
  group: 'admin',
  fg: 'text-gray-500',
  bg: 'bg-gray-100',
  ring: 'ring-gray-200',
};

export function getCategoryMeta(categoryId: string): CategoryMeta {
  return CATEGORY_META[categoryId] ?? FALLBACK_META;
}

// Soft icon chip (rounded tile with the category icon)
export function CategoryIcon({
  categoryId,
  size = 20,
  className,
}: {
  categoryId: string;
  size?: number;
  className?: string;
}) {
  const meta = getCategoryMeta(categoryId);
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center justify-center rounded-lg', meta.bg, meta.fg, className)}>
      <Icon size={size} />
    </span>
  );
}

// Inline icon + label badge — the standard way to show a category in lists/tables
export function CategoryBadge({
  categoryId,
  name,
  className,
}: {
  categoryId: string;
  name: string;
  className?: string;
}) {
  const meta = getCategoryMeta(categoryId);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        meta.bg,
        meta.fg,
        meta.ring,
        className
      )}
    >
      <Icon size={13} className="shrink-0" />
      {name}
    </span>
  );
}
