import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

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

interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  totalDuration: number;
  selectedTimer: TimerOption;
  extendPopupOpen: boolean;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  extend: (seconds: number) => void;
  setDuration: (option: TimerOption) => void;
  tick: () => boolean; // Returns true if timer completed
  openExtendPopup: () => void;
  closeExtendPopup: () => void;
  completeTimer: (showExtendPrompt: boolean) => void;
  skipAndRestart: (onSkip: () => void) => void;
  extendAndClose: (seconds: number) => void;
}

export interface TimerStore extends TimerState, TimerActions {}

const defaultTimer = timerOptions[2]; // 5 Min

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Timer State
  isRunning: false,
  timeLeft: defaultTimer.seconds,
  totalDuration: defaultTimer.seconds,
  selectedTimer: defaultTimer,
  extendPopupOpen: false,

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
    set({
      timeLeft: seconds,
      totalDuration: seconds,
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
    const { timeLeft } = get();
    if (timeLeft <= 1) {
      return true; // Timer completed
    }
    set({ timeLeft: timeLeft - 1 });
    return false;
  },

  openExtendPopup: () => set({ extendPopupOpen: true }),
  
  closeExtendPopup: () => set({ extendPopupOpen: false }),

  completeTimer: (showExtendPrompt: boolean) => {
    if (showExtendPrompt) {
      // Open popup, leave timer at 0
      set({ extendPopupOpen: true });
    } else {
      // Auto-reset timer and keep running
      const { selectedTimer } = get();
      set({
        timeLeft: selectedTimer.seconds,
        totalDuration: selectedTimer.seconds,
      });
    }
  },

  skipAndRestart: (onSkip: () => void) => {
    const { selectedTimer } = get();
    set({
      extendPopupOpen: false,
      timeLeft: selectedTimer.seconds,
      totalDuration: selectedTimer.seconds,
      isRunning: true,
    });
    onSkip();
  },

  extendAndClose: (seconds: number) => {
    set({
      extendPopupOpen: false,
      timeLeft: seconds,
      totalDuration: seconds,
      isRunning: true,
    });
  },
}));

// ============================================
// Selector für Progress (computed value)
// ============================================
export const selectProgress = (state: TimerStore) =>
  ((state.totalDuration - state.timeLeft) / state.totalDuration) * 100;

// ============================================
// Use-Case Helper Hooks
// ============================================

/** Hook für Timer-Anzeige */
export function useTimerDisplay() {
  return useTimerStore(useShallow((state) => ({
    timeLeft: state.timeLeft,
    progress: selectProgress(state),
    isRunning: state.isRunning,
  })));
}

/** Hook für Timer-Konfiguration */
export function useTimerConfig() {
  return useTimerStore(useShallow((state) => ({
    selectedTimer: state.selectedTimer,
    setDuration: state.setDuration,
  })));
}

/** Hook für Extend-Timer-Popup */
export function useExtendPopup() {
  return useTimerStore(useShallow((state) => ({
    isOpen: state.extendPopupOpen,
    open: state.openExtendPopup,
    close: state.closeExtendPopup,
  })));
}
