/**
 * Static File Serving Utility
 * Serves static files from specified directories (typically the built React app)
 */

export async function serveStaticFile(
  staticPaths: string[],
  url: URL,
): Promise<Response | null> {
  // Remove leading slash and don't serve index.html for API routes
  const pathname = url.pathname;

  // Skip API routes
  if (pathname.startsWith("/api/") || pathname.startsWith("/health")) {
    return null;
  }

  // Try to serve from each static path
  for (const basePath of staticPaths) {
    try {
      // Resolve the file path
      const filePath = pathname === "/" ? "index.html" : pathname.slice(1);
      const fullPath = `${basePath}/${filePath}`;

      // Security: prevent directory traversal
      const resolved = await Deno.realPath(fullPath).catch(() => null);
      const baseResolved = await Deno.realPath(basePath).catch(() => null);

      if (
        !resolved ||
        !baseResolved ||
        !resolved.startsWith(baseResolved)
      ) {
        continue;
      }

      // Try to read the file
      const file = await Deno.open(resolved, { read: true });
      const stat = await Deno.stat(resolved);

      // Determine content type
      const ext = resolved.split(".").pop()?.toLowerCase() || "";
      const contentType = getContentType(ext);

      return new Response(file.readable, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
        },
      });
    } catch (_err) {
      // File not found, try next path
      continue;
    }
  }

  // If we're trying to access a non-existent route, serve index.html for SPA routing
  if (!pathname.includes(".")) {
    for (const basePath of staticPaths) {
      try {
        const indexPath = `${basePath}/index.html`;
        const file = await Deno.open(indexPath, { read: true });
        const stat = await Deno.stat(indexPath);

        return new Response(file.readable, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Length": stat.size.toString(),
          },
        });
      } catch {
        continue;
      }
    }
  }

  return null;
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    html: "text/html; charset=utf-8",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    eot: "application/vnd.ms-fontobject",
  };
  return types[ext] || "application/octet-stream";
}
