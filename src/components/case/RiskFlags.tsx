'use client';

import { useState } from 'react';
import { AlertTriangle, ShieldAlert, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/store';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatDateTime, getRoleName } from '@/lib/utils';
import type { RiskSeverity } from '@/types';

const severityMeta: Record<RiskSeverity, { label: string; chip: string; dot: string; banner: string; card: string }> = {
  high: {
    label: 'สูง',
    chip: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
    banner: 'bg-red-50 border-red-200 text-red-800',
    card: 'bg-red-50/60 border-red-200',
  },
  medium: {
    label: 'ปานกลาง',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    banner: 'bg-amber-50 border-amber-200 text-amber-800',
    card: 'bg-amber-50/60 border-amber-200',
  },
  low: {
    label: 'ต่ำ',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
    banner: 'bg-sky-50 border-sky-200 text-sky-800',
    card: 'bg-sky-50/60 border-sky-200',
  },
};

// Compact alert banner for top of patient / visit / document pages
export function RiskBanner({ patientId }: { patientId: string }) {
  const { getRiskFlags } = useDataStore();
  const flags = getRiskFlags(patientId).filter((f) => f.severity !== 'low');
  if (flags.length === 0) return null;

  const top = flags[0];
  const meta = severityMeta[top.severity];

  return (
    <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', meta.banner)} role="alert">
      <ShieldAlert size={20} className="mt-0.5 shrink-0" />
      <div className="text-sm">
        <span className="font-semibold">ข้อควรระวัง:</span>{' '}
        {flags.map((f) => f.title).join(' · ')}
      </div>
    </div>
  );
}

const emptyForm = { title: '', detail: '', severity: 'medium' as RiskSeverity };

export function RiskFlags({ patientId }: { patientId: string }) {
  const { currentUser } = useAuthStore();
  const { getRiskFlags, addRiskFlag, editRiskFlag, deleteRiskFlag, users } = useDataStore();

  const flags = getRiskFlags(patientId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const authorOf = (userId: string) => users.find((u) => u.id === userId);
  const canModify = (authorId: string) =>
    !!currentUser && (currentUser.id === authorId || ['medical_record', 'admin'].includes(currentUser.role));

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !currentUser) return;
    if (editingId) {
      editRiskFlag(editingId, { title: form.title.trim(), detail: form.detail.trim(), severity: form.severity }, currentUser.id);
    } else {
      addRiskFlag({
        patientId,
        title: form.title.trim(),
        detail: form.detail.trim(),
        severity: form.severity,
        authorId: currentUser.id,
      });
    }
    resetForm();
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          ความเสี่ยง / ข้อควรระวัง ({flags.length})
        </h2>
        {currentUser && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-1" /> เพิ่ม
          </Button>
        )}
      </CardHeader>
      <CardBody className="space-y-4">
        {showForm && (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="หัวข้อ เช่น แพ้ยา Penicillin / ค่าตรวจสูงผิดปกติ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <textarea
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={2}
              placeholder="รายละเอียดเพิ่มเติม"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(['high', 'medium', 'low'] as RiskSeverity[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, severity: s })}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
                      form.severity === s ? severityMeta[s].chip : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', severityMeta[s].dot)} />
                    {severityMeta[s].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  <X size={15} className="mr-1" /> ยกเลิก
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={!form.title.trim()}>
                  <Check size={15} className="mr-1" /> {editingId ? 'บันทึก' : 'เพิ่ม'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {flags.length > 0 ? (
          <ul className="space-y-2">
            {flags.map((flag) => {
              const author = authorOf(flag.authorId);
              const meta = severityMeta[flag.severity];
              return (
                <li
                  key={flag.id}
                  className={cn('rounded-lg border p-3', meta.card)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', meta.chip)}>
                          <span className={cn('w-2 h-2 rounded-full', meta.dot)} />
                          {meta.label}
                        </span>
                        <span className="font-semibold text-gray-800 truncate">{flag.title}</span>
                      </div>
                      {flag.detail && <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{flag.detail}</p>}
                      <p className="mt-1 text-xs text-gray-400">
                        {author?.fullName || 'ไม่ทราบ'} ({author ? getRoleName(author.role) : ''}) ·{' '}
                        {formatDateTime(flag.createdAt)}
                        {flag.editHistory.length > 0 && ` · แก้ไข ${flag.editHistory.length} ครั้ง`}
                      </p>
                    </div>
                    {canModify(flag.authorId) && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(flag.id);
                            setForm({ title: flag.title, detail: flag.detail, severity: flag.severity });
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand hover:bg-brand-50 transition-colors"
                          aria-label="แก้ไข"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteRiskFlag(flag.id, currentUser!.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !showForm && (
            <div className="py-8 text-center text-gray-500">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">ยังไม่มีการบันทึกความเสี่ยง</p>
            </div>
          )
        )}
      </CardBody>
    </Card>
  );
}
