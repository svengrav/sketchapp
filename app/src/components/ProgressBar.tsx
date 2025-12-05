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
    <div className="h-8 flex relative flex-col-reverse p-1.5">
      <div
        className="h-full bg-indigo-800 transition-all duration-1000 ease-linear bg-linear-to-l from-indigo-500 "
        style={{ width: `${remaining}%`}}
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
