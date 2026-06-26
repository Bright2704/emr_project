'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileText, User, Calendar, Eye, Download, Printer, Filter, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore, useAuthStore } from '@/store';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { CategoryBadge, CategoryIcon } from '@/lib/categories';
import { FileTypeTile } from '@/lib/fileType';

// Compact, quiet icon button for row actions — refined alternative to a
// row of full <Button>s. Tooltip + accessible label baked in.
function IconAction({
  label,
  onClick,
  tone = 'quiet',
  children,
}: {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  tone?: 'quiet' | 'brand';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        tone === 'brand'
          ? 'text-brand hover:bg-brand-50'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
      )}
    >
      {children}
    </button>
  );
}

function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const { patients, visits, documents, categories, users, searchPatients, getPatient, getVisitsByPatient, addAuditLog } = useDataStore();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(searchParams.get('patientId'));
  const [searchQuery, setSearchQuery] = useState(() => {
    const pid = searchParams.get('patientId');
    if (pid) {
      const p = getPatient(pid);
      if (p) return `${p.firstName} ${p.lastName} (${p.hn})`;
    }
    return searchParams.get('hn') || '';
  });
  const [viewMode, setViewMode] = useState<'visit' | 'category'>('visit');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || '');

  // Keep the selected patient in the URL so returning from the document
  // viewer (browser back) restores this patient's document list.
  const selectPatient = (p: { id: string; firstName: string; lastName: string; hn: string }) => {
    setSelectedPatient(p.id);
    setSearchQuery(`${p.firstName} ${p.lastName} (${p.hn})`);
    const params = new URLSearchParams(searchParams.toString());
    params.set('patientId', p.id);
    params.delete('hn');
    router.replace(`/documents?${params.toString()}`);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setFilterCategory('');
    router.replace('/documents');
  };

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
                  if (selectedPatient) {
                    setSelectedPatient(null);
                    router.replace('/documents');
                  }
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
                    onClick={() => selectPatient(p)}
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
                    <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center">
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
                  <Button variant="outline" onClick={clearPatient}>
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
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                              <Calendar size={18} strokeWidth={1.75} />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-gray-800">
                                  {visit.visitNo}
                                </span>
                                <Badge variant={visit.visitType === 'OPD' ? 'info' : 'warning'}>
                                  {visit.visitType}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(visit.visitDate)}</span>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-400">
                            {visitDocs.length} ไฟล์
                          </span>
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
                                <TableRow
                                  key={doc.id}
                                  className="group"
                                  onClick={() => handleViewDocument(doc.id)}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <FileTypeTile fileType={doc.fileType} />
                                      <div className="min-w-0">
                                        <div className="truncate font-medium text-gray-800">
                                          {doc.filePath.split('/').pop()}
                                        </div>
                                        <div className="text-xs uppercase tracking-wide text-gray-400">
                                          {doc.fileType}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <CategoryBadge categoryId={doc.categoryId} name={doc.category?.name || 'ไม่ระบุ'} />
                                  </TableCell>
                                  <TableCell>{doc.uploader?.fullName || 'ไม่ระบุ'}</TableCell>
                                  <TableCell className="text-gray-500">
                                    {formatDateTime(doc.uploadedAt)}
                                  </TableCell>
                                  <TableCell>
                                    <div
                                      className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <IconAction label="ดูเอกสาร" tone="brand" onClick={() => handleViewDocument(doc.id)}>
                                        <Eye size={17} strokeWidth={1.75} />
                                      </IconAction>
                                      <IconAction label="ดาวน์โหลด">
                                        <Download size={17} strokeWidth={1.75} />
                                      </IconAction>
                                      <IconAction label="พิมพ์">
                                        <Printer size={17} strokeWidth={1.75} />
                                      </IconAction>
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
                            <div className="flex items-center gap-2.5">
                              <CategoryIcon categoryId={category.id} size={18} className="h-9 w-9" />
                              <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            </div>
                            <Badge variant={categoryDocs.length > 0 ? 'success' : 'default'}>
                              {categoryDocs.length} ไฟล์
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardBody className="p-0">
                          {categoryDocs.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {categoryDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                                  onClick={() => handleViewDocument(doc.id)}
                                >
                                  <FileTypeTile fileType={doc.fileType} size="sm" />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-gray-800">
                                      {doc.filePath.split('/').pop()}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                                      <span className="font-mono">{doc.visit.visitNo}</span>
                                      <span>•</span>
                                      <span>{formatDate(doc.uploadedAt)}</span>
                                    </div>
                                  </div>
                                  <ChevronRight
                                    size={16}
                                    className="shrink-0 text-gray-300 transition-colors group-hover:text-gray-500"
                                  />
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
