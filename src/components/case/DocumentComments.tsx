'use client';

import { useState } from 'react';
import { MessageSquare, Pencil, Trash2, X, Check, History } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { formatDateTime, getRoleName } from '@/lib/utils';

export function DocumentComments({ documentId }: { documentId: string }) {
  const { currentUser } = useAuthStore();
  const { getComments, addComment, editComment, deleteComment, users } = useDataStore();

  const comments = getComments(documentId);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const authorOf = (userId: string) => users.find((u) => u.id === userId);
  const canModify = (authorId: string) =>
    !!currentUser && (currentUser.id === authorId || ['medical_record', 'admin'].includes(currentUser.role));

  const handleAdd = () => {
    if (!draft.trim() || !currentUser) return;
    addComment(documentId, draft.trim(), currentUser.id);
    setDraft('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editDraft.trim() || !currentUser) return;
    editComment(id, editDraft.trim(), currentUser.id);
    setEditingId(null);
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <MessageSquare size={18} className="text-brand" />
        ความคิดเห็น ({comments.length})
      </h3>

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((c) => {
            const author = authorOf(c.authorId);
            return (
              <div key={c.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-brand text-white flex items-center justify-center text-xs font-medium">
                      {author?.fullName?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{author?.fullName || 'ไม่ทราบ'}</p>
                      <p className="text-xs text-gray-500">
                        {author ? getRoleName(author.role) : ''} · {formatDateTime(c.createdAt)}
                      </p>
                    </div>
                  </div>
                  {canModify(c.authorId) && editingId !== c.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditDraft(c.content);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-brand hover:bg-brand-50 transition-colors"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteComment(c.id, currentUser!.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X size={14} className="mr-1" /> ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(c.id)} disabled={!editDraft.trim()}>
                        <Check size={14} className="mr-1" /> บันทึก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                )}

                {c.editHistory.length > 0 && editingId !== c.id && (
                  <div className="mt-2">
                    <button
                      onClick={() => setHistoryOpen(historyOpen === c.id ? null : c.id)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
                    >
                      <History size={12} />
                      แก้ไขล่าสุด {formatDateTime(c.updatedAt)} · ประวัติ {c.editHistory.length} ครั้ง
                    </button>
                    {historyOpen === c.id && (
                      <ul className="mt-1.5 space-y-1 border-l-2 border-gray-200 pl-3">
                        {c.editHistory
                          .slice()
                          .reverse()
                          .map((h, i) => (
                            <li key={i} className="text-xs text-gray-500">
                              <span className="text-gray-400">{formatDateTime(h.editedAt)}</span>
                              <p className="text-gray-600 line-through decoration-gray-300">{h.content}</p>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">ยังไม่มีความคิดเห็น</p>
        )}
      </div>

      {currentUser && (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="เพิ่มความคิดเห็นเกี่ยวกับเอกสาร/รูปภาพนี้"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 hover:border-gray-400 resize-y"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} disabled={!draft.trim()}>
              ส่งความคิดเห็น
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
