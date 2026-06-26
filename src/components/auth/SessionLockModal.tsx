'use client';

import { useState } from 'react';
import { Lock, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store';
import { PinInput } from '@/components/ui/PinInput';
import { Button } from '@/components/ui/Button';

interface SessionLockModalProps {
  isOpen: boolean;
  lockType: 'pin' | 'full';
  onUnlock: () => void;
}

export function SessionLockModal({ isOpen, lockType, onUnlock }: SessionLockModalProps) {
  const { currentUser, unlockWithPin, logout } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    setError('');

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = unlockWithPin(pin);
    setLoading(false);

    if (result.success) {
      onUnlock();
    } else {
      setError(result.error || 'PIN ไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleSwitchUser = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#002d73] px-6 py-5 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-lg font-bold">
            {lockType === 'pin' ? 'หมดเวลาใช้งาน' : 'Session หมดอายุ'}
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            {lockType === 'pin'
              ? 'กรุณากรอก PIN เพื่อดำเนินการต่อ'
              : 'กรุณาเข้าสู่ระบบใหม่'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {lockType === 'pin' && currentUser ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-[#002d73] rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{currentUser.fullName}</div>
                  <div className="text-sm text-gray-500">{currentUser.professionalNo}</div>
                </div>
              </div>

              {/* PIN Input */}
              <div className="pt-2">
                <PinInput
                  onComplete={handlePinComplete}
                  error={error}
                  disabled={loading}
                />
              </div>

              {/* Test PIN hint */}
              <p className="text-xs text-center text-gray-500">
                PIN สำหรับทดสอบ: <span className="font-mono font-bold">123456</span>
              </p>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleSwitchUser}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <LogOut size={14} />
                  เปลี่ยนผู้ใช้
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                Session ของคุณหมดอายุแล้ว<br />
                กรุณาเข้าสู่ระบบใหม่อีกครั้ง
              </p>

              <Button onClick={handleLogout} className="w-full" size="lg">
                <LogOut size={20} className="mr-2" />
                ไปหน้าเข้าสู่ระบบ
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {lockType === 'pin'
              ? 'ระบบล็อกอัตโนมัติเมื่อไม่ใช้งาน 30 นาที'
              : 'ระบบออกจากระบบอัตโนมัติเมื่อไม่ใช้งาน 1 ชั่วโมง'}
          </p>
        </div>
      </div>
    </div>
  );
}
