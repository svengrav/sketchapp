// ============================================
// SketchApp API - Deno Server mit Azure Table Storage
// ============================================

import { serveStaticFile } from "./util/routeStaticFilesFrom.ts";

const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") || "";
const AZURE_STORAGE_CONNECTION_STRING = Deno.env.get("AZURE_STORAGE_CONNECTION_STRING") || "";
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const TABLE_NAME = "sketchimages";

// Typen
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
const DEFAULT_CATEGORY: ImageCategory = "cities";

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

// Azure Table Entity
type TableEntity = {
  PartitionKey: string;
  RowKey: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
  cachedAt: number;
  query: string;
  category: string;
};

// ============================================
// Azure Table Storage - REST API (ohne SDK)
// ============================================

function parseConnectionString(connStr: string): { accountName: string; accountKey: string } {
  const parts = connStr.split(";").reduce((acc, part) => {
    const [key, ...value] = part.split("=");
    acc[key] = value.join("=");
    return acc;
  }, {} as Record<string, string>);
  
  return {
    accountName: parts["AccountName"],
    accountKey: parts["AccountKey"],
  };
}

async function createHmacSignature(key: string, message: string): Promise<string> {
  const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
  const messageBytes = new TextEncoder().encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBytes);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function azureTableRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<Response> {
  const { accountName, accountKey } = parseConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const date = new Date().toUTCString();
  const url = `https://${accountName}.table.core.windows.net/${path}`;
  
  // Simplified Shared Key Lite for Table Service
  const stringToSign = `${date}\n/${accountName}/${path.split("?")[0]}`;
  const signature = await createHmacSignature(accountKey, stringToSign);
  
  const headers: HeadersInit = {
    "x-ms-date": date,
    "x-ms-version": "2020-12-06",
    "Authorization": `SharedKeyLite ${accountName}:${signature}`,
    "Accept": "application/json;odata=nometadata",
  };
  
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function ensureTableExists(): Promise<void> {
  try {
    const response = await azureTableRequest("POST", "Tables", { TableName: TABLE_NAME });
    if (response.status === 201) {
      console.log(`Table '${TABLE_NAME}' created`);
    } else if (response.status === 409) {
      // Table already exists
    } else {
      console.error(`Table creation failed: ${response.status}`);
    }
  } catch (e) {
    console.error("Error creating table:", e);
  }
}

async function saveImageToTable(image: SketchImage): Promise<void> {
  const entity: TableEntity = {
    PartitionKey: "images",
    RowKey: image.id,
    url: image.url,
    city: image.city,
    photographer: image.photographer,
    photographerUrl: image.photographerUrl,
    cachedAt: image.cachedAt,
    query: image.query || "",
    category: image.category || DEFAULT_CATEGORY,
  };
  
  const response = await azureTableRequest("POST", `${TABLE_NAME}`, entity);
  
  if (response.status === 201) {
    console.log(`Image saved: ${image.id}`);
  } else if (response.status === 409) {
    console.log(`Image already exists: ${image.id}`);
  } else {
    console.error(`Failed to save image: ${response.status}`);
  }
}

async function getAllImagesFromTable(): Promise<SketchImage[]> {
  const response = await azureTableRequest(
    "GET",
    `${TABLE_NAME}()?$filter=PartitionKey eq 'images'`
  );
  
  if (!response.ok) {
    console.error(`Failed to fetch images: ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return (data.value || []).map((entity: TableEntity) => ({
    id: entity.RowKey,
    url: entity.url,
    city: entity.city,
    photographer: entity.photographer,
    photographerUrl: entity.photographerUrl,
    cachedAt: entity.cachedAt,
    query: entity.query,
    category: (entity.category as ImageCategory) || DEFAULT_CATEGORY,
  }));
}

async function getImageCountFromTable(): Promise<number> {
  const images = await getAllImagesFromTable();
  return images.length;
}

// ============================================
// Unsplash API
// ============================================

function getRandomQueryForCategory(category: ImageCategory): string {
  const queries = CATEGORY_QUERIES[category];
  return queries[Math.floor(Math.random() * queries.length)];
}

function isValidCategory(value: string): value is ImageCategory {
  return IMAGE_CATEGORIES.includes(value as ImageCategory);
}

type UnsplashResult = {
  success: true;
  image: SketchImage;
} | {
  success: false;
  rateLimited: boolean;
  error: string;
};

async function fetchFromUnsplash(category: ImageCategory = DEFAULT_CATEGORY): Promise<UnsplashResult> {
  if (!UNSPLASH_ACCESS_KEY) {
    return { success: false, rateLimited: false, error: "UNSPLASH_ACCESS_KEY not set" };
  }

  const query = getRandomQueryForCategory(category);
  
  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
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

// ============================================
// Bild-Strategie: API first, dann Fallback zu Table
// ============================================

const AZURE_ENABLED = !!AZURE_STORAGE_CONNECTION_STRING;

async function getRandomImageFromTable(excludeId?: string, category?: ImageCategory): Promise<SketchImage | null> {
  if (!AZURE_ENABLED) return null;
  
  const images = await getAllImagesFromTable();
  let available = excludeId ? images.filter(img => img.id !== excludeId) : images;
  
  // Filter by category if specified
  if (category) {
    available = available.filter(img => img.category === category);
  }
  
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

async function getImage(excludeId?: string, category: ImageCategory = DEFAULT_CATEGORY): Promise<{ image: SketchImage | null; source: string }> {
  // 1. Versuche neues Bild von Unsplash
  const result = await fetchFromUnsplash(category);
  
  if (result.success) {
    // Speichere in Table Storage (nur wenn Azure konfiguriert)
    if (AZURE_ENABLED) {
      await saveImageToTable(result.image);
    }
    return { image: result.image, source: "unsplash" };
  }
  
  // 2. Bei Rate Limit oder Fehler: Fallback zu Table (nur wenn Azure konfiguriert)
  console.log(`Unsplash failed (${result.error}), falling back to table storage`);
  
  if (AZURE_ENABLED) {
    const cachedImage = await getRandomImageFromTable(excludeId, category);
    if (cachedImage) {
      return { image: cachedImage, source: "cache" };
    }
  }
  
  return { image: null, source: "none" };
}

// ============================================
// HTTP Handler
// ============================================

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  // Try to serve static files first (for the built React app)
  // Only in certain environments or if explicitly enabled
  if (Deno.env.get("SERVE_STATIC") === "true" || Deno.env.get("NODE_ENV") === "production") {
    const staticDirs = [
      `${Deno.cwd()}/../app/dist`,
      `${Deno.cwd()}/../app/public`,
    ];
    const staticResponse = await serveStaticFile(staticDirs, url);
    if (staticResponse) {
      return staticResponse;
    }
  }

  // GET /api/image - Bild holen (API first, dann Cache)
  if (url.pathname === "/api/image" && req.method === "GET") {
    const excludeId = url.searchParams.get("exclude") || undefined;
    const categoryParam = url.searchParams.get("category") || DEFAULT_CATEGORY;
    
    // Validate category
    if (!isValidCategory(categoryParam)) {
      return new Response(JSON.stringify({ 
        error: "Invalid category",
        validCategories: IMAGE_CATEGORIES,
      }), { 
        status: 400, 
        headers: corsHeaders() 
      });
    }
    
    const { image, source } = await getImage(excludeId, categoryParam);
    
    if (!image) {
      return new Response(JSON.stringify({ error: "No images available" }), { 
        status: 503, 
        headers: corsHeaders() 
      });
    }
    
    return new Response(JSON.stringify({ ...image, _source: source }), { 
      headers: corsHeaders() 
    });
  }

  // GET /api/categories - Verfügbare Kategorien
  if (url.pathname === "/api/categories" && req.method === "GET") {
    return new Response(JSON.stringify({
      categories: IMAGE_CATEGORIES,
      default: DEFAULT_CATEGORY,
    }), { headers: corsHeaders() });
  }

  // GET /api/cache/status - Cache-Status
  if (url.pathname === "/api/cache/status" && req.method === "GET") {
    const count = await getImageCountFromTable();
    return new Response(JSON.stringify({
      imageCount: count,
      storage: "Azure Table Storage",
      table: TABLE_NAME,
    }), { headers: corsHeaders() });
  }

  // GET /api/cache/images - Alle Bilder auflisten
  if (url.pathname === "/api/cache/images" && req.method === "GET") {
    const images = await getAllImagesFromTable();
    return new Response(JSON.stringify(images), { headers: corsHeaders() });
  }

  // Health Check
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ 
      status: "ok",
      unsplash: UNSPLASH_ACCESS_KEY ? "configured" : "missing",
      azure: AZURE_STORAGE_CONNECTION_STRING ? "configured" : "missing",
    }), { headers: corsHeaders() });
  }

  return new Response(JSON.stringify({ error: "Not found" }), { 
    status: 404, 
    headers: corsHeaders() 
  });
}

// ============================================
// Server Start
// ============================================

if (import.meta.main) {
  console.log(`🚀 SketchApp API starting...`);
  console.log(`   UNSPLASH_ACCESS_KEY: ${UNSPLASH_ACCESS_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`   AZURE_STORAGE: ${AZURE_STORAGE_CONNECTION_STRING ? "✓ set" : "✗ missing"}`);
  
  if (AZURE_STORAGE_CONNECTION_STRING) {
    await ensureTableExists();
  }
  
  console.log(`🚀 SketchApp API running on http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, handleRequest);
}
