import { ReactNode } from "react";
import { useAppStore } from "../stores/useAppStore.ts";
import { Logo } from "./Logo.tsx";

type AppWrapperProps = {
  children: ReactNode;
};

/**
 * Wrapper component that handles loading and error states.
 * Shows loading/error screens or renders children (the main app).
 */
export function AppWrapper({ children }: AppWrapperProps) {
  const { currentImage, isImageLoading, imageError, loadNewImage } = useAppStore();

  // Loading State
  if (isImageLoading && !currentImage) {
    return (
      <div className="app-container w-screen flex flex-col items-center justify-center bg-black text-white">
        <Logo classNames="w-20 mb-2 animate-pulse" />
        <div className="text-lg text-zinc-400 ">Loading...</div>
      </div>
    );
  }

  // Error State
  if (imageError && !currentImage) {
    return (
      <div className="app-container w-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <div className="text-xl text-red-400">Error: {imageError}</div>
        <button
          type="button"
          onClick={() => loadNewImage()}
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Normal state - render children (main app)
  return <>{children}</>;
}