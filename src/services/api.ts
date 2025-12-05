// API Service für SketchApp Backend

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type SketchImage = {
  id: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
  cachedAt: number;
};

export async function fetchRandomImage(excludeId?: string): Promise<SketchImage> {
  const params = excludeId ? `?exclude=${excludeId}` : "";
  
  const response = await fetch(`${API_BASE}/api/image${params}`);
  
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
