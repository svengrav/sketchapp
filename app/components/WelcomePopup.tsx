import { useState } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { PopupBase } from "./PopupBase.tsx";
import { SelectDropdown } from "./SelectDropdown.tsx";
import { Logo } from "./Logo.tsx";
import { timerOptions, type TimerOption } from "../hooks/useTimer.ts";
import { categoryOptions } from "../services/api.ts";
import type { ImageCategory } from "../services/api.ts";

// Timer-Optionen als SelectDropdown-Format
const timerDropdownOptions = timerOptions.map(t => ({ value: t, label: t.label }));

type WelcomePopupProps = {
  isOpen: boolean;
  onStart: (timer: TimerOption, category: ImageCategory) => void;
  initialTimer?: TimerOption;
  initialCategory?: ImageCategory;
};

export function WelcomePopup({ 
  isOpen, 
  onStart,
  initialTimer = timerOptions[2],
  initialCategory = "cities",
}: WelcomePopupProps) {
  const [selectedTimer, setSelectedTimer] = useState(initialTimer);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  return (
    <PopupBase isOpen={isOpen} closeOnBackdrop={false}>
      <div className="text-center">
        <Logo classNames="w-20 mx-auto mb-2" />

        <h1 className="text-white text-xl font-bold mb-4">
          Welcome to Sketch App
        </h1>

        <p className="text-white/70 mb-6 leading-relaxed">
          Practice your drawing skills with timed reference images. 
          A new image appears when the timer runs out.
        </p>

        {/* Timer Selection */}
        <div className="mb-4 text-left">
          <SelectDropdown
            value={selectedTimer}
            onChange={setSelectedTimer}
            options={timerDropdownOptions}
            label="Timer Duration"
          />
        </div>

        {/* Category Selection */}
        <div className="mb-6 text-left">
          <SelectDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            label="Image Category"
          />
        </div>

        <button
          type="button"
          onClick={() => onStart(selectedTimer, selectedCategory)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg font-medium transition-colors w-full cursor-pointer"
        >
          <PlayIcon className="w-5 h-5" />
          Start Drawing
        </button>
      </div>
    </PopupBase>
  );
}
