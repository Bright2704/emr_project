'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Lock } from 'lucide-react';
import { useAuthStore } from '@/store';
import { getRoleName, formatThaiDate } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const { currentUser, logout, lockSession } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLockSession = () => {
    setShowDropdown(false);
    lockSession('pin');
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="text-gray-600 text-sm">
        ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย
      </div>

      <div className="flex items-center gap-6">
        {/* Date & Time */}
        <div className="text-right">
          <div className="text-xs text-gray-500">{formatThaiDate(currentTime)}</div>
          <div className="text-sm font-medium text-brand tabular-nums">
            {currentTime.toLocaleTimeString('th-TH')} น.
          </div>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">
                {currentUser?.fullName || 'ผู้ใช้งาน'}
              </div>
              <div className="text-xs text-gray-500">
                {currentUser ? getRoleName(currentUser.role) : ''}
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium">{currentUser?.fullName}</div>
                  <div className="text-xs text-gray-500">{currentUser?.professionalNo}</div>
                </div>
                <button
                  onClick={handleLockSession}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Lock size={16} />
                  <span>ล็อกหน้าจอ</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
