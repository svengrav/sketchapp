import { useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { useSketchImage } from "./hooks/useSketchImage";
import { ImageDisplay } from "./components/ImageDisplay";
import type { ImageMode } from "./components/ImageDisplay";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SettingsPopup } from "./components/SettingsPopup";

function App() {
  const { currentImage, isLoading, error, loadNewImage } = useSketchImage();
  const [imageMode, setImageMode] = useState<ImageMode>("balanced");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { timeLeft, isRunning, progress, start, pause, reset, selectedTimer, setDuration } = useTimer({
    onComplete: loadNewImage,
  });

  const handleSkip = () => {
    loadNewImage();
    reset();
    if (isRunning) start();
  };

  // Loading State
  if (isLoading && !currentImage) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Error State
  if (error && !currentImage) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
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
    <div className="w-screen h-screen flex flex-col bg-black">
      {currentImage && (
        <>
          <Header
            image={currentImage}
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
          />
        </>
      )}
    </div>
  );
}

export default App;
