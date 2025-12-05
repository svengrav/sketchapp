import { ClockIcon, ForwardIcon, PlusIcon } from "@heroicons/react/24/solid";

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40" />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-xl p-6 z-50 w-[90vw] max-w-xs shadow-xl text-center">
        <ClockIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        
        <h2 className="text-white text-lg font-semibold mb-2">
          Time's up!
        </h2>
        <p className="text-white/60 text-sm mb-6">
          Need more time for this sketch?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onExtend}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Extend +{extensionMinutes} Min
          </button>
          
          <button
            onClick={onSkip}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white/80 py-3 px-4 rounded-lg transition-colors"
          >
            <ForwardIcon className="w-5 h-5" />
            Next Image
          </button>
        </div>
      </div>
    </>
  );
}
