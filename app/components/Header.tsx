import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Logo } from "./Logo.tsx";
import { InfoPopup } from "./InfoPopup.tsx";



export function Header() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-3 py-4 shrink-0 border-b border-zinc-700">
        {/* App Title */}
        <div className="text-white text-md font-semibold flex items-center gap-1.5 cursor-pointer  m-auto">
          <Logo classNames="w-6 h-6" />
          <span>Sketch App</span>
        </div>
        <button type="button" onClick={() => setInfoOpen(true)}>
          <InformationCircleIcon className="w-7 h-7 text-white/50 hover:text-white/80 transition-colors" />
        </button>
      </header>

      <InfoPopup isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
