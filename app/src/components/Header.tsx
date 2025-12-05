import { PaintBrushIcon } from "@heroicons/react/24/solid";
import { Controls } from "./Controls";

type HeaderProps = {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onSettingsOpen: () => void;
};

export function Header({
  isRunning,
  onStart,
  onPause,
  onSkip,
  onSettingsOpen,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2 bg-black/80 shrink-0">
      {/* App Title */}
      <div className="text-white text-sm font-semibold flex items-center gap-1.5">
        <PaintBrushIcon className="w-4 h-4 text-indigo-400" />
        <span>Sketch App</span>
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
