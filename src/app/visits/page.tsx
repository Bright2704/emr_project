'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Plus, User, FileText, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, generateVisitNo } from '@/lib/utils';

function VisitsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const { patients, visits, getPatient, getDocumentsByVisit, addVisit, addAuditLog, searchPatients } = useDataStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [visitType, setVisitType] = useState<'OPD' | 'IPD'>('OPD');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if we should open create modal
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const createNew = searchParams.get('createNew');
    if (patientId && createNew === 'true') {
      setSelectedPatient(patientId);
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const filteredVisits = visits.filter((visit) => {
    if (!searchQuery) return true;
    const patient = getPatient(visit.patientId);
    const q = searchQuery.toLowerCase();
    return (
      visit.visitNo.toLowerCase().includes(q) ||
      patient?.hn.toLowerCase().includes(q) ||
      patient?.firstName.toLowerCase().includes(q) ||
      patient?.lastName.toLowerCase().includes(q)
    );
  });

  const searchedPatients = patientSearch ? searchPatients(patientSearch) : [];

  const handleCreateVisit = () => {
    if (!selectedPatient) return;

    const visit = addVisit({
      patientId: selectedPatient,
      visitNo: generateVisitNo(visitType),
      visitType,
      visitDate: new Date(visitDate),
    });

    addAuditLog({
      userId: currentUser?.id || '',
      action: 'upload',
      targetType: 'visit',
      targetId: visit.id,
      detail: { action: 'create_visit', visitNo: visit.visitNo },
    });

    setShowCreateModal(false);
    setSelectedPatient('');
    setPatientSearch('');
    router.push(`/visits/${visit.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">การรับบริการ</h1>
            <p className="text-gray-500">จัดการข้อมูลการเข้ารับบริการของผู้ป่วย</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} className="mr-2" />
            สร้างการรับบริการใหม่
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="ค้นหาด้วยเลข VN/AN, HN, หรือชื่อผู้ป่วย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">
              รายการรับบริการ ({filteredVisits.length} รายการ)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลข VN/AN</TableHead>
                  <TableHead>ผู้ป่วย</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เอกสาร</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => {
                  const patient = getPatient(visit.patientId);
                  const documents = getDocumentsByVisit(visit.id);
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <span className="font-mono font-medium text-brand">
                          {visit.visitNo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {patient?.firstName} {patient?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{patient?.hn}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={visit.visitType === 'OPD' ? 'info' : 'warning'}>
                          {visit.visitType === 'OPD' ? 'ผู้ป่วยนอก' : 'ผู้ป่วยใน'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(visit.visitDate)}</TableCell>
                      <TableCell>
                        <Badge variant={documents.length > 0 ? 'success' : 'default'}>
                          <FileText size={12} className="mr-1" />
                          {documents.length} ไฟล์
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/visits/${visit.id}`)}
                          >
                            ดูรายละเอียด
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/scan?visitId=${visit.id}`)}
                          >
                            อัปโหลด
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredVisits.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่พบรายการรับบริการ</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Create Visit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedPatient('');
          setPatientSearch('');
        }}
        title="สร้างการรับบริการใหม่"
        size="lg"
      >
        <div className="space-y-4">
          {/* Patient Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ค้นหาผู้ป่วย
            </label>
            <Input
              placeholder="พิมพ์ HN, เลขบัตรประชาชน, หรือชื่อ..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            {searchedPatients.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-auto">
                {searchedPatients.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedPatient === p.id ? 'bg-blue-50 border-l-4 border-brand' : ''
                    }`}
                    onClick={() => {
                      setSelectedPatient(p.id);
                      setPatientSearch(`${p.firstName} ${p.lastName} (${p.hn})`);
                    }}
                  >
                    <div className="font-medium">{p.firstName} {p.lastName}</div>
                    <div className="text-sm text-gray-500">{p.hn}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient Preview */}
          {selectedPatient && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">ผู้ป่วยที่เลือก:</p>
              {(() => {
                const patient = getPatient(selectedPatient);
                return patient ? (
                  <div>
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    <p className="text-sm text-gray-600">{patient.hn} • {formatDate(patient.dateOfBirth)}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Visit Type */}
          <Select
            label="ประเภทการรับบริการ"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value as 'OPD' | 'IPD')}
            options={[
              { value: 'OPD', label: 'ผู้ป่วยนอก (OPD)' },
              { value: 'IPD', label: 'ผู้ป่วยใน (IPD)' },
            ]}
          />

          {/* Visit Date */}
          <Input
            label="วันที่รับบริการ"
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateVisit}
              className="flex-1"
              disabled={!selectedPatient}
            >
              สร้างการรับบริการ
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setSelectedPatient('');
                setPatientSearch('');
              }}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

export default function VisitsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisitsContent />
    </Suspense>
  );
}
