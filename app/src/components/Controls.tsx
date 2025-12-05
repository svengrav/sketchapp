import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import { SettingsButton } from "./SettingsPopup";

type ControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onSettingsOpen: () => void;
};

export function Controls({
  isRunning,
  onStart,
  onPause,
  onSkip,
  onSettingsOpen,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Start/Pause Button */}
      <button
        onClick={isRunning ? onPause : onStart}
        className="bg-white/90 hover:bg-white text-black p-2 rounded-lg transition-colors"
        title={isRunning ? "Pause" : "Start"}
      >
        {isRunning ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
        title="Next Image"
      >
        <ForwardIcon className="w-5 h-5" />
      </button>

      {/* Settings Button */}
      <SettingsButton onClick={onSettingsOpen} />
    </div>
  );
}
