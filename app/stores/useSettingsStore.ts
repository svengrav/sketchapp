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
    const categoryChanged = newSettings.category !== currentSettings.category;
    const timerChanged = newSettings.timerSeconds !== currentSettings.timerSeconds;
    
    // Save to storage
    persistToStorage(newSettings);
    
    // Update local state
    const timerOption = timerOptions.find(t => t.seconds === newSettings.timerSeconds) || timerOptions[2];
    set({ 
      settings: newSettings,
      selectedTimer: timerOption
    });
    
    // Coordinate with other stores
    const { setCategory, loadNewImage } = useAppStore.getState();
    const { selectedTimer, setDuration } = useTimerStore.getState();
    
    setCategory(newSettings.category);
    
    // Update timer duration if changed
    if (timerChanged && timerOption.seconds !== selectedTimer.seconds) {
      setDuration(timerOption);
    }
    
    // Reload image if category changed
    if (categoryChanged) {
      loadNewImage(newSettings.category);
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