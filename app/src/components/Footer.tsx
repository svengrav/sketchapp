import { CameraIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/solid";
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
    <footer className="bg-black/80 shrink-0 border-t border-zinc-700">


      {/* Image Info & Photographer Credit */}
      <div className="px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
        {/* City Name */}
        <div className="text-white/80 flex items-center gap-1 truncate">
          <MapPinIcon className="w-3 h-3 shrink-0" />
          <span className="truncate">{image.city}</span>
        </div>

        {/* Photographer */}
        <a
          href={`${image.photographerUrl}?utm_source=sketchapp&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-white transition-colors flex items-center gap-1 shrink-0"
        >
          <CameraIcon className="w-3 h-3" />
          {image.photographer}
        </a>
      </div>
    </footer>
  );
}
