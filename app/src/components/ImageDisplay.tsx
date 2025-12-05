import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import type { SketchImage } from "../services/api";
import { ProgressBar } from "./ProgressBar";

export type ImageMode = "cover" | "contain" | "balanced";

export const imageModes: { value: ImageMode; label: string }[] = [
  { value: "cover", label: "Fill" },
  { value: "contain", label: "Fit" },
  { value: "balanced", label: "Balanced" },
];

// Initial scale für jeden Modus
const modeScale: Record<ImageMode, number> = {
  cover: 1.5,
  contain: 1,
  balanced: 1.25,
};

type ImageDisplayProps = {
  image: SketchImage;
  progress: number;
  isLoading?: boolean;
  imageMode: ImageMode;
};

// Reset-Button Komponente (nutzt useControls Hook)
function ResetButton() {
  const { resetTransform } = useControls();
  return (
    <button
      onClick={() => resetTransform()}
      className="absolute bottom-6 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded text-sm transition-colors z-20"
    >
      Reset View
    </button>
  );
}

export function ImageDisplay({ image, progress, isLoading, imageMode }: ImageDisplayProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg">Loading next image...</div>
        </div>
      )}
      
      <TransformWrapper
        initialScale={modeScale[imageMode]}
        minScale={0.5}
        maxScale={5}
        centerOnInit={true}
        key={`${image.id}-${imageMode}`} // Reset bei Bild- oder Moduswechsel
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <img
            src={image.url}
            alt={image.city}
            className="max-w-full max-h-full object-contain"
          />
        </TransformComponent>
        <ResetButton />
      </TransformWrapper>
      
      {/* City Name */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm z-20">
        {image.city}
      </div>
      
      {/* Photographer Credit (Unsplash requirement) */}
      <a
        href={`${image.photographerUrl}?utm_source=sketchapp&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 left-4 bg-black/50 text-white/80 px-2 py-1 rounded text-xs hover:text-white transition-colors z-20"
      >
        📷 {image.photographer}
      </a>
      
      <ProgressBar progress={progress} />
    </div>
  );
}
