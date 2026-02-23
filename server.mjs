import { createServer } from "node:http";
import { parse } from "node:url";
import { join } from "node:path";
import { createReadStream, existsSync, statSync } from "node:fs";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".pck": "application/octet-stream",
  ".png": "image/png",
};

const CROSS_ORIGIN_HEADERS = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Serve game files with compression and caching
    if (pathname.startsWith("/game/")) {
      const relativePath = pathname.slice(1); // remove leading /
      const filePath = join(process.cwd(), "public", relativePath);
      const gzPath = filePath + ".gz";

      // Check if .gz version exists for this file
      const ext = "." + filePath.split(".").pop();
      const mime = MIME_TYPES[ext] || "application/octet-stream";

      const acceptEncoding = req.headers["accept-encoding"] || "";
      const useGz = acceptEncoding.includes("gzip") && existsSync(gzPath);

      const servePath = useGz ? gzPath : filePath;

      if (!existsSync(servePath) && !useGz) {
        // Fall through to Next.js handler
        handle(req, res, parsedUrl);
        return;
      }

      const stat = statSync(servePath);

      const headers = {
        "Content-Type": mime,
        "Content-Length": stat.size,
        "Cache-Control": "public, max-age=31536000, immutable",
        ...CROSS_ORIGIN_HEADERS,
      };

      if (useGz) {
        headers["Content-Encoding"] = "gzip";
      }

      res.writeHead(200, headers);
      createReadStream(servePath).pipe(res);
      return;
    }

    // Everything else goes to Next.js
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Game files served with gzip compression when available`);
  });
});
