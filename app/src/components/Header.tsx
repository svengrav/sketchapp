import { Controls } from "./Controls";
import { Logo } from "./Logo";

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
    <header className="flex items-center justify-between px-3 py-4 bg-black/80 shrink-0 border-b border-zinc-700">
      {/* App Title */}
      <div className="text-white text-md font-semibold flex items-center gap-1.5 cursor-pointer">
        <Logo classNames="w-6 h-6" />
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
