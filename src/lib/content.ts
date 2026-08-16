import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import {
  AMDX_DOCUMENTS_DIR,
  resolveDocumentLocation,
  routeToDocumentPath,
} from "./amdx-document-paths.ts";

export const MDX_MEDIA_DIR = AMDX_DOCUMENTS_DIR;

export type ContentRoute = {
  href: string;
  title: string;
  modifiedAt: number;
};

export function slugToFilePath(slug: string[] = []) {
  return routeToDocumentPath(slug);
}

const readMdxFileAtPath = cache(async (filePath: string) => {
  const location = await resolveDocumentLocation(filePath);
  const [source, stats] = await Promise.all([
    fs.readFile(location.path, "utf8"),
    fs.stat(location.path),
  ]);

  return {
    filePath: location.path,
    source,
    modifiedAt: stats.mtimeMs,
  };
});

export function readMdxFile(slug: string[] = []) {
  return readMdxFileAtPath(routeToDocumentPath(slug));
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

        if (
          (!entry.isFile() && !entry.isSymbolicLink()) ||
          !entry.name.endsWith(".mdx")
        ) {
          return;
        }

        let location;
        try {
          location = await resolveDocumentLocation(entryPath);
        } catch {
          return;
        }

        const stats = await fs.stat(location.path);
        if (!stats.isFile()) {
          return;
        }
        const basename = entry.name.slice(0, -".mdx".length);
        const segments = [...prefix, basename];
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
