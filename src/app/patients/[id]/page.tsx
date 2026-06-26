'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, FileText, Plus, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, maskNationalId, calculateAge } from '@/lib/utils';
import { CaseNotes } from '@/components/case/CaseNotes';
import { RiskFlags, RiskBanner } from '@/components/case/RiskFlags';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { getPatient, getVisitsByPatient, getDocumentsByVisit, categories } = useDataStore();

  const patient = getPatient(id);
  const visits = patient ? getVisitsByPatient(patient.id) : [];

  const canShowFullId = !!(currentUser && ['medical_record', 'admin'].includes(currentUser.role));
  const canCreateVisit = !!(currentUser && ['nurse', 'medical_record', 'admin'].includes(currentUser.role));

  if (!patient) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">ไม่พบข้อมูลผู้ป่วย</h2>
          <Button onClick={() => router.push('/patients')} className="mt-4">
            กลับไปหน้ารายชื่อผู้ป่วย
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={20} className="mr-2" />
          กลับ
        </Button>

        {/* Risk alert */}
        <RiskBanner patientId={patient.id} />

        {/* Patient Info */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {patient.firstName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center gap-4 mt-1 text-gray-500">
                    <span className="font-mono text-brand font-medium">{patient.hn}</span>
                    <span>•</span>
                    <span>{formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} ปี)</span>
                  </div>
                </div>
              </div>

              {canCreateVisit && (
                <Button onClick={() => router.push(`/visits?patientId=${patient.id}&createNew=true`)}>
                  <Plus size={20} className="mr-2" />
                  สร้างการรับบริการ
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-500">เลขบัตรประชาชน</p>
                <p className="font-mono font-medium">{maskNationalId(patient.nationalId, canShowFullId)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">วันเกิด</p>
                <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">อายุ</p>
                <p className="font-medium">{calculateAge(patient.dateOfBirth)} ปี</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ลงทะเบียนเมื่อ</p>
                <p className="font-medium">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Risk flags + Case notes (collaboration) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskFlags patientId={patient.id} />
          <CaseNotes patientId={patient.id} />
        </div>

        {/* Visits */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              ประวัติการรับบริการ ({visits.length} ครั้ง)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {visits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>เอกสาร</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => {
                    const documents = getDocumentsByVisit(visit.id);
                    return (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <span className="font-mono font-medium text-brand">
                            {visit.visitNo}
                          </span>
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
                              อัปโหลดเอกสาร
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
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ยังไม่มีประวัติการรับบริการ</p>
                {canCreateVisit && (
                  <Button
                    onClick={() => router.push(`/visits?patientId=${patient.id}&createNew=true`)}
                    className="mt-4"
                  >
                    <Plus size={20} className="mr-2" />
                    สร้างการรับบริการแรก
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick View Documents by Category */}
        {visits.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">เอกสารแยกตามหมวด</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.filter((c) => c.isActive).map((category) => {
                  const count = visits.reduce((acc, visit) => {
                    return acc + getDocumentsByVisit(visit.id).filter((d) => d.categoryId === category.id).length;
                  }, 0);
                  return (
                    <div
                      key={category.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/documents?hn=${patient.hn}&category=${category.id}`)}
                    >
                      <div className="text-2xl font-bold text-brand">{count}</div>
                      <div className="text-sm text-gray-600">{category.name}</div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
