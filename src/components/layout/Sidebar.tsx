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
  Plus,
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
    <aside className="w-60 bg-[#002d73] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#002d73]" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">EMR SCAN VIEWER</h1>
            <p className="text-blue-200 text-xs">โรงพยาบาลตัวอย่าง</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        <ul>
          {filteredMenu.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm border-l-4 transition-colors',
                    isActive
                      ? 'bg-white/10 text-white border-white font-medium'
                      : 'text-blue-100 border-transparent hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 text-blue-200 text-xs">
        <p>EMR Scan Viewer v1.0</p>
        <p>© 2024 โรงพยาบาลตัวอย่าง</p>
      </div>
    </aside>
  );
}
