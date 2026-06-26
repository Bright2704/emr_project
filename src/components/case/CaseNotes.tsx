'use client';

import { useState } from 'react';
import { StickyNote, Pencil, Trash2, Clock, X, Check, History } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/store';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDateTime, getRoleName } from '@/lib/utils';

export function CaseNotes({ patientId }: { patientId: string }) {
  const { currentUser } = useAuthStore();
  const { getCaseNotes, addCaseNote, editCaseNote, deleteCaseNote, users } = useDataStore();

  const notes = getCaseNotes(patientId);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const authorOf = (userId: string) => users.find((u) => u.id === userId);
  const canModify = (authorId: string) =>
    !!currentUser && (currentUser.id === authorId || ['medical_record', 'admin'].includes(currentUser.role));

  const handleAdd = () => {
    if (!draft.trim() || !currentUser) return;
    addCaseNote(patientId, draft.trim(), currentUser.id);
    setDraft('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editDraft.trim() || !currentUser) return;
    editCaseNote(id, editDraft.trim(), currentUser.id);
    setEditingId(null);
    setEditDraft('');
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <StickyNote size={20} className="text-brand" />
          หมายเหตุประจำเคส ({notes.length})
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Add form */}
        {currentUser && (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="เพิ่มหมายเหตุ/ข้อสังเกต เพื่อให้ผู้ใช้คนถัดไปติดตามงานต่อได้"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 hover:border-gray-400 resize-y"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAdd} disabled={!draft.trim()}>
                บันทึกหมายเหตุ
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {notes.length > 0 ? (
          <ol className="space-y-3">
            {notes.map((note) => {
              const author = authorOf(note.authorId);
              const edited = note.editHistory.length > 0;
              return (
                <li key={note.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-brand text-white flex items-center justify-center text-sm font-medium">
                        {author?.fullName?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {author?.fullName || 'ไม่ทราบผู้บันทึก'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {author ? getRoleName(author.role) : ''} · {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                    </div>
                    {canModify(note.authorId) && editingId !== note.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditDraft(note.content);
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand hover:bg-brand-50 transition-colors"
                          aria-label="แก้ไข"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteCaseNote(note.id, currentUser!.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === note.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X size={15} className="mr-1" /> ยกเลิก
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(note.id)} disabled={!editDraft.trim()}>
                          <Check size={15} className="mr-1" /> บันทึก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  )}

                  {edited && editingId !== note.id && (
                    <div className="mt-2">
                      <button
                        onClick={() => setHistoryOpen(historyOpen === note.id ? null : note.id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
                      >
                        <History size={13} />
                        แก้ไขล่าสุด {formatDateTime(note.updatedAt)} · ประวัติ {note.editHistory.length} ครั้ง
                      </button>
                      {historyOpen === note.id && (
                        <ul className="mt-2 space-y-1.5 border-l-2 border-gray-200 pl-3">
                          {note.editHistory
                            .slice()
                            .reverse()
                            .map((h, i) => (
                              <li key={i} className="text-xs text-gray-500">
                                <span className="text-gray-400">
                                  {formatDateTime(h.editedAt)} · {authorOf(h.editedBy)?.fullName || 'ไม่ทราบ'}
                                </span>
                                <p className="text-gray-600 line-through decoration-gray-300">{h.content}</p>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">ยังไม่มีหมายเหตุในเคสนี้</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
