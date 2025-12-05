import { useState, useCallback } from "react";
import { useTimer } from "./hooks/useTimer";
import { useSketchImage } from "./hooks/useSketchImage";
import { ImageDisplay } from "./components/ImageDisplay";
import type { ImageMode } from "./components/ImageDisplay";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SettingsPopup } from "./components/SettingsPopup";
import { ExtendTimerPopup } from "./components/ExtendTimerPopup";

const EXTEND_MINUTES = 2;

function App() {
  const { currentImage, isLoading, error, loadNewImage } = useSketchImage();
  const [imageMode, setImageMode] = useState<ImageMode>("balanced");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showExtendPrompt, setShowExtendPrompt] = useState(true);
  const [extendPopupOpen, setExtendPopupOpen] = useState(false);

  const handleTimerComplete = useCallback(() => {
    if (showExtendPrompt) {
      setExtendPopupOpen(true);
    } else {
      loadNewImage();
    }
  }, [showExtendPrompt, loadNewImage]);

  const { timeLeft, isRunning, progress, start, pause, reset, extend, selectedTimer, setDuration } = useTimer({
    onComplete: handleTimerComplete,
  });

  const handleExtend = () => {
    setExtendPopupOpen(false);
    extend(EXTEND_MINUTES * 60);
  };

  const handleSkipFromPopup = () => {
    setExtendPopupOpen(false);
    loadNewImage();
    reset();
    start();
  };

  const handleSkip = () => {
    loadNewImage();
    reset();
    if (isRunning) start();
  };

  // Loading State
  if (isLoading && !currentImage) {
    return (
      <div className="app-container w-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Error State
  if (error && !currentImage) {
    return (
      <div className="app-container w-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <div className="text-xl text-red-400">Error: {error}</div>
        <button
          onClick={loadNewImage}
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-container w-screen flex flex-col bg-black">
      {currentImage && (
        <>
          <Header
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onSkip={handleSkip}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
          
          <main className="flex-1 min-h-0">
            <ImageDisplay
              imageUrl={currentImage.url}
              imageAlt={currentImage.city}
              imageId={currentImage.id}
              imageMode={imageMode}
              isLoading={isLoading}
            />
          </main>
          
          <Footer
            image={currentImage}
            progress={progress}
            timeLeft={timeLeft}
          />

          <SettingsPopup
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            selectedTimer={selectedTimer}
            onTimerChange={setDuration}
            imageMode={imageMode}
            onImageModeChange={setImageMode}
            isRunning={isRunning}
            showExtendPrompt={showExtendPrompt}
            onExtendPromptChange={setShowExtendPrompt}
          />

          <ExtendTimerPopup
            isOpen={extendPopupOpen}
            onExtend={handleExtend}
            onSkip={handleSkipFromPopup}
            extensionMinutes={EXTEND_MINUTES}
          />
        </>
      )}
    </div>
  );
}

export default App;
