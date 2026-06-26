'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDataStore, useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export default function NewPatientPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { patients, addPatient, addVisit, addAuditLog } = useDataStore();

  const [formData, setFormData] = useState({
    hn: '',
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicatePatient, setDuplicatePatient] = useState<typeof patients[0] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');

  const checkDuplicate = () => {
    const existing = patients.find(
      (p) => p.hn === formData.hn || p.nationalId === formData.nationalId
    );
    return existing;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hn.trim()) {
      newErrors.hn = 'กรุณากรอก HN';
    }
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (!/^\d{1}-\d{4}-\d{5}-\d{2}-\d{1}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'รูปแบบไม่ถูกต้อง (ตัวอย่าง: 1-1234-56789-01-2)';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'กรุณาเลือกวันเกิด';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check for duplicate
    const duplicate = checkDuplicate();
    if (duplicate) {
      setDuplicatePatient(duplicate);
      return;
    }

    // Create patient
    const patient = addPatient({
      hn: formData.hn,
      nationalId: formData.nationalId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: new Date(formData.dateOfBirth),
      createdBy: currentUser?.id || '',
    });

    setNewPatientId(patient.id);
    setShowSuccess(true);

    // Add audit log
    addAuditLog({
      userId: currentUser?.id || '',
      action: 'upload',
      targetType: 'patient',
      targetId: patient.id,
      detail: { action: 'create_patient', hn: patient.hn },
    });
  };

  const handleCreateVisitForExisting = () => {
    if (duplicatePatient) {
      router.push(`/visits?patientId=${duplicatePatient.id}&createNew=true`);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนผู้ป่วยใหม่</h1>
          <p className="text-gray-500">กรอกข้อมูลผู้ป่วยเพื่อสร้างโปรไฟล์ใหม่</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">ข้อมูลผู้ป่วย</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="HN (Hospital Number)"
                  placeholder="เช่น HN001234"
                  value={formData.hn}
                  onChange={(e) => setFormData({ ...formData, hn: e.target.value.toUpperCase() })}
                  error={errors.hn}
                />
                <Input
                  label="เลขบัตรประชาชน"
                  placeholder="1-1234-56789-01-2"
                  value={formData.nationalId}
                  onChange={(e) => {
                    // Auto-format national ID
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0) value = value.slice(0, 1) + '-' + value.slice(1);
                    if (value.length > 2) value = value.slice(0, 6) + '-' + value.slice(6);
                    if (value.length > 7) value = value.slice(0, 12) + '-' + value.slice(12);
                    if (value.length > 13) value = value.slice(0, 15) + '-' + value.slice(15);
                    setFormData({ ...formData, nationalId: value.slice(0, 17) });
                  }}
                  error={errors.nationalId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ชื่อ"
                  placeholder="ชื่อ"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={errors.firstName}
                />
                <Input
                  label="นามสกุล"
                  placeholder="นามสกุล"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={errors.lastName}
                />
              </div>

              <Input
                label="วันเกิด"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                error={errors.dateOfBirth}
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  บันทึกข้อมูล
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Duplicate Warning Modal */}
      <Modal
        isOpen={!!duplicatePatient}
        onClose={() => setDuplicatePatient(null)}
        title="พบข้อมูลผู้ป่วยซ้ำ"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-gray-700">
                พบผู้ป่วยที่มี HN หรือเลขบัตรประชาชนนี้อยู่แล้วในระบบ
              </p>
            </div>
          </div>

          {duplicatePatient && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">HN:</span>
                <span className="font-medium">{duplicatePatient.hn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                <span className="font-medium">
                  {duplicatePatient.firstName} {duplicatePatient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">วันเกิด:</span>
                <span className="font-medium">{formatDate(duplicatePatient.dateOfBirth)}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            ต้องการสร้างการรับบริการใหม่สำหรับผู้ป่วยนี้หรือไม่?
          </p>

          <div className="flex gap-3">
            <Button onClick={handleCreateVisitForExisting} className="flex-1">
              สร้างการรับบริการใหม่
            </Button>
            <Button
              variant="outline"
              onClick={() => setDuplicatePatient(null)}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push(`/patients/${newPatientId}`);
        }}
        title="สำเร็จ"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">ลงทะเบียนสำเร็จ!</h3>
            <p className="text-gray-500 mt-1">
              สร้างโปรไฟล์ผู้ป่วย {formData.firstName} {formData.lastName} เรียบร้อยแล้ว
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowSuccess(false);
                router.push(`/visits?patientId=${newPatientId}&createNew=true`);
              }}
              className="flex-1"
            >
              สร้างการรับบริการ
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccess(false);
                router.push(`/patients/${newPatientId}`);
              }}
            >
              ดูข้อมูลผู้ป่วย
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
