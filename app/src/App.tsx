import { useState, useCallback, useEffect } from "react";
import { fetchRandomImage } from "./services/api";
import type { SketchImage } from "./services/api";
import { useTimer, timerOptions } from "./hooks/useTimer";
import type { TimerOption } from "./hooks/useTimer";
import { ImageDisplay } from "./components/ImageDisplay";
import { Controls } from "./components/Controls";

// Demo-Mode über ENV steuern
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === "true";

// Demo-Bild für Entwicklung (spart API-Kontingent)
const DEMO_IMAGE: SketchImage = {
  id: "demo",
  url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920",
  city: "Paris (Demo)",
  photographer: "Demo Photographer",
  photographerUrl: "https://unsplash.com",
};

function App() {
  const [currentImage, setCurrentImage] = useState<SketchImage | null>(USE_DEMO_MODE ? DEMO_IMAGE : null);
  const [isLoading, setIsLoading] = useState(!USE_DEMO_MODE);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(
    timerOptions[2] // 5 Min default
  );

  const loadNewImage = useCallback(async () => {
    if (USE_DEMO_MODE) {
      console.log("Demo mode - skipping API fetch");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const image = await fetchRandomImage(currentImage?.id);
      setCurrentImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    } finally {
      setIsLoading(false);
    }
  }, [currentImage?.id]);

  // Initiales Bild laden
  useEffect(() => {
    if (!USE_DEMO_MODE) {
      loadNewImage();
    }
  }, [loadNewImage]);

  const { timeLeft, isRunning, progress, start, pause, reset } = useTimer({
    duration: selectedTimer.seconds,
    onComplete: loadNewImage,
  });

  const handleTimerChange = (option: TimerOption) => {
    setSelectedTimer(option);
    reset();
  };

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
          <ImageDisplay image={currentImage} progress={progress} isLoading={isLoading} />
          <Controls
            selectedTimer={selectedTimer}
            onTimerChange={handleTimerChange}
            isRunning={isRunning}
            timeLeft={timeLeft}
            onStart={start}
            onPause={pause}
            onSkip={handleSkip}
          />
        </>
      )}
    </div>
  );
}

export default App;
