'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDataStore } from '@/store';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getDocument, getVisit, getPatient, categories, users } = useDataStore();

  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const document = getDocument(id);
  const visit = document ? getVisit(document.visitId) : null;
  const patient = visit ? getPatient(visit.patientId) : null;
  const category = document ? categories.find((c) => c.id === document.categoryId) : null;
  const uploader = document ? users.find((u) => u.id === document.uploadedBy) : null;

  if (!document || !visit || !patient) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">ไม่พบเอกสาร</h2>
          <Button onClick={() => router.push('/documents')} className="mt-4">
            กลับไปหน้าเอกสาร
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Mock download - in real app would trigger actual download
    alert('ดาวน์โหลดเอกสาร: ' + document.filePath.split('/').pop());
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft size={20} className="mr-2" />
            กลับ
          </Button>

          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut size={16} />
            </Button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw size={16} />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download size={16} className="mr-1" />
              ดาวน์โหลด
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} className="mr-1" />
              พิมพ์
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Document Info Panel */}
          <Card className="col-span-1 no-print">
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลเอกสาร</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">ชื่อไฟล์</p>
                    <p className="font-medium">{document.filePath.split('/').pop()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ประเภท</p>
                    <p className="font-medium uppercase">{document.fileType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">หมวดหมู่</p>
                    <Badge>{category?.name || 'ไม่ระบุ'}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">อัปโหลดเมื่อ</p>
                    <p className="font-medium">{formatDateTime(document.uploadedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">อัปโหลดโดย</p>
                    <p className="font-medium">{uploader?.fullName || 'ไม่ระบุ'}</p>
                  </div>
                </div>
              </div>

              <hr />

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลผู้ป่วย</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#002d73] rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{patient.hn}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  ดูข้อมูลผู้ป่วย
                </Button>
              </div>

              <hr />

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">การรับบริการ</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-mono font-medium">{visit.visitNo}</p>
                    <p className="text-sm text-gray-500">{formatDate(visit.visitDate)}</p>
                  </div>
                </div>
                <Badge variant={visit.visitType === 'OPD' ? 'info' : 'warning'}>
                  {visit.visitType === 'OPD' ? 'ผู้ป่วยนอก' : 'ผู้ป่วยใน'}
                </Badge>
              </div>
            </CardBody>
          </Card>

          {/* Document Viewer */}
          <Card className="col-span-3">
            <CardBody className="min-h-[600px] flex items-center justify-center bg-gray-100">
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Mock Document Preview */}
                <div className="bg-white shadow-lg rounded-lg p-8 w-[595px] min-h-[842px]">
                  {/* Header */}
                  <div className="text-center border-b pb-4 mb-4">
                    <h1 className="text-xl font-bold text-[#002d73]">โรงพยาบาลตัวอย่าง</h1>
                    <p className="text-sm text-gray-500">Sample Hospital</p>
                  </div>

                  {/* Document Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold">{category?.name || 'เอกสาร'}</h2>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                        <span className="ml-2 font-medium">
                          {patient.firstName} {patient.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">HN:</span>
                        <span className="ml-2 font-mono">{patient.hn}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">วันเกิด:</span>
                        <span className="ml-2">{formatDate(patient.dateOfBirth)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{visit.visitType === 'OPD' ? 'VN' : 'AN'}:</span>
                        <span className="ml-2 font-mono">{visit.visitNo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/6" />

                    <div className="my-8">
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400">[ ตัวอย่างเนื้อหาเอกสาร ]</span>
                      </div>
                    </div>

                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t text-sm text-gray-500 text-center">
                    <p>วันที่พิมพ์: {formatDateTime(new Date())}</p>
                    <p>รหัสเอกสาร: {document.id}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
