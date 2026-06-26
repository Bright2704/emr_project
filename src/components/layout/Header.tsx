'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store';
import { getRoleName, formatThaiDate } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-gray-600 text-sm">
        ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย โรงพยาบาลตัวอย่าง
      </div>

      <div className="flex items-center gap-6">
        {/* Date & Time */}
        <div className="text-right">
          <div className="text-sm text-gray-600">{formatThaiDate(currentTime)}</div>
          <div className="text-lg font-semibold text-[#1e3a5f]">
            {currentTime.toLocaleTimeString('th-TH')} น.
          </div>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-600" />
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
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-medium">{currentUser?.fullName}</div>
                <div className="text-xs text-gray-500">{currentUser?.professionalNo}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
