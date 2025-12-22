import { useEffect } from "react";
import { useTimerStore } from "../stores/useTimerStore.ts";

/**
 * Manages the timer interval that runs when the timer is active.
 * Handles tick updates and timer completion logic.
 */
export function useTimerInterval(showExtendPrompt: boolean) {
  const { isRunning, tick, completeTimer } = useTimerStore();

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const completed = tick();
      if (completed) {
        completeTimer(showExtendPrompt);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, showExtendPrompt, tick, completeTimer]);
}