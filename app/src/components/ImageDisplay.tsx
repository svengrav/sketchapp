import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { EdgeOverlay } from "./EdgeOverlay";
import { useEdgeOverlay } from "../stores/useAppStore";

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

  return (
    <div className="relative w-full h-full overflow-hidden bg-linear-to-t from-black  bg-zinc-900 p-2">
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
        centerOnInit={true}
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
          }}
          contentStyle={{ 
            width: "100%",
            height: "100%",
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
          }}
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt={imageAlt}
              className={`max-w-full max-h-full object-contain rounded-md transition-opacity ${
                showEdges ? "opacity-10" : ""
              }`}
            />
            {showEdges && (
              <EdgeOverlay imageUrl={imageUrl} opacity={opacity} />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
