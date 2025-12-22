import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { fetchRandomImage, fetchImageWithCustomQuery } from "../services/api.ts";
import type { SketchImage, ImageCategory } from "../services/api.ts";

// Demo-Mode über ENV steuern
//@ts-ignore DENO
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === "true";

const DEMO_IMAGE: SketchImage = {
  id: "demo",
  url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920",
  city: "Paris (Demo)",
  photographer: "Demo Photographer",
  photographerUrl: "https://unsplash.com",
  category: "cities",
};

interface ImageState {
  currentImage: SketchImage | null;
  isImageLoading: boolean;
  imageError: string | null;
  category: ImageCategory;
}

interface ImageActions {
  loadNewImage: (category?: ImageCategory, customQuery?: string) => Promise<void>;
  skip: () => void;
  setCategory: (category: ImageCategory) => void;
}

interface UIState {
  settingsOpen: boolean;
  showEdges: boolean;
  edgeOpacity: number;
  showGrid: boolean;
  gridSize: number;
  gridOpacity: number;
  gridColor: string;
}

interface UIActions {
  openSettings: () => void;
  closeSettings: () => void;
  toggleEdges: () => void;
  setEdgeOpacity: (opacity: number) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setGridOpacity: (opacity: number) => void;
  setGridColor: (color: string) => void;
}

export interface AppStore extends ImageState, ImageActions, UIState, UIActions {}

export const useAppStore = create<AppStore>((set, get) => ({
  // Image State
  currentImage: USE_DEMO_MODE ? DEMO_IMAGE : null,
  isImageLoading: false,
  imageError: null,
  category: "cities" as ImageCategory,

  // Image Actions
  loadNewImage: async (overrideCategory?: ImageCategory, customQuery?: string) => {
    if (USE_DEMO_MODE) {
      console.log("Demo mode - skipping API fetch");
      return;
    }

    console.log("Loading new image with:", { overrideCategory, customQuery });
    const { currentImage, category } = get();
    set({ isImageLoading: true, imageError: null });
    
    try {
      let image;
      if (customQuery) {
        // Use custom query search
        console.log("Using custom query:", customQuery);
        image = await fetchImageWithCustomQuery(customQuery);
      } else {
        // Use category-based search
        const cat = overrideCategory ?? category;
        console.log("Using category:", cat);
        image = await fetchRandomImage(currentImage?.id, cat);
      }
      console.log("Image loaded:", image);
      set({ currentImage: image, isImageLoading: false });
    } catch (err) {
      console.error("Failed to load image:", err);
      set({ 
        imageError: err instanceof Error ? err.message : "Failed to load image",
        isImageLoading: false 
      });
    }
  },

  skip: () => {
    // Just load new image, timer is managed by useTimerStore
    const { loadNewImage, category } = get();
    loadNewImage(category);
  },

  setCategory: (category: ImageCategory) => {
    set({ category });
  },

  // UI State
  settingsOpen: false,
  showEdges: false,
  edgeOpacity: 0.6,
  showGrid: false,
  gridSize: 3,
  gridOpacity: 0.5,
  gridColor: "#ffffff",

  // UI Actions
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  toggleEdges: () => set((state) => ({ showEdges: !state.showEdges })),
  setEdgeOpacity: (opacity: number) => set({ edgeOpacity: opacity }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridSize: (size: number) => set({ gridSize: size }),
  setGridOpacity: (opacity: number) => set({ gridOpacity: opacity }),
  setGridColor: (color: string) => set({ gridColor: color }),
}));

// ============================================
// Use-Case Helper Hooks
// ============================================

/** Hook für Image-Anzeige */
export function useImageDisplay() {
  return useAppStore(useShallow((state) => ({
    currentImage: state.currentImage,
    isLoading: state.isImageLoading,
    error: state.imageError,
  })));
}

/** Hook für Image-Aktionen */
export function useImageActions() {
  return useAppStore(useShallow((state) => ({
    loadNewImage: state.loadNewImage,
    skip: state.skip,
    setCategory: state.setCategory,
    category: state.category,
  })));
}

/** Hook für Settings-Popup */
export function useSettingsPopup() {
  return useAppStore(useShallow((state) => ({
    isOpen: state.settingsOpen,
    open: state.openSettings,
    close: state.closeSettings,
  })));
}

/** Hook für Edge Overlay */
export function useEdgeOverlay() {
  return useAppStore(useShallow((state) => ({
    showEdges: state.showEdges,
    opacity: state.edgeOpacity,
    toggle: state.toggleEdges,
    setOpacity: state.setEdgeOpacity,
  })));
}

/** Hook für Grid Overlay */
export function useGridOverlay() {
  return useAppStore(useShallow((state) => ({
    showGrid: state.showGrid,
    gridSize: state.gridSize,
    opacity: state.gridOpacity,
    color: state.gridColor,
    toggle: state.toggleGrid,
    setSize: state.setGridSize,
    setOpacity: state.setGridOpacity,
    setColor: state.setGridColor,
  })));
}
