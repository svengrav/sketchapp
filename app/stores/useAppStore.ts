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
  imageHistory: SketchImage[];
  historyIndex: number;
}

interface ImageActions {
  loadNewImage: (category?: ImageCategory, customQuery?: string) => Promise<void>;
  skip: () => void;
  setCategory: (category: ImageCategory) => void;
  goBack: () => void;
  goForward: () => void;
  addImageToHistory: (image: SketchImage) => void;
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
  imageHistory: USE_DEMO_MODE ? [DEMO_IMAGE] : [],
  historyIndex: USE_DEMO_MODE ? 0 : -1,

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
      
      // Add to history instead of setting directly
      get().addImageToHistory(image);
      set({ isImageLoading: false });
    } catch (err) {
      console.error("Failed to load image:", err);
      set({ 
        imageError: err instanceof Error ? err.message : "Failed to load image",
        isImageLoading: false 
      });
    }
  },

  skip: () => {
    // Load new image and add to history
    const { loadNewImage } = get();
    loadNewImage();
  },

  setCategory: (category: ImageCategory) => {
    set({ category });
  },

  addImageToHistory: (image: SketchImage) => {
    const { imageHistory, historyIndex } = get();
    
    // If we're not at the end of history, remove everything after current index
    const newHistory = imageHistory.slice(0, historyIndex + 1);
    
    // Add new image
    newHistory.push(image);
    
    // Maintain max 10 images (FIFO)
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    
    set({
      imageHistory: newHistory,
      historyIndex: newHistory.length - 1,
      currentImage: image,
    });
  },

  goBack: () => {
    const { imageHistory, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        currentImage: imageHistory[newIndex],
      });
    }
  },

  goForward: () => {
    const { imageHistory, historyIndex } = get();
    if (historyIndex < imageHistory.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        currentImage: imageHistory[newIndex],
      });
    } else {
      // At end of history, load new image
      get().loadNewImage();
    }
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
    goBack: state.goBack,
    goForward: state.goForward,
    imageHistory: state.imageHistory,
    historyIndex: state.historyIndex,
    canGoBack: state.historyIndex > 0,
    canGoForward: state.historyIndex < state.imageHistory.length - 1,
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
