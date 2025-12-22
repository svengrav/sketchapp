// ============================================
// Unsplash API Service
// ============================================

export type SketchImage = {
  id: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
  cachedAt: number;
  query?: string;
  category?: ImageCategory;
};

// Image Categories
export const IMAGE_CATEGORIES = ["cities", "landscapes", "people", "animals"] as const;
export type ImageCategory = typeof IMAGE_CATEGORIES[number];
export const DEFAULT_CATEGORY: ImageCategory = "cities";

// Suchbegriffe pro Kategorie
const CATEGORY_QUERIES: Record<ImageCategory, string[]> = {
  cities: [
    "city street",
    "urban architecture",
    "old town",
    "city square",
    "european city",
    "cityscape",
    "street scene",
    "historic building",
  ],
  landscapes: [
    "mountain landscape",
    "countryside",
    "forest path",
    "lake scenery",
    "coastal landscape",
    "valley view",
    "nature panorama",
    "rural scenery",
  ],
  people: [
    "portrait photography",
    "street portrait",
    "candid people",
    "human expression",
    "people sitting",
    "person standing",
    "cafe scene people",
    "market people",
  ],
  animals: [
    "wildlife photography",
    "bird portrait",
    "cat portrait",
    "dog portrait",
    "animal close up",
    "zoo animals",
    "farm animals",
    "pets",
  ],
};

export type UnsplashResult = {
  success: true;
  image: SketchImage;
} | {
  success: false;
  rateLimited: boolean;
  error: string;
};

export function getRandomQueryForCategory(category: ImageCategory): string {
  const queries = CATEGORY_QUERIES[category];
  return queries[Math.floor(Math.random() * queries.length)];
}

export function isValidCategory(value: string): value is ImageCategory {
  return IMAGE_CATEGORIES.includes(value as ImageCategory);
}

export async function fetchFromUnsplash(
  accessKey: string,
  category: ImageCategory = DEFAULT_CATEGORY
): Promise<UnsplashResult> {
  if (!accessKey) {
    return { success: false, rateLimited: false, error: "UNSPLASH_ACCESS_KEY not set" };
  }

  const query = getRandomQueryForCategory(category);

  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  // Rate Limit Check
  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get("X-Ratelimit-Remaining");
    console.warn(`Unsplash rate limited (remaining: ${remaining})`);
    return { success: false, rateLimited: true, error: "Rate limit exceeded" };
  }

  if (!response.ok) {
    return { success: false, rateLimited: false, error: `API error: ${response.status}` };
  }

  const data = await response.json();

  return {
    success: true,
    image: {
      id: data.id,
      url: data.urls.regular,
      city: data.location?.city || data.location?.country || data.alt_description || "Unknown",
      photographer: data.user.name,
      photographerUrl: data.user.links.html,
      cachedAt: Date.now(),
      query,
      category,
    },
  };
}

export async function fetchFromUnsplashCustom(
  accessKey: string,
  customQuery: string
): Promise<UnsplashResult> {
  if (!accessKey) {
    return { success: false, rateLimited: false, error: "UNSPLASH_ACCESS_KEY not set" };
  }

  if (!customQuery.trim()) {
    return { success: false, rateLimited: false, error: "Custom query cannot be empty" };
  }

  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(customQuery.trim())}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  // Rate Limit Check
  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get("X-Ratelimit-Remaining");
    console.warn(`Unsplash rate limited (remaining: ${remaining})`);
    return { success: false, rateLimited: true, error: "Rate limit exceeded" };
  }

  if (!response.ok) {
    return { success: false, rateLimited: false, error: `API error: ${response.status}` };
  }

  const data = await response.json();

  return {
    success: true,
    image: {
      id: data.id,
      url: data.urls.regular,
      city: data.location?.city || data.location?.country || data.alt_description || "Unknown",
      photographer: data.user.name,
      photographerUrl: data.user.links.html,
      cachedAt: Date.now(),
      query: customQuery,
      category: undefined, // Custom queries don't have categories
    },
  };
}
