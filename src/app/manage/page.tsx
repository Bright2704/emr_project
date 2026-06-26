'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  User,
  MoveRight,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PinInput } from '@/components/ui/PinInput';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, formatDateTime } from '@/lib/utils';

type ActionType = 'move' | 'edit' | 'delete' | null;

export default function ManagePage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const {
    documents,
    visits,
    patients,
    categories,
    searchPatients,
    getPatient,
    getVisit,
    updateDocument,
    addAuditLog,
  } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  // For move action
  const [targetVisitId, setTargetVisitId] = useState('');

  // For edit action
  const [newCategoryId, setNewCategoryId] = useState('');

  // For delete action
  const [deleteReason, setDeleteReason] = useState('');

  const searchedPatients = searchQuery ? searchPatients(searchQuery) : [];
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Get documents for selected patient
  const patientDocuments = selectedPatient
    ? documents.filter((doc) => {
        const visit = getVisit(doc.visitId);
        return visit && visit.patientId === selectedPatient && doc.status === 'active';
      })
    : [];

  const selectedDoc = selectedDocument ? documents.find((d) => d.id === selectedDocument) : null;
  const selectedDocVisit = selectedDoc ? getVisit(selectedDoc.visitId) : null;

  const handleAction = (docId: string, action: ActionType) => {
    setSelectedDocument(docId);
    setActionType(action);

    if (action === 'edit' && selectedDoc) {
      setNewCategoryId(selectedDoc.categoryId);
    }

    setShowPinModal(true);
  };

  const handlePinVerify = (pin: string) => {
    // Mock PIN verification
    if (pin !== '123456') {
      setPinError('PIN ไม่ถูกต้อง');
      return;
    }

    setPinError('');
    setShowPinModal(false);

    // Execute action
    if (selectedDocument) {
      const doc = documents.find((d) => d.id === selectedDocument);
      if (!doc) return;

      switch (actionType) {
        case 'move':
          if (targetVisitId) {
            updateDocument(selectedDocument, { visitId: targetVisitId });
            addAuditLog({
              userId: currentUser?.id || '',
              action: 'move',
              targetType: 'document',
              targetId: selectedDocument,
              detail: {
                fromVisitId: doc.visitId,
                toVisitId: targetVisitId,
              },
            });
          }
          break;

        case 'edit':
          if (newCategoryId) {
            updateDocument(selectedDocument, { categoryId: newCategoryId });
            addAuditLog({
              userId: currentUser?.id || '',
              action: 'edit',
              targetType: 'document',
              targetId: selectedDocument,
              detail: {
                fromCategory: doc.categoryId,
                toCategory: newCategoryId,
              },
            });
          }
          break;

        case 'delete':
          updateDocument(selectedDocument, { status: 'soft_deleted' });
          addAuditLog({
            userId: currentUser?.id || '',
            action: 'delete',
            targetType: 'document',
            targetId: selectedDocument,
            detail: {
              reason: deleteReason,
            },
          });
          break;
      }
    }

    // Reset
    setSelectedDocument(null);
    setActionType(null);
    setTargetVisitId('');
    setNewCategoryId('');
    setDeleteReason('');
  };

  const patient = selectedPatient ? getPatient(selectedPatient) : null;
  const patientVisits = selectedPatient
    ? visits.filter((v) => v.patientId === selectedPatient)
    : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการเอกสาร</h1>
          <p className="text-gray-500">ย้าย แก้ไข หรือลบเอกสารที่จัดเก็บผิดพลาด</p>
        </div>

        {/* Search */}
        <Card>
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="ค้นหาผู้ป่วยด้วย HN, เลขบัตรประชาชน, หรือชื่อ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPatient(null);
                }}
                className="pl-10"
              />
            </div>

            {searchQuery && !selectedPatient && searchedPatients.length > 0 && (
              <div className="mt-4 border rounded-lg divide-y">
                {searchedPatients.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedPatient(p.id);
                      setSearchQuery(`${p.firstName} ${p.lastName} (${p.hn})`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-gray-500" />
                      <div>
                        <div className="font-medium">{p.firstName} {p.lastName}</div>
                        <div className="text-sm text-gray-500">{p.hn}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Documents */}
        {selectedPatient && patient && (
          <>
            <Card>
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-500" />
                    <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                    <Badge>{patient.hn}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchQuery('');
                    }}
                  >
                    เปลี่ยนผู้ป่วย
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">
                  เอกสารทั้งหมด ({patientDocuments.length} ไฟล์)
                </h2>
              </CardHeader>
              <CardBody className="p-0">
                {patientDocuments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ไฟล์</TableHead>
                        <TableHead>หมวด</TableHead>
                        <TableHead>การรับบริการ</TableHead>
                        <TableHead>วันที่อัปโหลด</TableHead>
                        <TableHead>จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientDocuments.map((doc) => {
                        const visit = getVisit(doc.visitId);
                        const category = categories.find((c) => c.id === doc.categoryId);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText size={20} className="text-[#1e3a5f]" />
                                <div>
                                  <div className="font-medium">
                                    {doc.filePath.split('/').pop()}
                                  </div>
                                  <div className="text-sm text-gray-500 uppercase">
                                    {doc.fileType}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge>{category?.name || 'ไม่ระบุ'}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">{visit?.visitNo}</span>
                            </TableCell>
                            <TableCell className="text-gray-500">
                              {formatDateTime(doc.uploadedAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(doc.id, 'move')}
                                  title="ย้าย"
                                >
                                  <MoveRight size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(doc.id, 'edit')}
                                  title="แก้ไขหมวด"
                                >
                                  <Edit3 size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(doc.id, 'delete')}
                                  title="ลบ"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>ไม่พบเอกสาร</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>

      {/* Action Modals */}
      <Modal
        isOpen={showPinModal && actionType !== null}
        onClose={() => {
          setShowPinModal(false);
          setActionType(null);
          setPinError('');
        }}
        title={
          actionType === 'move'
            ? 'ย้ายเอกสาร'
            : actionType === 'edit'
            ? 'แก้ไขหมวดหมู่'
            : 'ลบเอกสาร'
        }
        size="md"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div
            className={`rounded-lg p-4 ${
              actionType === 'delete'
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={actionType === 'delete' ? 'text-red-600' : 'text-yellow-600'}
                size={20}
              />
              <div>
                <p className={`font-medium ${actionType === 'delete' ? 'text-red-800' : 'text-yellow-800'}`}>
                  {actionType === 'move' && 'การย้ายเอกสารจะเปลี่ยนการรับบริการที่ผูกอยู่'}
                  {actionType === 'edit' && 'การแก้ไขหมวดหมู่จะเปลี่ยนการจัดกลุ่มเอกสาร'}
                  {actionType === 'delete' && 'การลบเอกสารจะทำให้ไม่สามารถดูได้อีก'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  การกระทำนี้จะถูกบันทึกใน Audit Log
                </p>
              </div>
            </div>
          </div>

          {/* Action-specific fields */}
          {actionType === 'move' && (
            <Select
              label="ย้ายไปการรับบริการ"
              value={targetVisitId}
              onChange={(e) => setTargetVisitId(e.target.value)}
              options={[
                { value: '', label: '-- เลือกการรับบริการ --' },
                ...patientVisits.map((v) => ({
                  value: v.id,
                  label: `${v.visitNo} (${formatDate(v.visitDate)})`,
                })),
              ]}
            />
          )}

          {actionType === 'edit' && (
            <Select
              label="หมวดหมู่ใหม่"
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              options={categories
                .filter((c) => c.isActive)
                .map((c) => ({ value: c.id, label: c.name }))}
            />
          )}

          {actionType === 'delete' && (
            <Input
              label="เหตุผลในการลบ"
              placeholder="กรุณาระบุเหตุผล..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          )}

          {/* PIN Verification */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <Lock size={20} />
              <span className="font-medium">ยืนยันด้วย PIN</span>
            </div>
            <PinInput onComplete={handlePinVerify} error={pinError} />
            <p className="text-sm text-gray-500 text-center mt-2">
              PIN สำหรับทดสอบ: 123456
            </p>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
