// Unsplash API Service
//@ts-ignore DENO specific
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = "https://api.unsplash.com";

export type UnsplashImage = {
  id: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
};

// Suchbegriffe für Urban Sketching
const SEARCH_QUERIES = [
  "city street",
  "urban architecture",
  "old town",
  "city square",
  "european city",
  "asian city",
  "cityscape",
  "street scene",
  "historic building",
  "urban landscape",
];

function getRandomQuery(): string {
  return SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
}

export async function fetchRandomImage(): Promise<UnsplashImage> {
  const query = getRandomQuery();
  
  const response = await fetch(
    `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.urls.regular, // Optimierte Größe (~1080px)
    city: data.location?.city || data.location?.country || data.alt_description || "Unknown",
    photographer: data.user.name,
    photographerUrl: data.user.links.html,
  };
}

// Mehrere Bilder vorladen für schnellere Wechsel
export async function prefetchImages(count: number = 3): Promise<UnsplashImage[]> {
  const promises = Array(count).fill(null).map(() => fetchRandomImage());
  const results = await Promise.allSettled(promises);
  
  return results
    .filter((r): r is PromiseFulfilledResult<UnsplashImage> => r.status === "fulfilled")
    .map((r) => r.value);
}
