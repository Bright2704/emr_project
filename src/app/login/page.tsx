'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/ui/PinInput';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<'username' | 'pin'>('username');
  const [professionalNo, setProfessionalNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalNo.trim()) {
      setError('กรุณากรอกเลขใบประกอบวิชาชีพ');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(professionalNo, pin);
    setLoading(false);

    if (result.needSetup) {
      router.push('/setup-pin');
    } else if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-[#1e3a5f] text-3xl font-bold">+</span>
          </div>
          <h1 className="text-white text-xl font-bold">EMR SCAN VIEWER</h1>
          <p className="text-blue-200 text-sm mt-1">ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">เข้าสู่ระบบ</h2>
                <p className="text-gray-500 text-sm mt-1">กรอกเลขใบประกอบวิชาชีพของคุณ</p>
              </div>

              <Input
                label="เลขใบประกอบวิชาชีพ"
                placeholder="เช่น ว.12345 หรือ พย.67890"
                value={professionalNo}
                onChange={(e) => setProfessionalNo(e.target.value)}
                error={error}
              />

              <Button type="submit" className="w-full" size="lg">
                ถัดไป
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ทดสอบด้วย: <span className="font-mono text-gray-700">ว.12345</span> (แพทย์)
                </p>
                <p className="text-sm text-gray-500">
                  หรือ <span className="font-mono text-gray-700">ADMIN001</span> (Admin)
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">กรอก PIN</h2>
                <p className="text-gray-500 text-sm mt-1">
                  กรอก PIN 6 หลักของคุณ
                </p>
                <p className="text-sm text-[#1e3a5f] font-medium mt-2">
                  {professionalNo}
                </p>
              </div>

              <PinInput
                onComplete={handlePinComplete}
                error={error}
                disabled={loading}
              />

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500">
                  PIN สำหรับทดสอบ: <span className="font-mono text-gray-700">123456</span>
                </p>

                <Link
                  href="/reset-pin"
                  className="block text-sm text-[#1e3a5f] hover:underline"
                >
                  ลืม PIN?
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setStep('username');
                    setError('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← กลับ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t">
          <p className="text-xs text-gray-500">
            EMR Scan Viewer v1.0 • โรงพยาบาลตัวอย่าง
          </p>
        </div>
      </div>
    </div>
  );
}
