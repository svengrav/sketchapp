import type { SketchImage } from "../services/api";
import { ProgressBar } from "./ProgressBar";

type ImageDisplayProps = {
  image: SketchImage;
  progress: number;
  isLoading?: boolean;
};

export function ImageDisplay({ image, progress, isLoading }: ImageDisplayProps) {
  return (
    <div className="relative w-full h-full">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg">Loading next image...</div>
        </div>
      )}
      
      <img
        src={image.url}
        alt={image.city}
        className="w-full h-full object-cover"
      />
      
      {/* City Name */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
        {image.city}
      </div>
      
      {/* Photographer Credit (Unsplash requirement) */}
      <a
        href={`${image.photographerUrl}?utm_source=sketchapp&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 left-4 bg-black/50 text-white/80 px-2 py-1 rounded text-xs hover:text-white transition-colors"
      >
        📷 {image.photographer}
      </a>
      
      <ProgressBar progress={progress} />
    </div>
  );
}
