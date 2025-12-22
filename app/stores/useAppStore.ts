import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { fetchRandomImage } from "../services/api.ts";
import type { SketchImage, ImageCategory } from "../services/api.ts";

export type TimerOption = {
  label: string;
  seconds: number;
};

export const timerOptions: TimerOption[] = [
  { label: "1 Min", seconds: 60 },
  { label: "3 Min", seconds: 180 },
  { label: "5 Min", seconds: 300 },
  { label: "10 Min", seconds: 600 },
  { label: "15 Min", seconds: 900 },
];

// Demo-Mode über ENV steuern
//@ts-ignore DENO
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === "true";

const DEMO_IMAGE: SketchImage = {
  id: "demo",
  url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920",
  city: "Paris (Demo)",
  photographer: "Demo Photographer",
  photographerUrl: "https://unsplash.com",
  category: "cities",
};

interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  totalDuration: number;
  selectedTimer: TimerOption;
  progress: number;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  extend: (seconds: number) => void;
  setDuration: (option: TimerOption) => void;
  tick: () => boolean; // Returns true if timer completed
}

interface ImageState {
  currentImage: SketchImage | null;
  isImageLoading: boolean;
  imageError: string | null;
  category: ImageCategory;
}

interface ImageActions {
  loadNewImage: (category?: ImageCategory) => Promise<void>;
  skip: () => void;
  setCategory: (category: ImageCategory) => void;
}

interface UIState {
  settingsOpen: boolean;
  extendPopupOpen: boolean;
  showEdges: boolean;
  edgeOpacity: number;
  showGrid: boolean;
  gridSize: number;
  gridOpacity: number;
}

interface UIActions {
  openSettings: () => void;
  closeSettings: () => void;
  openExtendPopup: () => void;
  closeExtendPopup: () => void;
  toggleEdges: () => void;
  setEdgeOpacity: (opacity: number) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setGridOpacity: (opacity: number) => void;
}

export interface AppStore extends TimerState, TimerActions, ImageState, ImageActions, UIState, UIActions {}

const defaultTimer = timerOptions[2]; // 5 Min

/** Berechnet die Extension-Dauer basierend auf der Gesamt-Zeit */
export function getExtensionSeconds(totalSeconds: number): number {
  if (totalSeconds >= 600) return 300; // 10+ Min → +5 Min
  return 60; // Sonst → +1 Min
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Timer State
  isRunning: false,
  timeLeft: defaultTimer.seconds,
  totalDuration: defaultTimer.seconds,
  selectedTimer: defaultTimer,
  get progress() {
    const { totalDuration, timeLeft } = get();
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  },

  // Timer Actions
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  
  reset: () => {
    const { selectedTimer } = get();
    set({
      timeLeft: selectedTimer.seconds,
      totalDuration: selectedTimer.seconds,
      isRunning: false,
    });
  },

  extend: (seconds: number) => {
    const { timeLeft } = get();
    const newTime = timeLeft + seconds;
    set({
      timeLeft: newTime,
      totalDuration: newTime,
      isRunning: true,
    });
  },

  setDuration: (option: TimerOption) => {
    set({
      selectedTimer: option,
      timeLeft: option.seconds,
      totalDuration: option.seconds,
      isRunning: false,
    });
  },

  tick: () => {
    const { timeLeft, selectedTimer } = get();
    if (timeLeft <= 1) {
      set({
        timeLeft: selectedTimer.seconds,
        totalDuration: selectedTimer.seconds,
      });
      return true; // Timer completed
    }
    set({ timeLeft: timeLeft - 1 });
    return false;
  },

  // Image State
  currentImage: USE_DEMO_MODE ? DEMO_IMAGE : null,
  isImageLoading: false,
  imageError: null,
  category: "cities" as ImageCategory,

  // Image Actions
  loadNewImage: async (overrideCategory?: ImageCategory) => {
    if (USE_DEMO_MODE) {
      console.log("Demo mode - skipping API fetch");
      return;
    }

    const { currentImage, category } = get();
    const cat = overrideCategory ?? category;
    set({ isImageLoading: true, imageError: null });
    
    try {
      const image = await fetchRandomImage(currentImage?.id, cat);
      set({ currentImage: image, isImageLoading: false });
    } catch (err) {
      set({ 
        imageError: err instanceof Error ? err.message : "Failed to load image",
        isImageLoading: false 
      });
    }
  },

  skip: () => {
    const { selectedTimer, isRunning, loadNewImage } = get();
    // Reset timer
    set({
      timeLeft: selectedTimer.seconds,
      totalDuration: selectedTimer.seconds,
      isRunning: isRunning, // Keep running state
    });
    // Load new image
    loadNewImage();
  },

  setCategory: (category: ImageCategory) => {
    set({ category });
  },

  // UI State
  settingsOpen: false,
  extendPopupOpen: false,
  showEdges: false,
  edgeOpacity: 0.6,
  showGrid: false,
  gridSize: 3,
  gridOpacity: 0.5,

  // UI Actions
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openExtendPopup: () => set({ extendPopupOpen: true }),
  closeExtendPopup: () => set({ extendPopupOpen: false }),
  toggleEdges: () => set((state) => ({ showEdges: !state.showEdges })),
  setEdgeOpacity: (opacity: number) => set({ edgeOpacity: opacity }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridSize: (size: number) => set({ gridSize: size }),
  setGridOpacity: (opacity: number) => set({ gridOpacity: opacity }),
}));

