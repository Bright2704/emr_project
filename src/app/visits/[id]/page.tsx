'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, FileText, Plus, ArrowLeft, Download, Eye, Printer } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { getVisit, getPatient, getDocumentsByVisit, categories, users, addAuditLog } = useDataStore();

  const visit = getVisit(id);
  const patient = visit ? getPatient(visit.patientId) : null;
  const documents = visit ? getDocumentsByVisit(visit.id) : [];

  const canUpload = !!(currentUser && ['nurse', 'medical_record', 'admin'].includes(currentUser.role));

  const handleViewDocument = (docId: string) => {
    addAuditLog({
      userId: currentUser?.id || '',
      action: 'view',
      targetType: 'document',
      targetId: docId,
      detail: { visitId: visit?.id },
    });
    router.push(`/documents/${docId}`);
  };

  if (!visit || !patient) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">ไม่พบข้อมูลการรับบริการ</h2>
          <Button onClick={() => router.push('/visits')} className="mt-4">
            กลับไปหน้ารายการ
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'ไม่ระบุ';
  };

  const getUploaderName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || 'ไม่ระบุ';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={20} className="mr-2" />
          กลับ
        </Button>

        {/* Visit Info */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={visit.visitType === 'OPD' ? 'info' : 'warning'} className="text-sm">
                    {visit.visitType === 'OPD' ? 'ผู้ป่วยนอก' : 'ผู้ป่วยใน'}
                  </Badge>
                  <span className="font-mono text-xl font-bold text-[#1e3a5f]">
                    {visit.visitNo}
                  </span>
                </div>
                <p className="text-gray-500">วันที่รับบริการ: {formatDate(visit.visitDate)}</p>
              </div>

              {canUpload && (
                <Button onClick={() => router.push(`/scan?visitId=${visit.id}`)}>
                  <Plus size={20} className="mr-2" />
                  อัปโหลดเอกสาร
                </Button>
              )}
            </div>

            {/* Patient Info */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="font-mono">{patient.hn}</span>
                    <span>•</span>
                    <span>วันเกิด: {formatDate(patient.dateOfBirth)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  ดูข้อมูลผู้ป่วย
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              เอกสาร ({documents.length} ไฟล์)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ไฟล์</TableHead>
                    <TableHead>หมวด</TableHead>
                    <TableHead>อัปโหลดโดย</TableHead>
                    <TableHead>วันที่อัปโหลด</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText size={20} className="text-[#1e3a5f]" />
                          <div>
                            <div className="font-medium">{doc.filePath.split('/').pop()}</div>
                            <div className="text-sm text-gray-500 uppercase">{doc.fileType}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{getCategoryName(doc.categoryId)}</Badge>
                      </TableCell>
                      <TableCell>{getUploaderName(doc.uploadedBy)}</TableCell>
                      <TableCell className="text-gray-500">
                        {formatDateTime(doc.uploadedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ยังไม่มีเอกสาร</p>
                {canUpload && (
                  <Button
                    onClick={() => router.push(`/scan?visitId=${visit.id}`)}
                    className="mt-4"
                  >
                    <Plus size={20} className="mr-2" />
                    อัปโหลดเอกสารแรก
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Documents by Category */}
        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">เอกสารแยกตามหมวด</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.filter((c) => c.isActive).map((category) => {
                  const count = documents.filter((d) => d.categoryId === category.id).length;
                  return (
                    <div
                      key={category.id}
                      className={`p-4 border rounded-lg ${count > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                    >
                      <div className={`text-2xl font-bold ${count > 0 ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                        {count}
                      </div>
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
