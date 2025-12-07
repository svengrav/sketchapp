import { useState, useCallback } from "react";
import type { TimerOption } from "./useTimer";
import { timerOptions } from "./useTimer";
import type { ImageMode } from "../components/ImageDisplay";
import type { ImageCategory } from "../services/api";

const STORAGE_KEY = "sketchapp-settings";

export interface AppSettings {
  timerSeconds: number;
  imageMode: ImageMode;
  showExtendPrompt: boolean;
  category: ImageCategory;
  hasSeenWelcome: boolean;
}

const defaultSettings: AppSettings = {
  timerSeconds: 300, // 5 Min
  imageMode: "balanced",
  showExtendPrompt: true,
  category: "cities",
  hasSeenWelcome: false,
};

function loadFromStorage(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load settings:", e);
  }
  return defaultSettings;
}

function persistToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings:", e);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadFromStorage);

  // Derived values
  const selectedTimer: TimerOption = 
    timerOptions.find(t => t.seconds === settings.timerSeconds) || timerOptions[2];

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    persistToStorage(newSettings);
  }, []);

  return {
    settings,
    selectedTimer,
    saveSettings,
  };
}
