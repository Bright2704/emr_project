'use client';

import { useRouter } from 'next/navigation';
import { Users, FileText, Calendar, ScanLine, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDataStore, useAuthStore } from '@/store';
import { formatDateTime, getRoleName, getActionName } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { patients, visits, documents, auditLogs } = useDataStore();

  // Calculate stats
  const todayVisits = visits.filter(
    (v) => new Date(v.visitDate).toDateString() === new Date().toDateString()
  );
  const todayDocuments = documents.filter(
    (d) => new Date(d.uploadedAt).toDateString() === new Date().toDateString()
  );

  const recentActivities = auditLogs.slice(0, 5);

  const canManagePatients = !!(currentUser && ['nurse', 'medical_record', 'admin'].includes(currentUser.role));
  const canScan = !!(currentUser && ['nurse', 'medical_record', 'admin'].includes(currentUser.role));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ดภาพรวม</h1>
          <p className="text-gray-500">ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="ผู้ป่วยทั้งหมด"
            value={patients.length}
            subtitle="คน"
            icon={Users}
            variant="default"
            onClick={() => router.push('/patients')}
          />
          <StatCard
            title="การรับบริการวันนี้"
            value={todayVisits.length}
            subtitle="ครั้ง"
            icon={Calendar}
            variant="success"
            onClick={() => router.push('/visits')}
          />
          <StatCard
            title="เอกสารอัปโหลดวันนี้"
            value={todayDocuments.length}
            subtitle="ไฟล์"
            icon={FileText}
            variant="info"
          />
          <StatCard
            title="เอกสารทั้งหมด"
            value={documents.filter((d) => d.status === 'active').length}
            subtitle="ไฟล์"
            icon={ScanLine}
            variant="default"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">เมนูลัด</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                onClick={() => router.push('/documents')}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <FileText size={20} />
                ค้นหาเอกสาร
              </Button>

              {canScan && (
                <Button
                  onClick={() => router.push('/scan')}
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <ScanLine size={20} />
                  สแกน/อัปโหลดเอกสาร
                </Button>
              )}

              {canManagePatients && (
                <>
                  <Button
                    onClick={() => router.push('/patients/new')}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Users size={20} />
                    ลงทะเบียนผู้ป่วยใหม่
                  </Button>
                  <Button
                    onClick={() => router.push('/visits')}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Calendar size={20} />
                    สร้างการรับบริการ
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">กิจกรรมล่าสุด</h2>
              {currentUser?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/audit-log')}
                >
                  ดูทั้งหมด →
                </Button>
              )}
            </CardHeader>
            <CardBody className="p-0">
              {recentActivities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>การกระทำ</TableHead>
                      <TableHead>ผู้ดำเนินการ</TableHead>
                      <TableHead>เวลา</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivities.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === 'login'
                                ? 'info'
                                : log.action === 'upload'
                                ? 'success'
                                : log.action === 'delete'
                                ? 'danger'
                                : 'default'
                            }
                          >
                            {getActionName(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.userId}</TableCell>
                        <TableCell className="text-gray-500">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>ยังไม่มีกิจกรรม</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">สรุปการรับบริการวันนี้</h2>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>แผนก</TableHead>
                  <TableHead>รับบริการแล้ว</TableHead>
                  <TableHead>รอรับบริการ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">ผู้ป่วยนอก (OPD)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/4 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">
                      {visits.filter((v) => v.visitType === 'OPD').length}
                    </span>{' '}
                    / {visits.length} คน
                  </TableCell>
                  <TableCell>0 / 0</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/visits')}
                    >
                      ดูรายชื่อ →
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">ผู้ป่วยใน (IPD)</div>
                    <div className="text-sm text-gray-500">• ยังไม่มีการลงเวลา</div>
                  </TableCell>
                  <TableCell className="text-orange-500">ยังไม่มีการลงเวลา</TableCell>
                  <TableCell>0 / 0</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/visits')}
                    >
                      ดูรายชื่อ →
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* User Info */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{currentUser?.fullName}</div>
                  <div className="text-sm text-gray-500">
                    {currentUser ? getRoleName(currentUser.role) : ''} • {currentUser?.professionalNo}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">ออนไลน์</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
