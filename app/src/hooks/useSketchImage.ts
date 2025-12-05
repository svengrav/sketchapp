import { useState, useCallback, useEffect, useRef } from "react";
import { fetchRandomImage } from "../services/api";
import type { SketchImage } from "../services/api";

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

interface UseSketchImageReturn {
  currentImage: SketchImage | null;
  isLoading: boolean;
  error: string | null;
  loadNewImage: () => Promise<void>;
}

export function useSketchImage(): UseSketchImageReturn {
  const [currentImage, setCurrentImage] = useState<SketchImage | null>(
    USE_DEMO_MODE ? DEMO_IMAGE : null
  );
  const [isLoading, setIsLoading] = useState(!USE_DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  // Ref für aktuelle Image-ID (verhindert useCallback dependency loop)
  const currentImageIdRef = useRef<string | undefined>(undefined);
  currentImageIdRef.current = currentImage?.id;

  const loadNewImage = useCallback(async () => {
    if (USE_DEMO_MODE) {
      console.log("Demo mode - skipping API fetch");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const image = await fetchRandomImage(currentImageIdRef.current);
      setCurrentImage(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiales Bild laden (nur einmal)
  useEffect(() => {
    if (!USE_DEMO_MODE) {
      loadNewImage();
    }
  }, []);

  return { currentImage, isLoading, error, loadNewImage };
}
