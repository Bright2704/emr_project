'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import Sidebar from './Sidebar';
import Header from './Header';
import { SessionManager } from '@/components/auth/SessionManager';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-card">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="text-gray-500 text-sm">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <SessionManager>
      <div className="min-h-screen flex bg-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionManager>
  );
}
