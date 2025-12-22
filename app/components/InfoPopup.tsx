import { APP_VERSION, GITHUB_URL } from "../env.ts";
import { Logo } from "./Logo.tsx";
import { PopupBase } from "./PopupBase.tsx";

type InfoPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function InfoPopup({ isOpen, onClose }: InfoPopupProps) {
  return (
    <PopupBase isOpen={isOpen} onClose={onClose} title="About">
      <div className="space-y-4 text-white/80">
        {/* App Name & Version */}
        <div className="text-center pb-4 border-b border-zinc-700">
          <Logo classNames="w-16 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold">Sketch App</h3>
          <p className="text-white/50 text-sm">Version {APP_VERSION}</p>
        </div>

        {/* Description */}
        <p className="text-sm">
          A timed reference image viewer for artists and sketchers. 
          Practice gesture drawing with automatically rotating images.
        </p>

        {/* Credits */}
        <div className="pt-2">
          <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Credits</h4>
          <ul className="text-sm space-y-1">
            <li>
              Images by{" "}
              <a 
                href="https://unsplash.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Unsplash
              </a>
            </li>
            <li>
              Built with React & Zustand
            </li>
          </ul>
        </div>

        {/* GitHub Link */}
        <div className="pt-4 border-t border-zinc-700">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </PopupBase>
  );
}
