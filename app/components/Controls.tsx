import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { SettingsButton } from "./SettingsPopup.tsx";
import { useImageControls } from "../hooks/useImageControls.ts";

export function Controls() {
  const {
    isRunning,
    start,
    pause,
    skip,
    quickExtend,
    extensionMinutes,
    showGrid,
    toggleGrid,
    openSettings,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useImageControls();

  return (
    <div className="flex items-center gap-2 bg-zinc-900 px-2 rounded-md w-min border border-zinc-700">
      {/* Back Button */}
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        className={clsx(
          "text-white p-1 rounded-sm transition-colors cursor-pointer",
          !canGoBack && "opacity-40 cursor-not-allowed"
        )}
        title="Previous Image"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Start/Pause Button */}
      <button
        type="button"
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

      {/* Forward/Skip Button */}
      <button
        type="button"
        onClick={canGoForward ? goForward : skip}
        className=" text-white p-2 transition-colors cursor-pointer"
        title={canGoForward ? "Next Image" : "New Image"}
      >
        {canGoForward ? (
          <ChevronRightIcon className="w-5 h-5" />
        ) : (
          <ForwardIcon className="w-5 h-5" />
        )}
      </button>

      {/* Quick Extend Button */}
      <button
        type="button"
        onClick={quickExtend}
        className="flex items-center gap-1 text-white p-2 transition-colors cursor-pointer text-sm "
        title={`Add ${extensionMinutes} minute${extensionMinutes > 1 ? 's' : ''}`}
      >
        <PlusCircleIcon className="w-5 h-5" />
      </button>

      {/* Grid Toggle Button */}
      <button
        type="button" 
        onClick={toggleGrid}
        className={clsx(
          "text-white p-2 transition-colors cursor-pointer",
          showGrid && "text-indigo-400"
        )}
        title={showGrid ? "Hide Grid" : "Show Grid"}
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>

      {/* Settings Button */}
      <SettingsButton onClick={openSettings} />
    </div>
  );
}
