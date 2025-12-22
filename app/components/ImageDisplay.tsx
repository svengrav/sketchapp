import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import clsx from "clsx";
import { EdgeOverlay } from "./EdgeOverlay.tsx";
import { GridOverlay } from "./GridOverlay.tsx";
import { useEdgeOverlay, useGridOverlay } from "../stores/useAppStore.ts";

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
  imageUrl: string;
  imageAlt: string;
  imageId: string;
  imageMode: ImageMode;
  isLoading?: boolean;
};

export function ImageDisplay({ imageUrl, imageAlt, imageId, imageMode, isLoading }: ImageDisplayProps) {
  const { showEdges, opacity } = useEdgeOverlay();
  const { showGrid, gridSize, opacity: gridOpacity, color: gridColor } = useGridOverlay();

  return (
    <div className="relative w-full h-full overflow-hidden bg-linear-to-t from-black bg-zinc-950 p-2">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}
      
      <TransformWrapper
        initialScale={modeScale[imageMode]}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        key={`${imageId}-${imageMode}`}
        onInit={(ref) => {
          // Manuell zentrieren nach Initialisierung
          setTimeout(() => {
            ref.centerView(modeScale[imageMode], 0);
          }, 50);
        }}
      >
        <TransformComponent
          wrapperStyle={{ 
            width: "100%", 
            height: "100%",
            borderRadius: 10,
            overflow: 'hidden',
          }}
          contentStyle={{ 

            width: "100%",
            height: "100%",
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
          }}
        >
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={imageAlt}
              className={clsx(
                "max-w-full max-h-full object-contain rounded-md transition-opacity",
                showEdges && "opacity-10"
              )}
            />
            {showEdges && (
              <EdgeOverlay imageUrl={imageUrl} opacity={opacity} />
            )}
            {showGrid && (
              <GridOverlay gridSize={gridSize} opacity={gridOpacity} color={gridColor} />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
