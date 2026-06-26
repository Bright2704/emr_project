'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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

  const handleUsernameSubmit = (e: FormEvent) => {
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
    <div className="min-h-dvh bg-canvas flex items-center justify-center p-4 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,45,115,0.10),transparent)]"
      />
      <div className="relative bg-white rounded-2xl shadow-pop w-full max-w-sm overflow-hidden border border-gray-200/70 animate-pop-in">
        {/* Header */}
        <div className="bg-brand px-6 py-6 text-center">
          <div className="w-14 h-14 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center shadow-sm">
            <Plus className="w-8 h-8 text-brand" strokeWidth={3} />
          </div>
          <h1 className="text-white text-lg font-bold">EMR SCAN VIEWER</h1>
          <p className="text-blue-200 text-sm mt-1">ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">เข้าสู่ระบบ</h2>
                <p className="text-gray-500 text-sm">กรอกเลขใบประกอบวิชาชีพของคุณ</p>
              </div>

              <Input
                label="เลขใบประกอบวิชาชีพ"
                placeholder="เช่น ว.12345 หรือ 4567890123"
                value={professionalNo}
                onChange={(e) => setProfessionalNo(e.target.value)}
                error={error}
              />

              <Button type="submit" className="w-full" size="lg">
                ถัดไป
              </Button>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">ทดสอบระบบด้วยบัญชี:</p>
                <p className="text-xs text-gray-600">
                  <span className="font-mono">ว.12345</span> (แพทย์) |
                  <span className="font-mono"> 4567890123</span> (พยาบาล) |
                  <span className="font-mono"> ADMIN001</span> (Admin)
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">กรอก PIN</h2>
                <p className="text-gray-500 text-sm">กรอก PIN 6 หลักของคุณ</p>
                <p className="text-sm text-brand font-medium mt-2">{professionalNo}</p>
              </div>

              <PinInput
                onComplete={handlePinComplete}
                error={error}
                disabled={loading}
              />

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  PIN สำหรับทดสอบ: <span className="font-mono font-bold">123456</span>
                </p>

                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/reset-pin"
                    className="text-sm text-brand hover:underline"
                  >
                    ลืม PIN?
                  </Link>
                  <span className="text-gray-300">|</span>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            EMR Scan Viewer v1.0 • โรงพยาบาลตัวอย่าง
          </p>
        </div>
      </div>
    </div>
  );
}
