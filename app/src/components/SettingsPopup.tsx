import { useState, useEffect } from "react";
import { Cog6ToothIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import type { TimerOption } from "../hooks/useTimer";
import { timerOptions } from "../hooks/useTimer";
import type { ImageMode } from "./ImageDisplay";
import { imageModes } from "./ImageDisplay";

type SettingsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTimer: TimerOption;
  imageMode: ImageMode;
  showExtendPrompt: boolean;
  isRunning: boolean;
  onSave: (settings: { timerSeconds: number; imageMode: ImageMode; showExtendPrompt: boolean }) => void;
};

export function SettingsPopup({
  isOpen,
  onClose,
  selectedTimer,
  imageMode,
  showExtendPrompt,
  isRunning,
  onSave,
}: SettingsPopupProps) {
  // Local state for editing
  const [localTimer, setLocalTimer] = useState(selectedTimer);
  const [localImageMode, setLocalImageMode] = useState(imageMode);
  const [localExtendPrompt, setLocalExtendPrompt] = useState(showExtendPrompt);

  // Reset local state when popup opens
  useEffect(() => {
    if (isOpen) {
      setLocalTimer(selectedTimer);
      setLocalImageMode(imageMode);
      setLocalExtendPrompt(showExtendPrompt);
    }
  }, [isOpen, selectedTimer, imageMode, showExtendPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      timerSeconds: localTimer.seconds,
      imageMode: localImageMode,
      showExtendPrompt: localExtendPrompt,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const hasChanges = 
    localTimer.seconds !== selectedTimer.seconds ||
    localImageMode !== imageMode ||
    localExtendPrompt !== showExtendPrompt;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleCancel}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-xl p-6 z-50 w-[90vw] max-w-sm shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={handleCancel}
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
                onClick={() => setLocalTimer(option)}
                disabled={isRunning}
                className={`py-2 px-1 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                  localTimer.seconds === option.seconds
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
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
                onClick={() => setLocalImageMode(mode.value)}
                className={`py-2 px-3 text-sm rounded-lg transition-colors ${
                  localImageMode === mode.value
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extend Timer Prompt Toggle */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">When Timer Ends</label>
          <button
            onClick={() => setLocalExtendPrompt(!localExtendPrompt)}
            className={`w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between ${
              localExtendPrompt
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
            }`}
          >
            <span>Ask to extend time</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${
              localExtendPrompt ? "bg-indigo-400" : "bg-zinc-600"
            }`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                localExtendPrompt ? "left-5" : "left-1"
              }`} />
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 text-sm rounded-lg bg-zinc-800 text-white/80 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
              hasChanges
                ? "bg-indigo-600 text-white hover:bg-zinc-500"
                : "bg-indigo-600/50 text-white/50 cursor-default"
            }`}
          >
            <CheckIcon className="w-4 h-4" />
            Save
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
