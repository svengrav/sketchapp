import type { TimerOption } from "../hooks/useTimer";
import { timerOptions, formatTime } from "../hooks/useTimer";

type ControlsProps = {
  selectedTimer: TimerOption;
  onTimerChange: (option: TimerOption) => void;
  isRunning: boolean;
  timeLeft: number;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
};

export function Controls({
  selectedTimer,
  onTimerChange,
  isRunning,
  timeLeft,
  onStart,
  onPause,
  onSkip,
}: ControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      {/* Timer-Anzeige */}
      <div className="bg-black/50 text-white px-4 py-2 rounded-lg font-mono text-xl">
        {formatTime(timeLeft)}
      </div>

      {/* Timer-Auswahl */}
      <select
        value={selectedTimer.seconds}
        onChange={(e) => {
          const option = timerOptions.find(
            (t) => t.seconds === Number(e.target.value)
          );
          if (option) onTimerChange(option);
        }}
        disabled={isRunning}
        className="bg-black/50 text-white px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50"
      >
        {timerOptions.map((option) => (
          <option key={option.seconds} value={option.seconds}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Start/Pause Button */}
      <button
        onClick={isRunning ? onPause : onStart}
        className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {isRunning ? "Pause" : "Start"}
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 block rounded-lg transition-colors"
      >
      Next
      </button>
    </div>
  );
}
