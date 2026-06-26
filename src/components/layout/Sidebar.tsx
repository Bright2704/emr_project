'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  ScanLine,
  FileText,
  FolderCog,
  ClipboardList,
  Settings,
  UserCog,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'หน้าหลัก', icon: Home, roles: ['doctor', 'nurse', 'medical_record', 'admin'] },
  { href: '/patients', label: 'ผู้ป่วย', icon: Users, roles: ['nurse', 'medical_record', 'admin'] },
  { href: '/visits', label: 'การรับบริการ', icon: Calendar, roles: ['nurse', 'medical_record', 'admin'] },
  { href: '/scan', label: 'สแกน/อัปโหลด', icon: ScanLine, roles: ['nurse', 'medical_record', 'admin'] },
  { href: '/documents', label: 'เรียกดูเอกสาร', icon: FileText, roles: ['doctor', 'nurse', 'medical_record', 'admin'] },
  { href: '/manage', label: 'จัดการเอกสาร', icon: FolderCog, roles: ['medical_record', 'admin'] },
  { href: '/audit-log', label: 'บันทึกการใช้งาน', icon: ClipboardList, roles: ['admin'] },
  { href: '/users', label: 'จัดการบุคลากร', icon: UserCog, roles: ['medical_record', 'admin'] },
  { href: '/settings', label: 'ตั้งค่าระบบ', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();

  const filteredMenu = menuItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-[#1e3a5f] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#2d4a6f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#1e3a5f] font-bold text-lg">+</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">EMR SCAN VIEWER</h1>
            <p className="text-blue-200 text-xs">โรงพยาบาลตัวอย่าง</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-[#2d4a6f] text-white border-l-4 border-orange-500'
                      : 'text-blue-100 hover:bg-[#2d4a6f] hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2d4a6f]">
        <p className="text-blue-200 text-xs">EMR Scan Viewer v1.0</p>
        <p className="text-blue-300 text-xs">โรงพยาบาลตัวอย่าง</p>
        <p className="text-blue-400 text-xs">© 2024</p>
      </div>
    </aside>
  );
}
