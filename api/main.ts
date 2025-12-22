// ============================================
// SketchApp API - Deno Server
// ============================================

import { serveStaticFile } from "./util/routeStaticFilesFrom.ts";
import {
  IMAGE_CATEGORIES,
  DEFAULT_CATEGORY,
  isValidCategory,
  fetchFromUnsplash,
  fetchFromUnsplashCustom,
  type SketchImage,
  type ImageCategory,
} from "./services/unsplash.ts";
import {
  ensureTableExists,
  saveImageToTable,
  getAllImagesFromTable,
  getImageCountFromTable,
  getRandomImageFromTable,
} from "./services/store.ts";

// Environment
const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") || "";
const AZURE_STORAGE_CONNECTION_STRING = Deno.env.get("AZURE_STORAGE_CONNECTION_STRING") || "";
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const TABLE_NAME = "sketchimages";

const AZURE_ENABLED = !!AZURE_STORAGE_CONNECTION_STRING;

// ============================================
// Image Orchestrator: API first, dann Fallback zu Table
// ============================================

async function getImage(
  excludeId?: string,
  category: ImageCategory = DEFAULT_CATEGORY
): Promise<{ image: SketchImage | null; source: string }> {
  // 1. Versuche neues Bild von Unsplash
  const result = await fetchFromUnsplash(UNSPLASH_ACCESS_KEY, category);

  if (result.success) {
    // Speichere in Table Storage (nur wenn Azure konfiguriert)
    if (AZURE_ENABLED) {
      await saveImageToTable(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME, result.image);
    }
    return { image: result.image, source: "unsplash" };
  }

  // 2. Bei Rate Limit oder Fehler: Fallback zu Table (nur wenn Azure konfiguriert)
  console.log(`Unsplash failed (${result.error}), falling back to table storage`);

  if (AZURE_ENABLED) {
    const cachedImage = await getRandomImageFromTable(
      AZURE_STORAGE_CONNECTION_STRING,
      TABLE_NAME,
      excludeId,
      category
    );
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

  // GET /api/search - Custom keyword search
  if (url.pathname === "/api/search" && req.method === "GET") {
    const customQuery = url.searchParams.get("query");
    
    if (!customQuery || !customQuery.trim()) {
      return new Response(JSON.stringify({ 
        error: "Query parameter is required"
      }), { 
        status: 400, 
        headers: corsHeaders() 
      });
    }
    
    const result = await fetchFromUnsplashCustom(UNSPLASH_ACCESS_KEY, customQuery);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: result.error,
        rateLimited: result.rateLimited 
      }), { 
        status: result.rateLimited ? 429 : 503, 
        headers: corsHeaders() 
      });
    }
    
    return new Response(JSON.stringify({ ...result.image, _source: "unsplash-custom" }), { 
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
    const count = await getImageCountFromTable(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME);
    return new Response(JSON.stringify({
      imageCount: count,
      storage: "Azure Table Storage",
      table: TABLE_NAME,
    }), { headers: corsHeaders() });
  }

  // GET /api/cache/images - Alle Bilder auflisten
  if (url.pathname === "/api/cache/images" && req.method === "GET") {
    const images = await getAllImagesFromTable(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME);
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
    await ensureTableExists(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME);
  }

  console.log(`🚀 SketchApp API running on http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, handleRequest);
}
