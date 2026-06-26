'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { SessionLockModal } from './SessionLockModal';

// Check interval in milliseconds
const CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

// Activity events to track
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    sessionLockType,
    updateActivity,
    checkSessionTimeout,
  } = useAuthStore();

  const [showLockModal, setShowLockModal] = useState(false);
  const [currentLockType, setCurrentLockType] = useState<'pin' | 'full'>('pin');

  // Paths that don't require session management
  const publicPaths = ['/login', '/reset-pin', '/setup-pin'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (isAuthenticated && !showLockModal) {
      updateActivity();
    }
  }, [isAuthenticated, showLockModal, updateActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (isPublicPath) return;

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, isPublicPath]);

  // Check session timeout periodically
  useEffect(() => {
    if (isPublicPath || !isAuthenticated) return;

    const checkTimeout = () => {
      const lockType = checkSessionTimeout();

      if (lockType === 'full') {
        setCurrentLockType('full');
        setShowLockModal(true);
      } else if (lockType === 'pin') {
        setCurrentLockType('pin');
        setShowLockModal(true);
      }
    };

    // Check immediately
    checkTimeout();

    // Set up interval
    const interval = setInterval(checkTimeout, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, isPublicPath, checkSessionTimeout]);

  // Handle session lock type changes from store
  useEffect(() => {
    if (sessionLockType === 'full') {
      setCurrentLockType('full');
      setShowLockModal(true);
    } else if (sessionLockType === 'pin') {
      setCurrentLockType('pin');
      setShowLockModal(true);
    } else if (sessionLockType === 'none' && showLockModal) {
      setShowLockModal(false);
    }
  }, [sessionLockType, showLockModal]);

  // Handle unlock
  const handleUnlock = () => {
    setShowLockModal(false);
  };

  // Handle full logout redirect
  useEffect(() => {
    if (currentLockType === 'full' && showLockModal && !isAuthenticated) {
      router.push('/login');
    }
  }, [currentLockType, showLockModal, isAuthenticated, router]);

  return (
    <>
      {children}
      <SessionLockModal
        isOpen={showLockModal && isAuthenticated}
        lockType={currentLockType}
        onUnlock={handleUnlock}
      />
    </>
  );
}
