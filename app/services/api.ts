// API Service für SketchApp Backend
//@ts-ignore DENO
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8005";

// Image Categories (von API definiert)
export type ImageCategory = "cities" | "landscapes" | "people" | "animals";

// Kategorie-Optionen mit Labels für UI
export const categoryOptions: { value: ImageCategory; label: string }[] = [
  { value: "cities", label: "Cities" },
  { value: "landscapes", label: "Landscapes" },
  { value: "people", label: "People" },
  { value: "animals", label: "Animals" },
];

export type SketchImage = {
  id: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
  cachedAt?: number;
  category?: ImageCategory;
};

export type CategoriesResponse = {
  categories: ImageCategory[];
  default: ImageCategory;
};

export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch(`${API_BASE}/api/categories`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchRandomImage(excludeId?: string, category?: ImageCategory): Promise<SketchImage> {
  const params = new URLSearchParams();
  if (excludeId) params.set("exclude", excludeId);
  if (category) params.set("category", category);
  
  const queryString = params.toString();
  const url = `${API_BASE}/api/image${queryString ? `?${queryString}` : ""}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getCacheStatus(): Promise<{
  imageCount: number;
  lastFetch: number;
  lastFetchAgo: number;
}> {
  const response = await fetch(`${API_BASE}/api/cache/status`);
  return response.json();
}
