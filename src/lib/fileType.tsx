import { FileText, Image as ImageIcon, FileSpreadsheet, FileType2, File, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileTypeMeta {
  icon: LucideIcon;
  fg: string; // glyph color
  bg: string; // soft tile background
}

const PDF: FileTypeMeta = { icon: FileText, fg: 'text-red-600', bg: 'bg-red-50' };
const IMG: FileTypeMeta = { icon: ImageIcon, fg: 'text-violet-600', bg: 'bg-violet-50' };
const DOC: FileTypeMeta = { icon: FileType2, fg: 'text-sky-600', bg: 'bg-sky-50' };
const SHEET: FileTypeMeta = { icon: FileSpreadsheet, fg: 'text-emerald-600', bg: 'bg-emerald-50' };
const GENERIC: FileTypeMeta = { icon: File, fg: 'text-gray-500', bg: 'bg-gray-100' };

export function getFileTypeMeta(fileType: string): FileTypeMeta {
  const t = (fileType || '').toLowerCase().replace(/^\./, '');
  if (t === 'pdf') return PDF;
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(t)) return IMG;
  if (['xls', 'xlsx', 'csv'].includes(t)) return SHEET;
  if (['doc', 'docx', 'txt', 'rtf'].includes(t)) return DOC;
  return GENERIC;
}

// Color-coded file-type tile — recognizable at a glance like Finder/Drive.
export function FileTypeTile({
  fileType,
  size = 'md',
  className,
}: {
  fileType: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const meta = getFileTypeMeta(fileType);
  const Icon = meta.icon;
  const dims = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl';
  const glyph = size === 'sm' ? 16 : 19;
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', dims, meta.bg, meta.fg, className)}>
      <Icon size={glyph} strokeWidth={1.75} />
    </span>
  );
}
