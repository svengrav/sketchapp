import { ClockIcon } from "@heroicons/react/16/solid";
import { formatTime } from "../hooks/useTimer";
import { Controls } from "./Controls";

type ProgressBarProps = {
  progress: number;
  timeLeft: number;
};

export function ProgressBar({ progress, timeLeft }: ProgressBarProps) {
  // Verbleibende Zeit: 100% - Fortschritt = symmetrisch schrumpfend
  const remaining = 100 - progress;
  
  return (
    <div className="h-10 flex relative flex-col-reverse p-1.5 cursor-pointer mb-2">
      <div className="absolute self-center mb-10">
        <Controls />
      </div>
      <div className="h-full w-full flex justify-center">
        <div
          className="h-full bg-indigo-800 transition-all duration-1000 ease-linear rounded-md bg-linear-to-r from-sky-600 via-indigo-800 to-sky-600"
          style={{ width: `${remaining}%` }}
        />
      </div>
      {/* Timer Overlay */}
      <div className="absolute inset-0 flex items-center justify-center ">
        <div className="flex items-center gap-2 text-indigo-100 font-semibold text-md">
          <ClockIcon className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}
