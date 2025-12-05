import { useState, useCallback } from "react";
import { useTimer, timerOptions } from "./hooks/useTimer";
import { useSketchImage } from "./hooks/useSketchImage";
import { useSettings } from "./hooks/useSettings";
import { ImageDisplay } from "./components/ImageDisplay";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SettingsPopup } from "./components/SettingsPopup";
import { ExtendTimerPopup } from "./components/ExtendTimerPopup";
import { ProgressBar } from "./components/ProgressBar";

const EXTEND_MINUTES = 2;

function App() {
  const { currentImage, isLoading, error, loadNewImage } = useSketchImage();
  const { settings, saveSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extendPopupOpen, setExtendPopupOpen] = useState(false);

  const handleTimerComplete = useCallback(() => {
    if (settings.showExtendPrompt) {
      setExtendPopupOpen(true);
    } else {
      loadNewImage();
    }
  }, [settings.showExtendPrompt, loadNewImage]);

  const { timeLeft, isRunning, progress, start, pause, reset, extend, selectedTimer, setDuration } = useTimer({
    onComplete: handleTimerComplete,
    initialSeconds: settings.timerSeconds,
  });

  const handleSaveSettings = (newSettings: { timerSeconds: number; imageMode: typeof settings.imageMode; showExtendPrompt: boolean }) => {
    saveSettings(newSettings);
    // Update timer duration if changed
    const timerOption = timerOptions.find(t => t.seconds === newSettings.timerSeconds);
    if (timerOption && timerOption.seconds !== selectedTimer.seconds) {
      setDuration(timerOption);
    }
  };

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
          <ProgressBar progress={progress} timeLeft={timeLeft} />

          <main className="flex-1 min-h-0 bg-red-400">
            <ImageDisplay
              imageUrl={currentImage.url}
              imageAlt={currentImage.city}
              imageId={currentImage.id}
              imageMode={settings.imageMode}
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
            imageMode={settings.imageMode}
            showExtendPrompt={settings.showExtendPrompt}
            isRunning={isRunning}
            onSave={handleSaveSettings}
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
