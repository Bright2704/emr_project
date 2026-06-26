'use client';

import { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDataStore } from '@/store';

export default function SettingsPage() {
  const { categories } = useDataStore();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategoryName, setAddCategoryName] = useState('');

  // System settings state
  const [scannerIP, setScannerIP] = useState('192.168.1.100');

  const handleSaveSettings = () => {
    // Mock save
    alert('บันทึกการตั้งค่าเรียบร้อย');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
          <p className="text-gray-500">จัดการการตั้งค่าและหมวดหมู่เอกสาร</p>
        </div>

        {/* Document Categories */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">หมวดหมู่เอกสาร</h2>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              เพิ่มหมวด
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อหมวด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingCategory === category.id ? (
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="max-w-xs"
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'success' : 'default'}>
                        {category.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingCategory === category.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Save edit
                              setEditingCategory(null);
                            }}
                          >
                            <Save size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(null)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category.id);
                              setNewCategoryName(category.name);
                            }}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">ตั้งค่าทั่วไป</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Session Timeout Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">การหมดเวลาอัตโนมัติ</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span><strong>30 นาที</strong> ไม่ใช้งาน → ต้องกรอก PIN ใหม่</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span><strong>1 ชั่วโมง</strong> ไม่ใช้งาน → ต้องเข้าสู่ระบบใหม่</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IP Scanner เครื่อง MFP"
                value={scannerIP}
                onChange={(e) => setScannerIP(e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleSaveSettings}>
                <Save size={20} className="mr-2" />
                บันทึกการตั้งค่า
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Scanner Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">ตั้งค่าเครื่องสแกน</h2>
          </CardHeader>
          <CardBody>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">สถานะการเชื่อมต่อ</p>
                  <p className="text-sm text-gray-500">eSCL Scanner @ {scannerIP}</p>
                </div>
                <Badge variant="success">เชื่อมต่อแล้ว</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="คุณภาพการสแกน"
                options={[
                  { value: '150', label: '150 DPI (เร็ว)' },
                  { value: '200', label: '200 DPI (แนะนำ)' },
                  { value: '300', label: '300 DPI (ละเอียด)' },
                ]}
              />

              <Select
                label="รูปแบบไฟล์"
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'png', label: 'PNG' },
                  { value: 'jpg', label: 'JPG' },
                ]}
              />
            </div>

            <Button variant="outline" className="mt-4">
              ทดสอบการเชื่อมต่อ
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddCategoryName('');
        }}
        title="เพิ่มหมวดหมู่เอกสาร"
      >
        <div className="space-y-4">
          <Input
            label="ชื่อหมวด"
            value={addCategoryName}
            onChange={(e) => setAddCategoryName(e.target.value)}
            placeholder="เช่น ผลตรวจเลือด"
          />

          <div className="flex gap-3">
            <Button
              onClick={() => {
                // Add category
                setShowAddModal(false);
                setAddCategoryName('');
              }}
              className="flex-1"
              disabled={!addCategoryName.trim()}
            >
              เพิ่มหมวด
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setAddCategoryName('');
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
