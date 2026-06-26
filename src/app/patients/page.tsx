'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Calendar, FileText } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate, maskNationalId, calculateAge } from '@/lib/utils';

export default function PatientsPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { patients, searchPatients, getVisitsByPatient, getDocumentsByPatient } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = searchQuery ? searchPatients(searchQuery) : patients;

  const canShowFullId = !!(currentUser && ['medical_record', 'admin'].includes(currentUser.role));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ผู้ป่วย</h1>
            <p className="text-gray-500">จัดการข้อมูลผู้ป่วยในระบบ</p>
          </div>
          <Button onClick={() => router.push('/patients/new')}>
            <Plus size={20} className="mr-2" />
            ลงทะเบียนผู้ป่วยใหม่
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="ค้นหาด้วย HN, เลขบัตรประชาชน, หรือชื่อ-นามสกุล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              รายชื่อผู้ป่วย ({filteredPatients.length} คน)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HN</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>เลขบัตรประชาชน</TableHead>
                  <TableHead>วันเกิด / อายุ</TableHead>
                  <TableHead>การรับบริการ</TableHead>
                  <TableHead>เอกสาร</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const visits = getVisitsByPatient(patient.id);
                  const documents = getDocumentsByPatient(patient.id);
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <span className="font-mono font-medium text-[#002d73]">
                          {patient.hn}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-gray-600">
                        {maskNationalId(patient.nationalId, canShowFullId)}
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(patient.dateOfBirth)}</div>
                        <div className="text-sm text-gray-500">
                          ({calculateAge(patient.dateOfBirth)} ปี)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={visits.length > 0 ? 'success' : 'default'}>
                          <Calendar size={12} className="mr-1" />
                          {visits.length} ครั้ง
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={documents.length > 0 ? 'info' : 'default'}>
                          <FileText size={12} className="mr-1" />
                          {documents.length} ไฟล์
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/patients/${patient.id}`)}
                          >
                            ดูข้อมูล
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/documents?hn=${patient.hn}`)}
                          >
                            ดูเอกสาร
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่พบข้อมูลผู้ป่วย</p>
                {searchQuery && (
                  <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
