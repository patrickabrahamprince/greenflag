import { registerPlugin } from '@capacitor/core';

// Bridges ios/App/App/ScreenshotDetectorPlugin.swift. No web implementation
// is registered -- callers must check Capacitor.isNativePlatform() (see
// lib/hooks/useScreenshotGuard.ts) before calling startWatching/stopWatching,
// since there is no way to detect a screenshot from a web page at all.
export interface ScreenshotDetectorPlugin {
  startWatching(): Promise<void>;
  stopWatching(): Promise<void>;
  addListener(
    eventName: 'screenshotTaken',
    listenerFunc: () => void
  ): Promise<{ remove: () => void }>;
}

export const ScreenshotDetector = registerPlugin<ScreenshotDetectorPlugin>('ScreenshotDetector');
