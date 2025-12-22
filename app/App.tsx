import {
  useTimerStore,
  selectProgress,
} from "./stores/useTimerStore.ts";
import {
  useAppStore,
} from "./stores/useAppStore.ts";
import { useSettingsStore } from "./stores/useSettingsStore.ts";
import { useAppInitialization } from "./hooks/useAppInitialization.ts";
import { useTimerInterval } from "./hooks/useTimerInterval.ts";
import { useWelcomeFlow } from "./hooks/useWelcomeFlow.ts";
import { AppWrapper } from "./components/AppWrapper.tsx";
import { ImageDisplay } from "./components/ImageDisplay.tsx";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { SettingsPopup } from "./components/SettingsPopup.tsx";
import { ExtendTimerPopup } from "./components/ExtendTimerPopup.tsx";
import { WelcomePopup } from "./components/WelcomePopup.tsx";
import { ProgressBar } from "./components/ProgressBar.tsx";

const EXTEND_MINUTES = 2;

function App() {
  const { settings, updateSettings } = useSettingsStore();

  // Timer Store
  const {
    timeLeft,
    selectedTimer,
    extendPopupOpen,
    skipAndRestart,
    extendAndClose,
  } = useTimerStore();

  // App Store (Image + UI)
  const {
    currentImage,
    settingsOpen,
    isImageLoading,
    closeSettings,
    loadNewImage,
  } = useAppStore();

  const progress = useTimerStore(selectProgress);

  // Initialize app state from settings on mount
  useAppInitialization();

  // Run timer interval
  useTimerInterval(settings.showExtendPrompt);

  // Handle welcome flow
  const { handleWelcomeStart } = useWelcomeFlow();

  return (
    <AppWrapper>
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
              onSave={updateSettings}
            />

            <ExtendTimerPopup
              isOpen={extendPopupOpen}
              onExtend={() => extendAndClose(EXTEND_MINUTES * 60)}
              onSkip={() => {
                skipAndRestart(() => loadNewImage(settings.category));
              }}
              extensionMinutes={EXTEND_MINUTES}
            />

            <WelcomePopup
              isOpen={!settings.hasSeenWelcome}
              initialTimer={selectedTimer}
              initialCategory={settings.category}
              onStart={handleWelcomeStart}
            />
          </>
        )}
      </div>
    </AppWrapper>
  );
}

export default App;
