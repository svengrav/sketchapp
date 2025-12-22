import { create } from "zustand";
import type { TimerOption } from "../hooks/useTimer.ts";
import { timerOptions } from "../hooks/useTimer.ts";
import type { ImageMode } from "../components/ImageDisplay.tsx";
import type { ImageCategory } from "../services/api.ts";
import { useTimerStore } from "./useTimerStore.ts";
import { useAppStore } from "./useAppStore.ts";

const STORAGE_KEY = "sketchapp-settings";

export interface AppSettings {
  timerSeconds: number;
  imageMode: ImageMode;
  showExtendPrompt: boolean;
  category: ImageCategory;
  hasSeenWelcome: boolean;
  queryMode: "category" | "custom";
  customQuery: string;
}

const defaultSettings: AppSettings = {
  timerSeconds: 300, // 5 Min
  imageMode: "balanced",
  showExtendPrompt: true,
  category: "cities",
  hasSeenWelcome: false,
  queryMode: "category",
  customQuery: "",
};

function loadFromStorage(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log("Raw stored settings:", stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("Parsed stored settings:", parsed);
      // Merge with defaults to ensure new fields exist
      const merged = { 
        ...defaultSettings, 
        ...parsed,
        // Ensure new fields are properly set
        queryMode: parsed.queryMode || defaultSettings.queryMode,
        customQuery: parsed.customQuery || defaultSettings.customQuery,
      };
      console.log("Final merged settings:", merged);
      return merged;
    }
  } catch (e) {
    console.warn("Failed to load settings:", e);
  }
  console.log("Using default settings:", defaultSettings);
  return defaultSettings;
}

function persistToStorage(settings: AppSettings): void {
  try {
    console.log("Saving settings to localStorage:", settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings:", e);
  }
}

interface SettingsStore {
  settings: AppSettings;
  selectedTimer: TimerOption;
  
  // Actions
  updateSettings: (newSettings: AppSettings) => void;
  markWelcomeSeen: () => void;
  
  // Internal
  _initialize: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  selectedTimer: timerOptions[2], // 5 minutes default
  
  updateSettings: (newSettings: AppSettings) => {
    const currentSettings = get().settings;
    console.log("Updating settings from:", currentSettings, "to:", newSettings);
    
    // Save to storage
    persistToStorage(newSettings);
    
    // Update local state
    const timerOption = timerOptions.find(t => t.seconds === newSettings.timerSeconds) || timerOptions[2];
    set({ 
      settings: newSettings,
      selectedTimer: timerOption
    });
    
    // Timer coordination
    const { selectedTimer, setDuration } = useTimerStore.getState();
    if (newSettings.timerSeconds !== currentSettings.timerSeconds && timerOption.seconds !== selectedTimer.seconds) {
      setDuration(timerOption);
    }
  },
  
  markWelcomeSeen: () => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, hasSeenWelcome: true };
    get().updateSettings(newSettings);
  },
  
  _initialize: () => {
    const loadedSettings = loadFromStorage();
    const timerOption = timerOptions.find(t => t.seconds === loadedSettings.timerSeconds) || timerOptions[2];
    set({ 
      settings: loadedSettings,
      selectedTimer: timerOption
    });
  },
}));

// Initialize on store creation
useSettingsStore.getState()._initialize();