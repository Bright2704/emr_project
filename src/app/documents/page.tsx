'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileText, User, Calendar, Eye, Download, Printer, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, formatDateTime } from '@/lib/utils';

function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const { patients, visits, documents, categories, users, searchPatients, getPatient, getVisitsByPatient, addAuditLog } = useDataStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('hn') || '');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visit' | 'category'>('visit');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || '');

  const searchedPatients = searchQuery ? searchPatients(searchQuery) : [];
  const patient = selectedPatient ? getPatient(selectedPatient) : null;
  const patientVisits = selectedPatient ? getVisitsByPatient(selectedPatient) : [];

  // Get all documents for patient
  const patientDocuments = patientVisits.flatMap((visit) =>
    documents
      .filter((d) => d.visitId === visit.id && d.status === 'active')
      .map((doc) => ({
        ...doc,
        visit,
        category: categories.find((c) => c.id === doc.categoryId),
        uploader: users.find((u) => u.id === doc.uploadedBy),
      }))
  );

  const filteredDocuments = filterCategory
    ? patientDocuments.filter((d) => d.categoryId === filterCategory)
    : patientDocuments;

  // Group by category
  const documentsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = patientDocuments.filter((d) => d.categoryId === category.id);
    return acc;
  }, {} as Record<string, typeof patientDocuments>);

  const handleViewDocument = (docId: string) => {
    addAuditLog({
      userId: currentUser?.id || '',
      action: 'view',
      targetType: 'document',
      targetId: docId,
      detail: { patientId: selectedPatient },
    });
    router.push(`/documents/${docId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">เรียกดูเอกสาร</h1>
          <p className="text-gray-500">ค้นหาและเรียกดูเอกสารของผู้ป่วย</p>
        </div>

        {/* Search */}
        <Card>
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="ค้นหาด้วย HN, เลขบัตรประชาชน, หรือชื่อ-นามสกุล..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPatient(null);
                }}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{p.firstName} {p.lastName}</div>
                          <div className="text-sm text-gray-500">
                            {p.hn} • วันเกิด: {formatDate(p.dateOfBirth)}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        เลือก
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && !selectedPatient && searchedPatients.length === 0 && (
              <div className="mt-4 text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่พบผู้ป่วย</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Patient Documents */}
        {selectedPatient && patient && (
          <>
            {/* Patient Info */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {patient.firstName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h2>
                      <div className="text-gray-500">
                        <span className="font-mono">{patient.hn}</span>
                        <span className="mx-2">•</span>
                        <span>วันเกิด: {formatDate(patient.dateOfBirth)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
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

            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'visit' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('visit')}
                >
                  <Calendar size={16} className="mr-2" />
                  แยกตามการรับบริการ
                </Button>
                <Button
                  variant={viewMode === 'category' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('category')}
                >
                  <Filter size={16} className="mr-2" />
                  แยกตามหมวด
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">กรองหมวด:</span>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    ...categories.filter((c) => c.isActive).map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                  className="w-40"
                />
              </div>
            </div>

            {/* Documents View */}
            {viewMode === 'visit' ? (
              // View by Visit
              <div className="space-y-4">
                {patientVisits.map((visit) => {
                  const visitDocs = filteredDocuments.filter((d) => d.visitId === visit.id);
                  if (filterCategory && visitDocs.length === 0) return null;

                  return (
                    <Card key={visit.id}>
                      <CardHeader className="bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-gray-500" />
                            <div>
                              <span className="font-mono font-medium text-[#1e3a5f]">
                                {visit.visitNo}
                              </span>
                              <Badge
                                variant={visit.visitType === 'OPD' ? 'info' : 'warning'}
                                className="ml-2"
                              >
                                {visit.visitType}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-gray-500">{formatDate(visit.visitDate)}</span>
                        </div>
                      </CardHeader>
                      <CardBody className="p-0">
                        {visitDocs.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ไฟล์</TableHead>
                                <TableHead>หมวด</TableHead>
                                <TableHead>อัปโหลดโดย</TableHead>
                                <TableHead>วันที่</TableHead>
                                <TableHead>จัดการ</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {visitDocs.map((doc) => (
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
                                    <Badge>{doc.category?.name || 'ไม่ระบุ'}</Badge>
                                  </TableCell>
                                  <TableCell>{doc.uploader?.fullName || 'ไม่ระบุ'}</TableCell>
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
                          <div className="p-6 text-center text-gray-500">
                            ไม่มีเอกสารในการรับบริการนี้
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // View by Category
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories
                  .filter((c) => c.isActive)
                  .map((category) => {
                    const categoryDocs = documentsByCategory[category.id] || [];
                    if (filterCategory && filterCategory !== category.id) return null;

                    return (
                      <Card key={category.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            <Badge variant={categoryDocs.length > 0 ? 'success' : 'default'}>
                              {categoryDocs.length} ไฟล์
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardBody className="p-0">
                          {categoryDocs.length > 0 ? (
                            <div className="divide-y">
                              {categoryDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleViewDocument(doc.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText size={16} className="text-[#1e3a5f]" />
                                      <span className="text-sm">
                                        {doc.filePath.split('/').pop()}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(doc.uploadedAt)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 ml-6">
                                    {doc.visit.visitNo}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              ไม่มีเอกสาร
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
              </div>
            )}

            {patientDocuments.length === 0 && (
              <Card>
                <CardBody className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800">ไม่พบเอกสาร</h3>
                  <p className="text-gray-500 mt-1">ผู้ป่วยรายนี้ยังไม่มีเอกสารในระบบ</p>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
