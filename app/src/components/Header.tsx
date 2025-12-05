import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="flex items-center justify-between px-3 py-4 shrink-0 border-b border-zinc-700">
      {/* App Title */}
      <div className="text-white text-md font-semibold flex items-center gap-1.5 cursor-pointer  m-auto">
        <Logo classNames="w-6 h-6" />
        <span>Sketch App</span>
      </div>
      <InformationCircleIcon className="w-7 h-7 text-white " />
    </header>
  );
}
