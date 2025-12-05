import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import { SettingsButton } from "./SettingsPopup";
import { usePlaybackControls, useSettingsPopup } from "../stores/useAppStore";

export function Controls() {
  const { isRunning, start, pause, skip } = usePlaybackControls();
  const { open: openSettings } = useSettingsPopup();

  return (
    <div className="flex items-center gap-2 bg-zinc-900 px-2 rounded-md w-min border border-zinc-700">
      {/* Start/Pause Button */}
      <button
        onClick={isRunning ? pause : start}
        className=" text-white p-1 rounded-sm transition-colors cursor-pointer"
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
        onClick={skip}
        className=" text-white p-2 transition-colors cursor-pointer"
        title="Next Image"
      >
        <ForwardIcon className="w-5 h-5" />
      </button>

      {/* Settings Button */}
      <SettingsButton onClick={openSettings} />
    </div>
  );
}
