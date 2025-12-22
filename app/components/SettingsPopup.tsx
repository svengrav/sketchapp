import { useState, useEffect } from "react";
import clsx from "clsx";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import type { TimerOption } from "../hooks/useTimer.ts";
import { timerOptions } from "../hooks/useTimer.ts";
import type { ImageMode } from "./ImageDisplay.tsx";
import { imageModes } from "./ImageDisplay.tsx";
import { categoryOptions } from "../services/api.ts";
import type { ImageCategory } from "../services/api.ts";
import { useEdgeOverlay, useGridOverlay } from "../stores/useAppStore.ts";
import { PopupBase } from "./PopupBase.tsx";
import { SelectDropdown } from "./SelectDropdown.tsx";

// Timer-Optionen als SelectDropdown-Format
const timerDropdownOptions = timerOptions.map(t => ({ value: t, label: t.label }));

type SettingsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTimer: TimerOption;
  imageMode: ImageMode;
  showExtendPrompt: boolean;
  category: ImageCategory;
  queryMode: "category" | "custom";
  customQuery: string;
  onSave: (settings: { timerSeconds: number; imageMode: ImageMode; showExtendPrompt: boolean; category: ImageCategory; hasSeenWelcome: boolean; queryMode: "category" | "custom"; customQuery: string }) => void;
};

