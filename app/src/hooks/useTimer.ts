import { useState, useEffect, useCallback } from "react";

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

type UseTimerProps = {
  defaultOption?: TimerOption;
  onComplete: () => void;
};

export function useTimer({ defaultOption = timerOptions[2], onComplete }: UseTimerProps) {
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(defaultOption);
  const [timeLeft, setTimeLeft] = useState(selectedTimer.seconds);
  const [isRunning, setIsRunning] = useState(false);

  const duration = selectedTimer.seconds;
  const progress = ((duration - timeLeft) / duration) * 100;

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  const setDuration = useCallback((option: TimerOption) => {
    setSelectedTimer(option);
    setTimeLeft(option.seconds);
    setIsRunning(false);
  }, []);

  // Reset timeLeft wenn duration sich ändert
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete();
          return duration; // Reset für nächstes Bild
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, duration, onComplete]);

  return { timeLeft, isRunning, progress, start, pause, reset, selectedTimer, setDuration };
}

// Formatiere Sekunden zu MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
