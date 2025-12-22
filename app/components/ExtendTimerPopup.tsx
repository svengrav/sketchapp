import { ClockIcon, ForwardIcon, PlusIcon } from "@heroicons/react/24/solid";
import { PopupBase } from "./PopupBase.tsx";

type ExtendTimerPopupProps = {
  isOpen: boolean;
  onExtend: () => void;
  onSkip: () => void;
  extensionMinutes: number;
};

export function ExtendTimerPopup({
  isOpen,
  onExtend,
  onSkip,
  extensionMinutes,
}: ExtendTimerPopupProps) {
  return (
    <PopupBase isOpen={isOpen} maxWidth="xs" closeOnBackdrop={false}>
      <div className="text-center">
        <ClockIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        
        <h2 className="text-white text-lg font-semibold mb-2">
          Time's up!
        </h2>
        <p className="text-white/60 text-sm mb-6">
          Need more time for this sketch?
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onExtend}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Extend +{extensionMinutes} Min
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white/80 py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <ForwardIcon className="w-5 h-5" />
            Next Image
          </button>
        </div>
      </div>
    </PopupBase>
  );
}
