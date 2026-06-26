'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/ui/PinInput';
import { CheckCircle, Plus } from 'lucide-react';
import { getRoleName } from '@/lib/utils';

export default function SetupPinPage() {
  const router = useRouter();
  const { currentUser, setupPin } = useAuthStore();
  const [step, setStep] = useState<'info' | 'pin' | 'confirm' | 'contact'>('info');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const handleInfoConfirm = () => setStep('pin');

  const handlePinSet = (value: string) => {
    setPin(value);
    setStep('confirm');
  };

  const handlePinConfirm = (value: string) => {
    if (value !== pin) {
      setError('PIN ไม่ตรงกัน กรุณาลองใหม่');
      return;
    }
    setError('');
    setStep('contact');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      setError('กรุณากรอกเบอร์โทรศัพท์หรืออีเมลอย่างน้อย 1 อย่าง');
      return;
    }
    setupPin(pin);
    router.push('/dashboard');
  };

  const steps = ['ยืนยันตัวตน', 'ตั้ง PIN', 'ยืนยัน PIN', 'ข้อมูลติดต่อ'];
  const currentStepIndex = ['info', 'pin', 'confirm', 'contact'].indexOf(step);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#002d73] px-6 py-5 text-center">
          <div className="w-14 h-14 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Plus className="w-8 h-8 text-[#002d73]" strokeWidth={3} />
          </div>
          <h1 className="text-white text-lg font-bold">ตั้งค่าครั้งแรก</h1>
          <p className="text-blue-200 text-sm">สวัสดี {currentUser.fullName}</p>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-[#002d73] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle size={14} /> : index + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'info' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                  <span className="font-medium">{currentUser.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">เลขวิชาชีพ:</span>
                  <span className="font-medium">{currentUser.professionalNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ตำแหน่ง:</span>
                  <span className="font-medium">{getRoleName(currentUser.role)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                กรุณาตรวจสอบข้อมูลของคุณ
              </p>

              <Button onClick={handleInfoConfirm} className="w-full" size="lg">
                ข้อมูลถูกต้อง
              </Button>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ตั้ง PIN 6 หลัก</h2>
                <p className="text-gray-500 text-sm">กรุณาตั้ง PIN สำหรับเข้าสู่ระบบ</p>
              </div>

              <PinInput onComplete={handlePinSet} />

              <button
                onClick={() => setStep('info')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← กลับ
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ยืนยัน PIN</h2>
                <p className="text-gray-500 text-sm">กรอก PIN อีกครั้งเพื่อยืนยัน</p>
              </div>

              <PinInput onComplete={handlePinConfirm} error={error} />

              <button
                onClick={() => { setStep('pin'); setPin(''); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← กลับ
              </button>
            </div>
          )}

          {step === 'contact' && (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ข้อมูลติดต่อ</h2>
                <p className="text-gray-500 text-sm">สำหรับรีเซ็ต PIN กรณีลืม</p>
              </div>

              <Input
                label="เบอร์โทรศัพท์"
                type="tel"
                placeholder="08X-XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                label="อีเมล"
                type="email"
                placeholder="example@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />

              <Button type="submit" className="w-full" size="lg">
                เสร็จสิ้น
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
