import { CameraIcon, ClockIcon } from "@heroicons/react/24/solid";
import type { SketchImage } from "../services/api";
import { formatTime } from "../hooks/useTimer";

type FooterProps = {
  image: SketchImage;
  progress: number;
  timeLeft: number;
};

export function Footer({ image, progress, timeLeft }: FooterProps) {
  // Verbleibende Zeit: 100% - Fortschritt = von rechts nach links abnehmend
  const remaining = 100 - progress;

  return (
    <footer className="bg-black/80 shrink-0">
      {/* Progress Bar */}
      <div className="relative h-6 bg-black/30">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear ml-auto"
          style={{ width: `${remaining}%` }}
        />
        {/* Timer Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1 text-white font-mono text-sm">
            <ClockIcon className="w-3 h-3" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Photographer Credit */}
      <div className="px-3 py-1">
        <a
          href={`${image.photographerUrl}?utm_source=sketchapp&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 text-xs hover:text-white transition-colors flex items-center gap-1"
        >
          <CameraIcon className="w-3 h-3" />
          {image.photographer}
        </a>
      </div>
    </footer>
  );
}
