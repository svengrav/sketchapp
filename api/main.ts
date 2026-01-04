// ============================================
// SketchApp API - Oak Server
// ============================================

import { Application, Router } from "jsr:@oak/oak";
import { oakCors } from "jsr:@tajpouria/cors";
import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
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
const PORT = parseInt(Deno.env.get("PORT") || "8080");
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
// Oak Router Setup
// ============================================

export const app = new Application();
const router = new Router();

// GET /api/image - Bild holen (API first, dann Cache)
router.get("/api/image", async (context) => {
  const excludeId = context.request.url.searchParams.get("exclude") || undefined;
  const categoryParam = context.request.url.searchParams.get("category") || DEFAULT_CATEGORY;
  
  // Validate category
  if (!isValidCategory(categoryParam)) {
    context.response.status = 400;
    context.response.body = { 
      error: "Invalid category",
      validCategories: IMAGE_CATEGORIES,
    };
    return;
  }
  
  const { image, source } = await getImage(excludeId, categoryParam);
  
  if (!image) {
    context.response.status = 503;
    context.response.body = { error: "No images available" };
    return;
  }
  
  context.response.body = { ...image, _source: source };
});

// GET /api/search - Custom keyword search
router.get("/api/search", async (context) => {
  const customQuery = context.request.url.searchParams.get("query");
  
  if (!customQuery || !customQuery.trim()) {
    context.response.status = 400;
    context.response.body = { 
      error: "Query parameter is required"
    };
    return;
  }
  
  const result = await fetchFromUnsplashCustom(UNSPLASH_ACCESS_KEY, customQuery);
  
  if (!result.success) {
    context.response.status = result.rateLimited ? 429 : 503;
    context.response.body = { 
      error: result.error,
      rateLimited: result.rateLimited 
    };
    return;
  }
  
  context.response.body = { ...result.image, _source: "unsplash-custom" };
});

// GET /api/categories - Verfügbare Kategorien
router.get("/api/categories", (context) => {
  context.response.body = {
    categories: IMAGE_CATEGORIES,
    default: DEFAULT_CATEGORY,
  };
});

// GET /api/cache/status - Cache-Status
router.get("/api/cache/status", async (context) => {
  const count = await getImageCountFromTable(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME);
  context.response.body = {
    imageCount: count,
    storage: "Azure Table Storage",
    table: TABLE_NAME,
  };
});

// GET /api/cache/images - Alle Bilder auflisten
router.get("/api/cache/images", async (context) => {
  const images = await getAllImagesFromTable(AZURE_STORAGE_CONNECTION_STRING, TABLE_NAME);
  context.response.body = images;
});

// Health Check
router.get("/health", (context) => {
  context.response.body = { 
    status: "ok",
    unsplash: UNSPLASH_ACCESS_KEY ? "configured" : "missing",
    azure: AZURE_STORAGE_CONNECTION_STRING ? "configured" : "missing",
  };
});

// ============================================
// Middleware Configuration
// ============================================

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(routeStaticFilesFrom([
  `${Deno.cwd()}/app/dist`,
  `${Deno.cwd()}/app/public`,
]));

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
  
  app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
      `✅ Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`
    );
  });
  
  await app.listen({ port: PORT });
}
