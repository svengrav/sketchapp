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
  { label: "30 Min", seconds: 1800 },
];

type UseTimerProps = {
  defaultOption?: TimerOption;
  initialSeconds?: number;
  onComplete: () => void;
};

export function useTimer({ defaultOption, initialSeconds, onComplete }: UseTimerProps) {
  // Find matching timer option for initialSeconds, or use default
  const getInitialOption = (): TimerOption => {
    if (initialSeconds) {
      const match = timerOptions.find(t => t.seconds === initialSeconds);
      if (match) return match;
    }
    return defaultOption || timerOptions[2];
  };

  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(getInitialOption);
  const [timeLeft, setTimeLeft] = useState(selectedTimer.seconds);
  const [totalDuration, setTotalDuration] = useState(selectedTimer.seconds);
  const [isRunning, setIsRunning] = useState(false);

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setTimeLeft(selectedTimer.seconds);
    setTotalDuration(selectedTimer.seconds);
    setIsRunning(false);
  }, [selectedTimer.seconds]);

  const extend = useCallback((seconds: number) => {
    setTimeLeft((prev) => {
      const newTime = prev + seconds;
      setTotalDuration(newTime); // Reset progress to 0%
      return newTime;
    });
    setIsRunning(true);
  }, []);

  const setDuration = useCallback((option: TimerOption) => {
    setSelectedTimer(option);
    setTimeLeft(option.seconds);
    setTotalDuration(option.seconds);
    setIsRunning(false);
  }, []);

  // Reset timeLeft wenn selectedTimer sich ändert
  useEffect(() => {
    setTimeLeft(selectedTimer.seconds);
    setTotalDuration(selectedTimer.seconds);
  }, [selectedTimer.seconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete();
          return 0; // Timer bleibt bei 0, Reset erfolgt extern
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  return { timeLeft, isRunning, progress, start, pause, reset, extend, selectedTimer, setDuration };
}

// Formatiere Sekunden zu MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
