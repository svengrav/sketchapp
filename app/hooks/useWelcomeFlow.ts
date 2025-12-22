import { useCallback } from "react";
import { useTimerStore } from "../stores/useTimerStore.ts";
import { useAppStore } from "../stores/useAppStore.ts";
import { useSettingsStore } from "../stores/useSettingsStore.ts";
import type { TimerOption } from "../stores/useTimerStore.ts";
import type { ImageCategory } from "../services/api.ts";

/**
 * Manages the welcome popup flow and initialization.
 * Handles the onStart action that sets up initial app state.
 */
export function useWelcomeFlow() {
  const { settings, updateSettings } = useSettingsStore();
  const { setDuration, start } = useTimerStore();
  const { setCategory, loadNewImage } = useAppStore();

  const handleWelcomeStart = useCallback(
    (timer: TimerOption, category: ImageCategory) => {
      updateSettings({
        ...settings,
        hasSeenWelcome: true,
        timerSeconds: timer.seconds,
        category: category,
      });
      setDuration(timer);
      setCategory(category);
      loadNewImage(category);
      start();
    },
    [settings, updateSettings, setDuration, setCategory, loadNewImage, start]
  );

  return { handleWelcomeStart };
}