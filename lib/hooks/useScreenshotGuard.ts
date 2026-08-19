'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { ScreenshotDetector } from '@/lib/native/screenshotDetector';
import { useScreenshotContextStore } from '@/lib/store';

// Mount once, app-wide (see components/providers.tsx). iOS has no API to
// block a screenshot -- UIApplication.userDidTakeScreenshotNotification
// (bridged by ScreenshotDetectorPlugin) only fires after the OS has
// already captured it. This reacts: warns whoever took it, and -- if the
// current screen has registered a target via useScreenshotTarget below --
// notifies the other person. No-ops entirely on web and Android; there is
// no equivalent browser API at all, and no Android implementation of
// ScreenshotDetectorPlugin exists (Capacitor.isNativePlatform() is true on
// both iOS and Android, so this checks the platform specifically), so this
// only does anything inside the native iOS build.
export function useScreenshotGuard() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;

    let removeListener: (() => void) | null = null;
    let cancelled = false;

    ScreenshotDetector.startWatching().catch(() => {});
    ScreenshotDetector.addListener('screenshotTaken', () => {
      const { notifyUserId, context } = useScreenshotContextStore.getState();

      toast(
        notifyUserId ? "Screenshot detected — they've been notified." : 'Screenshot detected.',
        { icon: '📸', duration: 2000, position: 'top-center' }
      );

      if (notifyUserId) {
        fetch('/api/screenshot-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifyUserId, context }),
        }).catch(() => {});
      }
    }).then((handle) => {
      if (cancelled) {
        handle.remove();
      } else {
        removeListener = () => handle.remove();
      }
    });

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);
}

// Call from a screen that's showing another specific person's content
// (their submitted tasks, your chat with them, their profile) so the
// app-wide listener above knows who to notify if a screenshot happens
// while this screen is mounted. Clears itself on unmount/navigation.
export function useScreenshotTarget(
  notifyUserId: string | null | undefined,
  context: 'task' | 'messages' | 'profile'
) {
  const setScreenshotContext = useScreenshotContextStore((s) => s.setScreenshotContext);
  const clearScreenshotContext = useScreenshotContextStore((s) => s.clearScreenshotContext);

  useEffect(() => {
    if (!notifyUserId) return;
    setScreenshotContext(notifyUserId, context);
    return () => clearScreenshotContext();
  }, [notifyUserId, context, setScreenshotContext, clearScreenshotContext]);
}
