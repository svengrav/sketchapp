import { useCallback } from "react";
import { useTimerStore } from "../stores/useTimerStore.ts";
import { useAppStore } from "../stores/useAppStore.ts";
import { useSettingsStore } from "../stores/useSettingsStore.ts";

/**
 * Hook that provides a unified API for image controls.
 * Combines timer, app, and grid functionality for the Controls component.
 */
export function useImageControls() {
  // Settings Store
  const { settings } = useSettingsStore();
  
  // Timer Store
  const {
    isRunning,
    selectedTimer,
    start,
    pause,
    extend,
    reset: resetTimer,
  } = useTimerStore();

  // App Store
  const {
    openSettings,
    showGrid,
    toggleGrid,
    loadNewImage,
    goBack,
    goForward,
    imageHistory,
    historyIndex,
  } = useAppStore();

  // Calculate extension time based on current timer duration
  const getExtensionSeconds = (totalSeconds: number): number => {
    if (totalSeconds >= 600) return 300; // 10+ Min → +5 Min
    return 60; // Otherwise → +1 Min
  };

  const extensionSeconds = getExtensionSeconds(selectedTimer.seconds);
  const extensionMinutes = extensionSeconds / 60;

  // Skip action: reset timer and load new image based on current query settings
  const skip = useCallback(() => {
    resetTimer();
    if (settings.queryMode === "custom") {
      loadNewImage(undefined, settings.customQuery);
    } else {
      loadNewImage(settings.category);
    }
  }, [resetTimer, loadNewImage, settings.category, settings.queryMode, settings.customQuery]);

  // Quick extend: add extension time to current timer
  const quickExtend = useCallback(() => {
    extend(extensionSeconds);
  }, [extend, extensionSeconds]);

  return {
    // Playback controls
    isRunning,
    start,
    pause,
    skip,

    // Quick extend
    quickExtend,
    extensionMinutes,

    // Navigation
    goBack,
    goForward,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < imageHistory.length - 1,

    // Grid controls
    showGrid,
    toggleGrid,

    // Settings
    openSettings,
  };
}