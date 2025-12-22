import { useCallback, useEffect } from "react";
import {
  selectProgress,
  timerOptions,
  useAppStore,
} from "./stores/useAppStore.ts";
import { useSettings } from "./hooks/useSettings.ts";
import { ImageDisplay } from "./components/ImageDisplay.tsx";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { SettingsPopup } from "./components/SettingsPopup.tsx";
import { ExtendTimerPopup } from "./components/ExtendTimerPopup.tsx";
import { WelcomePopup } from "./components/WelcomePopup.tsx";
import { ProgressBar } from "./components/ProgressBar.tsx";
import { Logo } from "./components/Logo.tsx";

const EXTEND_MINUTES = 2;

function App() {
  const { settings, saveSettings } = useSettings();

  // Store state & actions
  const {
    isRunning,
    timeLeft,
    selectedTimer,
    settingsOpen,
    extendPopupOpen,
    currentImage,
    isImageLoading,
    imageError,
    start,
    extend,
    reset,
    setDuration,
    setCategory,
    tick,
    loadNewImage,
    skip,
    closeSettings,
    openExtendPopup,
    closeExtendPopup,
  } = useAppStore();

  const progress = useAppStore(selectProgress);

  // Sync category from settings to store on mount and when settings change
  useEffect(() => {
    setCategory(settings.category);
  }, [settings.category, setCategory]);

  // Load initial image
  useEffect(() => {
    if (!currentImage && !isImageLoading) {
      loadNewImage(settings.category);
    }
  }, []);

  // Timer interval effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const completed = tick();
      if (completed) {
        if (settings.showExtendPrompt) {
          openExtendPopup();
        } else {
          loadNewImage();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    settings.showExtendPrompt,
    loadNewImage,
    tick,
    openExtendPopup,
  ]);

  // Initialize timer from settings
  useEffect(() => {
    const timerOption = timerOptions.find((t) =>
      t.seconds === settings.timerSeconds
    );
    if (timerOption && timerOption.seconds !== selectedTimer.seconds) {
      setDuration(timerOption);
    }
  }, []); // Only on mount

  const handleSaveSettings = useCallback(
    (
      newSettings: {
        timerSeconds: number;
        imageMode: typeof settings.imageMode;
        showExtendPrompt: boolean;
        category: typeof settings.category;
        hasSeenWelcome: boolean;
      },
    ) => {
      const categoryChanged = newSettings.category !== settings.category;
      saveSettings(newSettings);
      setCategory(newSettings.category);

      // Update timer duration if changed
      const timerOption = timerOptions.find((t) =>
        t.seconds === newSettings.timerSeconds
      );
      if (timerOption && timerOption.seconds !== selectedTimer.seconds) {
        setDuration(timerOption);
      }
      // Reload image and reset timer if category changed
      if (categoryChanged) {
        loadNewImage(newSettings.category);
        reset(); // Reset timer & progress
      }
    },
    [
      settings.category,
      saveSettings,
      selectedTimer.seconds,
      setDuration,
      setCategory,
      loadNewImage,
      reset,
    ],
  );

  const handleExtend = useCallback(() => {
    closeExtendPopup();
    extend(EXTEND_MINUTES * 60);
  }, [closeExtendPopup, extend]);

  const handleSkipFromPopup = useCallback(() => {
    closeExtendPopup();
    reset();
    skip();
    start();
  }, [closeExtendPopup, reset, skip, start]);

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

  return (
    <div className="app-container w-screen flex flex-col bg-black">
      {currentImage && (
        <>
          <Header />

          <main className="flex-1 min-h-0">
            <ImageDisplay
              imageUrl={currentImage.url}
              imageAlt={currentImage.city}
              imageId={currentImage.id}
              imageMode={settings.imageMode}
              isLoading={isImageLoading}
            />
          </main>
          <ProgressBar progress={progress} timeLeft={timeLeft} />

          <Footer
            image={currentImage}
            progress={progress}
            timeLeft={timeLeft}
          />

          <SettingsPopup
            isOpen={settingsOpen}
            onClose={closeSettings}
            selectedTimer={selectedTimer}
            imageMode={settings.imageMode}
            showExtendPrompt={settings.showExtendPrompt}
            category={settings.category}
            onSave={handleSaveSettings}
          />

          <ExtendTimerPopup
            isOpen={extendPopupOpen}
            onExtend={handleExtend}
            onSkip={handleSkipFromPopup}
            extensionMinutes={EXTEND_MINUTES}
          />

          <WelcomePopup
            isOpen={!settings.hasSeenWelcome}
            initialTimer={selectedTimer}
            initialCategory={settings.category}
            onStart={(timer, category) => {
              saveSettings({
                ...settings,
                hasSeenWelcome: true,
                timerSeconds: timer.seconds,
                category: category,
              });
              setDuration(timer);
              setCategory(category);
              loadNewImage(category);
              start();
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