// ============================================
// Selector für Progress (computed value)
// ============================================
export const selectProgress = (state: AppStore) => 
  ((state.totalDuration - state.timeLeft) / state.totalDuration) * 100;

// ============================================
// Use-Case Helper Hooks
// ============================================

/** Hook für Playback-Controls (Play/Pause/Skip) */
export function usePlaybackControls() {
  return useAppStore(useShallow((state) => ({
    isRunning: state.isRunning,
    start: state.start,
    pause: state.pause,
    skip: state.skip,
  })));
}

/** Hook für Timer-Anzeige */
export function useTimerDisplay() {
  return useAppStore(useShallow((state) => ({
    timeLeft: state.timeLeft,
    progress: selectProgress(state),
    isRunning: state.isRunning,
  })));
}

/** Hook für Timer-Konfiguration */
export function useTimerConfig() {
  return useAppStore(useShallow((state) => ({
    selectedTimer: state.selectedTimer,
    setDuration: state.setDuration,
    extend: state.extend,
  })));
}

/** Hook für Image-Anzeige */
export function useImageDisplay() {
  return useAppStore(useShallow((state) => ({
    currentImage: state.currentImage,
    isLoading: state.isImageLoading,
    error: state.imageError,
  })));
}

/** Hook für Image-Aktionen */
export function useImageActions() {
  return useAppStore(useShallow((state) => ({
    loadNewImage: state.loadNewImage,
    skip: state.skip,
    setCategory: state.setCategory,
    category: state.category,
  })));
}

/** Hook für Settings-Popup */
export function useSettingsPopup() {
  return useAppStore(useShallow((state) => ({
    isOpen: state.settingsOpen,
    open: state.openSettings,
    close: state.closeSettings,
  })));
}

/** Hook für Extend-Timer-Popup */
export function useExtendPopup() {
  return useAppStore(useShallow((state) => ({
    isOpen: state.extendPopupOpen,
    open: state.openExtendPopup,
    close: state.closeExtendPopup,
    extend: state.extend,
  })));
}

/** Hook für Edge Overlay */
export function useEdgeOverlay() {
  return useAppStore(useShallow((state) => ({
    showEdges: state.showEdges,
    opacity: state.edgeOpacity,
    toggle: state.toggleEdges,
    setOpacity: state.setEdgeOpacity,
  })));
}

/** Hook für Quick-Extend Button */
export function useQuickExtend() {
  return useAppStore(useShallow((state) => ({
    selectedTimer: state.selectedTimer,
    extend: state.extend,
  })));
}

/** Hook für Grid Overlay */
export function useGridOverlay() {
  return useAppStore(useShallow((state) => ({
    showGrid: state.showGrid,
    gridSize: state.gridSize,
    opacity: state.gridOpacity,
    toggle: state.toggleGrid,
    setSize: state.setGridSize,
    setOpacity: state.setGridOpacity,
  })));
}