export function SettingsPopup({
  isOpen,
  onClose,
  selectedTimer,
  imageMode,
  showExtendPrompt,
  category,
  queryMode,
  customQuery,
  onSave,
}: SettingsPopupProps) {
  // Edge overlay state (directly from store, not part of save flow)
  const { showEdges, opacity, toggle: toggleEdges, setOpacity } = useEdgeOverlay();
  
  // Grid overlay state (directly from store, not part of save flow)
  const { showGrid, gridSize, opacity: gridOpacity, color: gridColor, toggle: toggleGrid, setSize: setGridSize, setOpacity: setGridOpacity, setColor: setGridColor } = useGridOverlay();

  // Local state for editing
  const [localTimer, setLocalTimer] = useState(selectedTimer);
  const [localImageMode, setLocalImageMode] = useState(imageMode);
  const [localExtendPrompt, setLocalExtendPrompt] = useState(showExtendPrompt);
  const [localCategory, setLocalCategory] = useState(category);
  const [localQueryMode, setLocalQueryMode] = useState(queryMode);
  const [localCustomQuery, setLocalCustomQuery] = useState(customQuery);

  // Reset local state when popup opens
  useEffect(() => {
    if (isOpen) {
      setLocalTimer(selectedTimer);
      setLocalImageMode(imageMode);
      setLocalExtendPrompt(showExtendPrompt);
      setLocalCategory(category);
      setLocalQueryMode(queryMode);
      setLocalCustomQuery(customQuery);
    }
  }, [isOpen, selectedTimer, imageMode, showExtendPrompt, category, queryMode, customQuery]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      timerSeconds: localTimer.seconds,
      imageMode: localImageMode,
      showExtendPrompt: localExtendPrompt,
      category: localCategory,
      hasSeenWelcome: true,
      queryMode: localQueryMode,
      customQuery: localCustomQuery,
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
    localCategory !== category ||
    localQueryMode !== queryMode ||
    localCustomQuery !== customQuery;

  return (
    <PopupBase isOpen={isOpen} onClose={handleCancel} title="Settings">
      {/* Timer Duration */}
      <div className="mb-6">
        <SelectDropdown
          value={localTimer}
          onChange={setLocalTimer}
          options={timerDropdownOptions}
          label="Timer Duration"
        />
      </div>

      {/* Image Mode */}
      <div className="mb-6">
        <label className="text-white/60 text-sm mb-2 block">Image Fit</label>
        <div className="grid grid-cols-3 gap-2">
          {imageModes.map((mode) => (
            <button
              type="button"
              key={mode.value}
              onClick={() => setLocalImageMode(mode.value)}
              className={clsx(
                "py-2 px-3 text-sm rounded-lg transition-colors cursor-pointer",
                localImageMode === mode.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Category */}
      <div className="mb-6">
        {/* Query Mode Toggle */}
        <label className="text-white/60 text-sm mb-2 block">Image Source</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setLocalQueryMode("category")}
            className={clsx(
              "py-2 px-3 text-sm rounded-lg transition-colors cursor-pointer",
              localQueryMode === "category"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
            )}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setLocalQueryMode("custom")}
            className={clsx(
              "py-2 px-3 text-sm rounded-lg transition-colors cursor-pointer",
              localQueryMode === "custom"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
            )}
          >
            Custom Keywords
          </button>
        </div>
        
        {/* Category Selection (only if category mode) */}
        {localQueryMode === "category" && (
          <SelectDropdown
            value={localCategory}
            onChange={setLocalCategory}
            options={categoryOptions}
            label="Image Category"
          />
        )}
        
        {/* Custom Query Input (only if custom mode) */}
        {localQueryMode === "custom" && (
          <div>
            <label className="text-white/60 text-sm mb-2 block">Custom Keywords</label>
            <input
              type="text"
              value={localCustomQuery}
              onChange={(e) => setLocalCustomQuery(e.target.value)}
              placeholder="e.g. mountain lake, urban street art, vintage cars"
              className="w-full py-2.5 px-4 text-sm rounded-lg bg-zinc-800 text-white placeholder-white/40 border-0 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-white/40 text-xs mt-1">
              Enter keywords to search for specific types of images
            </p>
          </div>
        )}
      </div>

      {/* Edge Overlay Toggle */}
      <div className="mb-6">
        <label className="text-white/60 text-sm mb-2 block">Drawing Aids</label>
        <button
          type="button"
          onClick={toggleEdges}
          className={clsx(
            "w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer",
            showEdges
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
          )}
        >
          <span>Show Edge Overlay</span>
          <span className={clsx(
            "w-10 h-6 rounded-full relative transition-colors",
            showEdges ? "bg-indigo-400" : "bg-zinc-600"
          )}>
            <span className={clsx(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
              showEdges ? "left-5" : "left-1"
            )} />
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

      {/* Grid Overlay Section */}
      <div className="mb-6">
        <button
          type="button"
          onClick={toggleGrid}
          className={clsx(
            "w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer mb-3",
            showGrid
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
          )}
        >
          <span>Show Grid Overlay</span>
          <span className={clsx(
            "w-10 h-6 rounded-full relative transition-colors",
            showGrid ? "bg-indigo-400" : "bg-zinc-600"
          )}>
            <span className={clsx(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
              showGrid ? "left-5" : "left-1"
            )} />
          </span>
        </button>
        
        {showGrid && (
          <div className="space-y-3">
            {/* Grid Size Slider */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Grid Size</span>
                <span>{gridSize}×{gridSize}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            {/* Grid Opacity Slider */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Grid Opacity</span>
                <span>{Math.round(gridOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            {/* Grid Color */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Grid Color</span>
              </div>
              <div className="flex gap-2">
                {["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setGridColor(color)}
                    className={clsx(
                      "w-8 h-8 rounded-lg border-2 transition-all cursor-pointer",
                      gridColor === color ? "border-white scale-110" : "border-zinc-600 hover:border-zinc-400"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extend Timer Prompt Toggle */}
      <div className="mb-6">
        <label className="text-white/60 text-sm mb-2 block">When Timer Ends</label>
        <button
          type="button"
          onClick={() => setLocalExtendPrompt(!localExtendPrompt)}
          className={clsx(
            "w-full py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer",
            localExtendPrompt
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-white/80 hover:bg-zinc-700"
          )}
        >
          <span>Ask to extend time</span>
          <span className={clsx(
            "w-10 h-6 rounded-full relative transition-colors",
            localExtendPrompt ? "bg-indigo-400" : "bg-zinc-600"
          )}>
            <span className={clsx(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
              localExtendPrompt ? "left-5" : "left-1"
            )} />
          </span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 py-3 px-4 text-sm rounded-lg bg-zinc-800 text-white/80 hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={clsx(
            "flex-1 py-3 px-4 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer",
            hasChanges
              ? "bg-indigo-600 text-white hover:bg-zinc-500"
              : "bg-indigo-600/50 text-white/50 cursor-default"
          )}
        >
          Save
        </button>
      </div>
    </PopupBase>
  );
}

// Settings Button für Header
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className=" text-white p-2 rounded-lg transition-colors"
      title="Settings"
    >
      <Cog6ToothIcon className="w-5 h-5" />
    </button>
  );
}
