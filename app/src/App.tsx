import { useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { useSketchImage } from "./hooks/useSketchImage";
import { ImageDisplay } from "./components/ImageDisplay";
import type { ImageMode } from "./components/ImageDisplay";
import { Controls } from "./components/Controls";

function App() {
  const { currentImage, isLoading, error, loadNewImage } = useSketchImage();
  const [imageMode, setImageMode] = useState<ImageMode>("balanced");
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
    <div className="w-screen h-screen overflow-hidden bg-black">
      {currentImage && (
        <>
          <ImageDisplay image={currentImage} progress={progress} isLoading={isLoading} imageMode={imageMode} />
          <Controls
            selectedTimer={selectedTimer}
            onTimerChange={setDuration}
            isRunning={isRunning}
            timeLeft={timeLeft}
            onStart={start}
            onPause={pause}
            onSkip={handleSkip}
            imageMode={imageMode}
            onImageModeChange={setImageMode}
          />
        </>
      )}
    </div>
  );
}

export default App;
