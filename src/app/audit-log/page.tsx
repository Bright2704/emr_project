'use client';

import { useState } from 'react';
import { ClipboardList, Search, Download, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore } from '@/store';
import { formatDateTime, getActionName } from '@/lib/utils';

export default function AuditLogPage() {
  const { auditLogs, users } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction && log.action !== filterAction) return false;
    if (filterUser && log.userId !== filterUser) return false;
    if (searchQuery) {
      const user = users.find((u) => u.id === log.userId);
      const q = searchQuery.toLowerCase();
      if (
        !log.targetId.toLowerCase().includes(q) &&
        !user?.fullName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || userId;
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'login':
        return 'info';
      case 'view':
        return 'default';
      case 'upload':
        return 'success';
      case 'move':
      case 'edit':
        return 'warning';
      case 'delete':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleExport = () => {
    // Mock export
    const csvContent = [
      ['วันเวลา', 'ผู้ดำเนินการ', 'การกระทำ', 'ประเภท', 'รหัส', 'รายละเอียด'],
      ...filteredLogs.map((log) => [
        formatDateTime(log.createdAt),
        getUserName(log.userId),
        getActionName(log.action),
        log.targetType,
        log.targetId,
        JSON.stringify(log.detail),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">บันทึกการใช้งาน</h1>
            <p className="text-gray-500">ประวัติการเข้าถึงและแก้ไขข้อมูลในระบบ</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download size={20} className="mr-2" />
            ส่งออก CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                options={[
                  { value: '', label: 'ทุกการกระทำ' },
                  { value: 'login', label: 'เข้าสู่ระบบ' },
                  { value: 'view', label: 'ดูเอกสาร' },
                  { value: 'upload', label: 'อัปโหลด' },
                  { value: 'move', label: 'ย้ายเอกสาร' },
                  { value: 'edit', label: 'แก้ไข' },
                  { value: 'delete', label: 'ลบ' },
                ]}
              />

              <Select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                options={[
                  { value: '', label: 'ทุกผู้ใช้' },
                  ...users.map((u) => ({ value: u.id, label: u.fullName })),
                ]}
              />

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterAction('');
                  setFilterUser('');
                }}
              >
                <Filter size={20} className="mr-2" />
                ล้างตัวกรอง
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Log Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">
              รายการ ({filteredLogs.length} รายการ)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {filteredLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันเวลา</TableHead>
                    <TableHead>ผู้ดำเนินการ</TableHead>
                    <TableHead>การกระทำ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>รหัส</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>{getUserName(log.userId)}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionName(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">{log.targetType}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{log.targetId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {Object.entries(log.detail || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่พบรายการ</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
