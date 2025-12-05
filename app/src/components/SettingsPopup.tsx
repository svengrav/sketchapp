import { useState, useEffect } from "react";
import { Cog6ToothIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import type { TimerOption } from "../hooks/useTimer";
import { timerOptions } from "../hooks/useTimer";
import type { ImageMode } from "./ImageDisplay";
import { imageModes } from "./ImageDisplay";
import type { ImageCategory } from "../services/api";
import { useEdgeOverlay } from "../stores/useAppStore";

// Kategorie-Optionen (Labels für UI)
const categoryOptions: { value: ImageCategory; label: string }[] = [
  { value: "cities", label: "Cities" },
  { value: "landscapes", label: "Landscapes" },
  { value: "people", label: "People" },
  { value: "animals", label: "Animals" },
];

type SettingsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTimer: TimerOption;
  imageMode: ImageMode;
  showExtendPrompt: boolean;
  category: ImageCategory;
  onSave: (settings: { timerSeconds: number; imageMode: ImageMode; showExtendPrompt: boolean; category: ImageCategory }) => void;
};

export function SettingsPopup({
  isOpen,
  onClose,
  selectedTimer,
  imageMode,
  showExtendPrompt,
  category,
  onSave,
}: SettingsPopupProps) {
  // Edge overlay state (directly from store, not part of save flow)
  const { showEdges, opacity, toggle: toggleEdges, setOpacity } = useEdgeOverlay();

  // Local state for editing
  const [localTimer, setLocalTimer] = useState(selectedTimer);
  const [localImageMode, setLocalImageMode] = useState(imageMode);
  const [localExtendPrompt, setLocalExtendPrompt] = useState(showExtendPrompt);
  const [localCategory, setLocalCategory] = useState(category);

  // Reset local state when popup opens
  useEffect(() => {
    if (isOpen) {
      setLocalTimer(selectedTimer);
      setLocalImageMode(imageMode);
      setLocalExtendPrompt(showExtendPrompt);
      setLocalCategory(category);
    }
  }, [isOpen, selectedTimer, imageMode, showExtendPrompt, category]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      timerSeconds: localTimer.seconds,
      imageMode: localImageMode,
      showExtendPrompt: localExtendPrompt,
      category: localCategory,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const hasChanges = 
    localTimer.seconds !== selectedTimer.seconds ||
    localImageMode !== imageMode ||
    localExtendPrompt !== showExtendPrompt ||
    localCategory !== category;

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
        </div>

        {/* Image Mode */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">Image Fit</label>
          <div className="grid grid-cols-3 gap-2">
            {imageModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setLocalImageMode(mode.value)}
                className={`py-2 px-3 text-sm rounded-lg transition-colors cursor-pointer ${
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

        {/* Image Category */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">Image Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalCategory(opt.value)}
                className={`py-2 px-3 text-sm rounded-lg transition-colors cursor-pointer ${
                  localCategory === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Edge Overlay Toggle */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">Drawing Aids</label>
          <button
            onClick={toggleEdges}
            className={`w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              showEdges
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
            }`}
          >
            <span>Show Edge Overlay</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${
              showEdges ? "bg-indigo-400" : "bg-zinc-600"
            }`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                showEdges ? "left-5" : "left-1"
              }`} />
            </span>
          </button>
          
          {/* Opacity Slider */}
          {showEdges && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Opacity</span>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Extend Timer Prompt Toggle */}
        <div className="mb-6">
          <label className="text-white/60 text-sm mb-2 block">When Timer Ends</label>
          <button
            onClick={() => setLocalExtendPrompt(!localExtendPrompt)}
            className={`w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
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
            className="flex-1 py-3 px-4 text-sm rounded-lg bg-zinc-800 text-white/80 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer${
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
      className=" text-white p-2 rounded-lg transition-colors"
      title="Settings"
    >
      <Cog6ToothIcon className="w-5 h-5" />
    </button>
  );
}
