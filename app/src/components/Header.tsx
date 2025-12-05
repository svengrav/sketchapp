import { MapPinIcon } from "@heroicons/react/24/solid";
import type { SketchImage } from "../services/api";
import { Controls } from "./Controls";

type HeaderProps = {
  image: SketchImage;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onSettingsOpen: () => void;
};

export function Header({
  image,
  isRunning,
  onStart,
  onPause,
  onSkip,
  onSettingsOpen,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2 bg-black/80 shrink-0">
      {/* City Name */}
      <div className="text-white text-sm flex items-center gap-1 truncate mr-2">
        <MapPinIcon className="w-4 h-4 shrink-0" />
        <span className="truncate">{image.city}</span>
      </div>

      {/* Controls */}
      <Controls
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onSkip={onSkip}
        onSettingsOpen={onSettingsOpen}
      />
    </header>
  );
}
