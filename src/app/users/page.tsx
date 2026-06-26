'use client';

import { useState } from 'react';
import { Users, Plus, Edit2, RotateCcw, UserX, UserCheck, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore } from '@/store';
import { getRoleName } from '@/lib/utils';

export default function UsersPage() {
  const { users } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    professionalNo: '',
    fullName: '',
    role: 'nurse',
    phone: '',
    email: '',
  });

  const filteredUsers = users.filter((user) => {
    if (filterRole && user.role !== filterRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !user.fullName.toLowerCase().includes(q) &&
        !user.professionalNo.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleAddUser = () => {
    // Mock add user
    alert(`เพิ่มผู้ใช้ ${newUser.fullName} เรียบร้อย`);
    setShowAddModal(false);
    setNewUser({
      professionalNo: '',
      fullName: '',
      role: 'nurse',
      phone: '',
      email: '',
    });
  };

  const handleResetPin = () => {
    // Mock reset PIN
    alert('รีเซ็ต PIN เรียบร้อย');
    setShowResetPinModal(false);
    setSelectedUser(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการบุคลากร</h1>
            <p className="text-gray-500">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={20} className="mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="ค้นหาชื่อหรือเลขวิชาชีพ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                options={[
                  { value: '', label: 'ทุกตำแหน่ง' },
                  { value: 'doctor', label: 'แพทย์' },
                  { value: 'nurse', label: 'พยาบาล' },
                  { value: 'medical_record', label: 'เวชระเบียน' },
                  { value: 'admin', label: 'ผู้ดูแลระบบ' },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">
              รายชื่อบุคลากร ({filteredUsers.length} คน)
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขวิชาชีพ</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>ติดต่อ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="font-mono font-medium">{user.professionalNo}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === 'admin'
                            ? 'danger'
                            : user.role === 'doctor'
                            ? 'info'
                            : 'default'
                        }
                      >
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.phone}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'default'}>
                        {user.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </Badge>
                      {user.pinSet ? (
                        <Badge variant="info" className="ml-1">
                          PIN ตั้งแล้ว
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="ml-1">
                          รอตั้ง PIN
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="แก้ไข">
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="รีเซ็ต PIN"
                          onClick={() => {
                            setSelectedUser(user.id);
                            setShowResetPinModal(true);
                          }}
                        >
                          <RotateCcw size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={user.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          className={user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>ไม่พบผู้ใช้</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="เพิ่มผู้ใช้ใหม่"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="เลขใบประกอบวิชาชีพ"
              value={newUser.professionalNo}
              onChange={(e) => setNewUser({ ...newUser, professionalNo: e.target.value })}
              placeholder="เช่น ว.12345 หรือ 4567890123"
            />

            <Select
              label="ตำแหน่ง"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={[
                { value: 'doctor', label: 'แพทย์' },
                { value: 'nurse', label: 'พยาบาล' },
                { value: 'medical_record', label: 'เวชระเบียน' },
                { value: 'admin', label: 'ผู้ดูแลระบบ' },
              ]}
            />
          </div>

          <Input
            label="ชื่อ-นามสกุล"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            placeholder="ชื่อ นามสกุล"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="เบอร์โทรศัพท์"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="08X-XXX-XXXX"
            />

            <Input
              label="อีเมล"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="email@hospital.com"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p>ผู้ใช้จะต้องตั้ง PIN เองเมื่อเข้าสู่ระบบครั้งแรก</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddUser} className="flex-1">
              เพิ่มผู้ใช้
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset PIN Modal */}
      <Modal
        isOpen={showResetPinModal}
        onClose={() => {
          setShowResetPinModal(false);
          setSelectedUser(null);
        }}
        title="รีเซ็ต PIN"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            คุณต้องการรีเซ็ต PIN ของผู้ใช้นี้ใช่หรือไม่?
          </p>
          <p className="text-sm text-gray-500">
            ผู้ใช้จะต้องตั้ง PIN ใหม่เมื่อเข้าสู่ระบบครั้งถัดไป
          </p>

          <div className="flex gap-3">
            <Button onClick={handleResetPin} variant="danger" className="flex-1">
              รีเซ็ต PIN
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetPinModal(false);
                setSelectedUser(null);
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
