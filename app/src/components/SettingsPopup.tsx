import { Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { TimerOption } from "../hooks/useTimer";
import { timerOptions } from "../hooks/useTimer";
import type { ImageMode } from "./ImageDisplay";
import { imageModes } from "./ImageDisplay";

type SettingsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTimer: TimerOption;
  onTimerChange: (option: TimerOption) => void;
  imageMode: ImageMode;
  onImageModeChange: (mode: ImageMode) => void;
  isRunning: boolean;
  showExtendPrompt: boolean;
  onExtendPromptChange: (value: boolean) => void;
};

export function SettingsPopup({
  isOpen,
  onClose,
  selectedTimer,
  onTimerChange,
  imageMode,
  onImageModeChange,
  isRunning,
  showExtendPrompt,
  onExtendPromptChange,
}: SettingsPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-xl p-6 z-50 w-[90vw] max-w-sm shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Timer Duration */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">Timer Duration</label>
          <div className="grid grid-cols-5 gap-2">
            {timerOptions.map((option) => (
              <button
                key={option.seconds}
                onClick={() => onTimerChange(option)}
                disabled={isRunning}
                className={`py-2 px-1 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                  selectedTimer.seconds === option.seconds
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-white/80 hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {isRunning && (
            <p className="text-white/40 text-xs mt-2">Pause timer to change duration</p>
          )}
        </div>

        {/* Image Mode */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">Image Fit</label>
          <div className="grid grid-cols-3 gap-2">
            {imageModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onImageModeChange(mode.value)}
                className={`py-2 px-3 text-sm rounded-lg transition-colors ${
                  imageMode === mode.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-white/80 hover:bg-gray-700"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extend Timer Prompt Toggle */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">When Timer Ends</label>
          <button
            onClick={() => onExtendPromptChange(!showExtendPrompt)}
            className={`w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between ${
              showExtendPrompt
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-white/80 hover:bg-gray-700"
            }`}
          >
            <span>Ask to extend time</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${
              showExtendPrompt ? "bg-indigo-400" : "bg-gray-600"
            }`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                showExtendPrompt ? "left-5" : "left-1"
              }`} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

// Settings Button für Header
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
      title="Settings"
    >
      <Cog6ToothIcon className="w-5 h-5" />
    </button>
  );
}
