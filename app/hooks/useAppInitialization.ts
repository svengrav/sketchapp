import { useEffect } from "react";
import { useTimerStore, timerOptions } from "../stores/useTimerStore.ts";
import { useAppStore } from "../stores/useAppStore.ts";
import { useSettingsStore } from "../stores/useSettingsStore.ts";

/**
 * Initializes app state from settings on mount.
 * - Sets timer duration from settings
 * - Sets image category from settings
 * - Loads initial image
 *
 * Runs only once on component mount.
 */
export function useAppInitialization() {
  const { settings } = useSettingsStore();
  const {
    selectedTimer,
    setDuration,
  } = useTimerStore();

  const {
    currentImage,
    isImageLoading,
    setCategory,
    loadNewImage,
  } = useAppStore();

  // Initialize timer and category from settings
  useEffect(() => {
    const timerOption = timerOptions.find((t) => t.seconds === settings.timerSeconds);
    if (timerOption && timerOption.seconds !== selectedTimer.seconds) {
      setDuration(timerOption);
    }

    setCategory(settings.category);
  }, []); // Only on mount

  // Load initial image
  useEffect(() => {
    if (!currentImage && !isImageLoading) {
      if (settings.queryMode === "custom" && settings.customQuery) {
        loadNewImage(undefined, settings.customQuery);
      } else {
        loadNewImage(settings.category);
      }
    }
  }, []); // Only on mount
}

