// ============================================
// Azure Table Storage Service
// ============================================

import type { SketchImage, ImageCategory } from "./unsplash.ts";
import { DEFAULT_CATEGORY } from "./unsplash.ts";
import { TableClient } from "@azure/data-tables";

// Azure Table Entity
type TableEntity = {
  partitionKey: string;
  rowKey: string;
  url: string;
  city: string;
  photographer: string;
  photographerUrl: string;
  cachedAt: number;
  query: string;
  category: string;
};

// ============================================
// Azure Table Client Helper
// ============================================

function createTableClient(connectionString: string, tableName: string): TableClient {
  return TableClient.fromConnectionString(connectionString, tableName);
}

// ============================================
// Store Operations
// ============================================

export async function ensureTableExists(
  connectionString: string,
  tableName: string
): Promise<void> {
  try {
    const client = createTableClient(connectionString, tableName);
    await client.createTable();
    console.log(`Table '${tableName}' created`);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "TableAlreadyExists") {
      // Table already exists
    } else {
      console.error("Error creating table:", error);
    }
  }
}

export async function saveImageToTable(
  connectionString: string,
  tableName: string,
  image: SketchImage
): Promise<void> {
  try {
    const client = createTableClient(connectionString, tableName);
    const entity: TableEntity = {
      partitionKey: "images",
      rowKey: image.id,
      url: image.url,
      city: image.city,
      photographer: image.photographer,
      photographerUrl: image.photographerUrl,
      cachedAt: image.cachedAt,
      query: image.query || "",
      category: image.category || DEFAULT_CATEGORY,
    };

    await client.upsertEntity(entity);
    console.log(`Image saved: ${image.id}`);
  } catch (error) {
    console.error(`Failed to save image: ${image.id}`, error);
  }
}

export async function getAllImagesFromTable(
  connectionString: string,
  tableName: string
): Promise<SketchImage[]> {
  try {
    const client = createTableClient(connectionString, tableName);
    // Nutze odata-Filter in listEntities
    const entities = client.listEntities<TableEntity>();

    const images: SketchImage[] = [];
    for await (const entity of entities) {
      // Filter nach PartitionKey == 'images' im Loop
      if (entity.partitionKey === "images") {
        images.push({
          id: entity.rowKey,
          url: entity.url,
          city: entity.city,
          photographer: entity.photographer,
          photographerUrl: entity.photographerUrl,
          cachedAt: entity.cachedAt,
          query: entity.query,
          category: (entity.category as ImageCategory) || DEFAULT_CATEGORY,
        });
      }
    }
    return images;
  } catch (error) {
    console.error(`Failed to fetch images:`, error);
    return [];
  }
}

export async function getImageCountFromTable(
  connectionString: string,
  tableName: string
): Promise<number> {
  const images = await getAllImagesFromTable(connectionString, tableName);
  return images.length;
}

export async function getRandomImageFromTable(
  connectionString: string,
  tableName: string,
  excludeId?: string,
  category?: ImageCategory
): Promise<SketchImage | null> {
  const images = await getAllImagesFromTable(connectionString, tableName);
  let available = excludeId ? images.filter(img => img.id !== excludeId) : images;

  // Filter by category if specified
  if (category) {
    available = available.filter(img => img.category === category);
  }

  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
