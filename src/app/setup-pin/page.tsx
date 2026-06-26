'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/ui/PinInput';
import { CheckCircle } from 'lucide-react';

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

  const handleInfoConfirm = () => {
    setStep('pin');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] px-8 py-6 text-center">
          <h1 className="text-white text-xl font-bold">ตั้งค่าครั้งแรก</h1>
          <p className="text-blue-200 text-sm mt-1">
            สวัสดี {currentUser.fullName}
          </p>
        </div>

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-6">
            {['ยืนยันตัวตน', 'ตั้ง PIN', 'ยืนยัน PIN', 'ข้อมูลติดต่อ'].map((label, index) => {
              const stepIndex = ['info', 'pin', 'confirm', 'contact'].indexOf(step);
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;
              return (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[#1e3a5f] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? <CheckCircle size={16} /> : index + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-2">
          {step === 'info' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
                  <span className="font-medium">
                    {currentUser.role === 'doctor' && 'แพทย์'}
                    {currentUser.role === 'nurse' && 'พยาบาล'}
                    {currentUser.role === 'medical_record' && 'เวชระเบียน'}
                    {currentUser.role === 'admin' && 'ผู้ดูแลระบบ'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                กรุณาตรวจสอบข้อมูลของคุณ หากไม่ถูกต้องกรุณาติดต่อผู้ดูแลระบบ
              </p>

              <Button onClick={handleInfoConfirm} className="w-full" size="lg">
                ข้อมูลถูกต้อง ดำเนินการต่อ
              </Button>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ตั้ง PIN 6 หลัก</h2>
                <p className="text-gray-500 text-sm mt-1">
                  กรุณาตั้ง PIN สำหรับเข้าสู่ระบบ
                </p>
              </div>

              <PinInput onComplete={handlePinSet} />

              <button
                type="button"
                onClick={() => setStep('info')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← กลับ
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ยืนยัน PIN</h2>
                <p className="text-gray-500 text-sm mt-1">
                  กรอก PIN อีกครั้งเพื่อยืนยัน
                </p>
              </div>

              <PinInput onComplete={handlePinConfirm} error={error} />

              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setPin('');
                  setError('');
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← กลับ
              </button>
            </div>
          )}

          {step === 'contact' && (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ข้อมูลติดต่อ</h2>
                <p className="text-gray-500 text-sm mt-1">
                  สำหรับรีเซ็ต PIN กรณีลืม
                </p>
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
              />

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

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
