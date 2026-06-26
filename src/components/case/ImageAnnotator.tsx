'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Circle, Minus, Highlighter, MapPin, MousePointer2, Trash2 } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Annotation, AnnotationType } from '@/types';

type Tool = 'none' | AnnotationType;

const tools: { id: Tool; label: string; icon: typeof Circle }[] = [
  { id: 'none', label: 'เลือก/เลื่อน', icon: MousePointer2 },
  { id: 'circle', label: 'วงกลม', icon: Circle },
  { id: 'line', label: 'ขีดเส้น', icon: Minus },
  { id: 'highlight', label: 'ไฮไลต์', icon: Highlighter },
  { id: 'marker', label: 'มาร์กตำแหน่ง', icon: MapPin },
];

const colors = ['#dc2626', '#f59e0b', '#16a34a', '#002d73', '#111827'];

interface Draft {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function ImageAnnotator({
  documentId,
  zoom,
  rotation,
  children,
}: {
  documentId: string;
  zoom: number;
  rotation: number;
  children: React.ReactNode;
}) {
  const { currentUser } = useAuthStore();
  const { getAnnotations, addAnnotation, deleteAnnotation } = useDataStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const [tool, setTool] = useState<Tool>('none');
  const [color, setColor] = useState(colors[0]);
  const [label, setLabel] = useState('จุดสังเกต');
  const [draft, setDraft] = useState<Draft | null>(null);

  const annotations = getAnnotations(documentId);
  const drawing = tool !== 'none' && !!currentUser;

  const toSvg = (e: ReactPointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: clamp(p.x), y: clamp(p.y) };
  };

  const commit = (d: Draft) => {
    if (!currentUser) return;
    const base = { documentId, color, authorId: currentUser.id };
    let geometry: Annotation['geometry'];
    let useLabel: string | undefined;

    if (tool === 'circle') {
      const cx = (d.x0 + d.x1) / 2;
      const cy = (d.y0 + d.y1) / 2;
      const r = Math.hypot(d.x1 - d.x0, d.y1 - d.y0) / 2;
      if (r < 0.8) return;
      geometry = { cx, cy, r };
    } else if (tool === 'line') {
      if (Math.hypot(d.x1 - d.x0, d.y1 - d.y0) < 1) return;
      geometry = { x1: d.x0, y1: d.y0, x2: d.x1, y2: d.y1 };
    } else if (tool === 'highlight') {
      const x = Math.min(d.x0, d.x1);
      const y = Math.min(d.y0, d.y1);
      const w = Math.abs(d.x1 - d.x0);
      const h = Math.abs(d.y1 - d.y0);
      if (w < 1 || h < 1) return;
      geometry = { x, y, w, h };
    } else if (tool === 'marker') {
      geometry = { x: d.x1, y: d.y1 };
      useLabel = label.trim() || undefined;
    } else {
      return;
    }

    addAnnotation({ ...base, type: tool as AnnotationType, geometry, label: useLabel });
  };

  const handleDown = (e: ReactPointerEvent) => {
    if (!drawing) return;
    const p = toSvg(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === 'marker') {
      commit({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
      return;
    }
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };

  const handleMove = (e: ReactPointerEvent) => {
    if (!draft) return;
    const p = toSvg(e);
    if (!p) return;
    setDraft({ ...draft, x1: p.x, y1: p.y });
  };

  const handleUp = () => {
    if (draft) {
      commit(draft);
      setDraft(null);
    }
  };

  const renderShape = (a: Annotation, key: string, interactive: boolean) => {
    const g = a.geometry;
    const common = { stroke: a.color, fill: 'none', strokeWidth: 0.8, vectorEffect: 'non-scaling-stroke' as const };
    switch (a.type) {
      case 'circle':
        return <circle key={key} cx={g.cx} cy={g.cy} r={g.r} {...common} />;
      case 'line':
        return <line key={key} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} {...common} />;
      case 'highlight':
        return (
          <rect
            key={key}
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            fill={a.color}
            fillOpacity={0.22}
            stroke={a.color}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        );
      case 'marker':
        return (
          <g key={key}>
            <circle cx={g.x} cy={g.y} r={1.6} fill={a.color} />
            <circle cx={g.x} cy={g.y} r={3.2} fill={a.color} fillOpacity={0.25} />
            {a.label && interactive && (
              <text x={(g.x ?? 0) + 4} y={(g.y ?? 0) + 1.5} fontSize={3.2} fill={a.color} className="font-medium">
                {a.label}
              </text>
            )}
          </g>
        );
      default:
        return null;
    }
  };

  const renderDraft = () => {
    if (!draft) return null;
    const preview: Annotation = {
      id: 'draft',
      documentId,
      type: tool as AnnotationType,
      color,
      authorId: '',
      createdAt: new Date(0),
      status: 'active',
      geometry:
        tool === 'circle'
          ? {
              cx: (draft.x0 + draft.x1) / 2,
              cy: (draft.y0 + draft.y1) / 2,
              r: Math.hypot(draft.x1 - draft.x0, draft.y1 - draft.y0) / 2,
            }
          : tool === 'line'
          ? { x1: draft.x0, y1: draft.y0, x2: draft.x1, y2: draft.y1 }
          : {
              x: Math.min(draft.x0, draft.x1),
              y: Math.min(draft.y0, draft.y1),
              w: Math.abs(draft.x1 - draft.x0),
              h: Math.abs(draft.y1 - draft.y0),
            },
    };
    return renderShape(preview, 'draft', false);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {currentUser && (
        <div className="no-print flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <div className="flex items-center gap-1">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  title={t.label}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98]',
                    tool === t.id ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`สี ${c}`}
                className={cn(
                  'h-6 w-6 rounded-full ring-2 transition-transform active:scale-90',
                  color === c ? 'ring-offset-1 ring-gray-400' : 'ring-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {tool === 'marker' && (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ป้ายกำกับ"
              className="ml-1 w-32 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          )}

          <span className="ml-auto text-xs text-gray-400">{annotations.length} มาร์ก</span>
        </div>
      )}

      {/* Annotated viewport */}
      <div className="flex items-center justify-center overflow-auto bg-gray-100 rounded-lg min-h-[600px] p-4">
        <div
          className="relative"
          style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
        >
          {children}
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={cn('absolute inset-0 h-full w-full', drawing ? 'cursor-crosshair' : 'pointer-events-none')}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
          >
            {annotations.map((a) => renderShape(a, a.id, true))}
            {renderDraft()}
          </svg>
        </div>
      </div>

      {/* Annotation list */}
      {annotations.length > 0 && (
        <ul className="no-print flex flex-wrap gap-2">
          {annotations.map((a) => (
            <li
              key={a.id}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-2.5 pr-1.5 text-xs"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="text-gray-600">
                {tools.find((t) => t.id === a.type)?.label}
                {a.label ? ` · ${a.label}` : ''}
              </span>
              {currentUser && (
                <button
                  onClick={() => deleteAnnotation(a.id, currentUser.id)}
                  className="rounded-full p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="ลบมาร์ก"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
