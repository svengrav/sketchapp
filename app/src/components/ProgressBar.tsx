import { ClockIcon } from "@heroicons/react/24/solid";
import { formatTime } from "../hooks/useTimer";

type ProgressBarProps = {
  progress: number;
  timeLeft: number;
};

export function ProgressBar({ progress, timeLeft }: ProgressBarProps) {
  // Verbleibende Zeit: 100% - Fortschritt = von rechts nach links abnehmend
  const remaining = 100 - progress;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/30">
      <div
        className="h-full bg-indigo-600 transition-all duration-1000 ease-linear ml-auto"
        style={{ width: `${remaining}%` }}
      />
      {/* Timer Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white font-mono text-lg">
          <ClockIcon className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
