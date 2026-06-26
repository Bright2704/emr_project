'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/ui/PinInput';
import { CheckCircle, Mail, Phone, Plus } from 'lucide-react';

export default function ResetPinPage() {
  const router = useRouter();
  const [step, setStep] = useState<'username' | 'method' | 'otp' | 'newpin' | 'confirm' | 'success'>('username');
  const [professionalNo, setProfessionalNo] = useState('');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalNo.trim()) {
      setError('กรุณากรอกเลขใบประกอบวิชาชีพ');
      return;
    }
    setError('');
    setStep('method');
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('กรุณากรอก OTP 6 หลัก');
      return;
    }
    setError('');
    setStep('newpin');
  };

  const handleNewPinSet = (value: string) => {
    setNewPin(value);
    setStep('confirm');
  };

  const handlePinConfirm = (value: string) => {
    if (value !== newPin) {
      setError('PIN ไม่ตรงกัน กรุณาลองใหม่');
      return;
    }
    setError('');
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-brand px-6 py-5 text-center">
          <div className="w-14 h-14 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Plus className="w-8 h-8 text-brand" strokeWidth={3} />
          </div>
          <h1 className="text-white text-lg font-bold">ลืม PIN</h1>
          <p className="text-blue-200 text-sm">รีเซ็ต PIN ด้วย OTP</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'username' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm text-center">
                กรอกเลขใบประกอบวิชาชีพเพื่อรีเซ็ต PIN
              </p>

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

              <Link
                href="/login"
                className="block text-center text-sm text-gray-500 hover:text-gray-700"
              >
                ← กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </form>
          )}

          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm text-center">เลือกช่องทางรับ OTP</p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`w-full p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                    method === 'phone' ? 'border-brand bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="text-brand" size={20} />
                  <div className="text-left">
                    <div className="font-medium text-sm">SMS</div>
                    <div className="text-xs text-gray-500">08X-XXX-X567</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`w-full p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                    method === 'email' ? 'border-brand bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="text-brand" size={20} />
                  <div className="text-left">
                    <div className="font-medium text-sm">อีเมล</div>
                    <div className="text-xs text-gray-500">s***@hospital.com</div>
                  </div>
                </button>
              </div>

              <Button onClick={handleSendOtp} className="w-full" size="lg" loading={loading}>
                ส่ง OTP
              </Button>

              <button onClick={() => setStep('username')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← กลับ
              </button>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm text-center">
                กรอก OTP 6 หลักที่ส่งไปยัง {method === 'phone' ? 'SMS' : 'อีเมล'}
              </p>

              <Input
                label="รหัส OTP"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-xl tracking-widest"
                error={error}
              />

              <button type="button" onClick={handleSendOtp} className="w-full text-sm text-brand hover:underline">
                ส่ง OTP อีกครั้ง
              </button>

              <Button type="submit" className="w-full" size="lg">
                ยืนยัน OTP
              </Button>

              <button onClick={() => setStep('method')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← กลับ
              </button>
            </form>
          )}

          {step === 'newpin' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">ตั้ง PIN ใหม่</h2>
                <p className="text-gray-500 text-sm">กรุณาตั้ง PIN 6 หลักใหม่</p>
              </div>

              <PinInput onComplete={handleNewPinSet} />

              <button onClick={() => setStep('otp')} className="w-full text-sm text-gray-500 hover:text-gray-700">
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

              <button onClick={() => { setStep('newpin'); setNewPin(''); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← กลับ
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">สำเร็จ!</h2>
                <p className="text-gray-500 text-sm">รีเซ็ต PIN เรียบร้อยแล้ว</p>
              </div>

              <Button onClick={() => router.push('/login')} className="w-full" size="lg">
                ไปหน้าเข้าสู่ระบบ
              </Button>
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
