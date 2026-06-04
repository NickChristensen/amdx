import { promises as fs } from "node:fs";
import path from "node:path";

export const MDX_MEDIA_DIR = path.join(
  process.env.HOME ?? "",
  ".openclaw",
  "media",
  "mdx",
);

export type ContentRoute = {
  href: string;
  title: string;
  modifiedAt: number;
};

export function slugToFilePath(slug: string[] = []) {
  const normalizedSlug = slug.filter(Boolean);
  const relativePath =
    normalizedSlug.length === 0
      ? "index.mdx"
      : path.join(...normalizedSlug) + ".mdx";
  const filePath = path.resolve(MDX_MEDIA_DIR, relativePath);
  const contentRoot = path.resolve(MDX_MEDIA_DIR);

  if (filePath !== contentRoot && !filePath.startsWith(contentRoot + path.sep)) {
    throw new Error("Requested MDX path escapes the content directory.");
  }

  return filePath;
}

export async function readMdxFile(slug: string[] = []) {
  const filePath = slugToFilePath(slug);
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ]);

  return {
    filePath,
    source,
    modifiedAt: stats.mtimeMs,
  };
}

export async function listMdxRoutes() {
  const routes: ContentRoute[] = [];

  async function walk(directory: string, prefix: string[] = []) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        if (entry.name.startsWith(".")) {
          return;
        }

        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          await walk(entryPath, [...prefix, entry.name]);
          return;
        }

        if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
          return;
        }

        const stats = await fs.stat(entryPath);
        const basename = entry.name.slice(0, -".mdx".length);
        const segments = basename === "index" ? prefix : [...prefix, basename];
        const href = "/" + segments.map(encodeURIComponent).join("/");

        routes.push({
          href: href === "/" ? "/" : href,
          title: segments.length === 0 ? "index" : segments.join("/"),
          modifiedAt: stats.mtimeMs,
        });
      }),
    );
  }

  try {
    await walk(MDX_MEDIA_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }

  return routes.sort((left, right) => right.modifiedAt - left.modifiedAt);
}
