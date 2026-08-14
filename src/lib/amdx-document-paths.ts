import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const AMDX_DOCUMENTS_DIR = path.join(projectRoot, "documents");
export const AMDX_USER_HOST = "macmini.pony-rattlesnake.ts.net";

export type DocumentLocation = {
  path: string;
  route: string;
};

function isContainedPath(root: string, target: string) {
  return target === root || target.startsWith(root + path.sep);
}

export function documentRoute(filePath: string) {
  const relativePath = path.relative(AMDX_DOCUMENTS_DIR, filePath);
  const extension = path.extname(relativePath);
  const routeSegments = relativePath
    .slice(0, -extension.length)
    .split(path.sep)
    .map(encodeURIComponent);

  return `/${routeSegments.join("/")}`;
}

export function routeToDocumentPath(slug: string[] = []) {
  const normalizedSlug = slug.filter(Boolean);
  if (normalizedSlug.length === 0) {
    throw new Error("A document route must contain a path.");
  }

  const filePath = path.resolve(
    AMDX_DOCUMENTS_DIR,
    `${path.join(...normalizedSlug)}.mdx`,
  );

  if (!isContainedPath(AMDX_DOCUMENTS_DIR, filePath)) {
    throw new Error("Requested MDX path escapes the documents directory.");
  }

  return filePath;
}

export function userFacingUrl(route: string, options: {
  protocol?: string;
  port?: string;
} = {}) {
  const protocol = options.protocol ?? process.env.AMDX_PROTOCOL ?? "http";
  const port = options.port ?? process.env.AMDX_PORT ?? "3000";
  const normalizedProtocol = protocol.endsWith(":")
    ? protocol.slice(0, -1)
    : protocol;
  const origin = new URL(`${normalizedProtocol}://${AMDX_USER_HOST}`);

  if (port) {
    origin.port = port;
  }

  return new URL(route, origin).href;
}

export async function resolveDocumentLocation(inputPath: string): Promise<DocumentLocation> {
  if (!path.isAbsolute(inputPath)) {
    throw new Error("Document path must be absolute.");
  }

  const absolutePath = path.resolve(inputPath);
  if (path.extname(absolutePath) !== ".mdx") {
    throw new Error("Document path must use the lowercase .mdx extension.");
  }

  if (!isContainedPath(AMDX_DOCUMENTS_DIR, absolutePath)) {
    throw new Error("Document path must be contained under the documents directory.");
  }

  const [documentsDirectory, documentFile] = await Promise.all([
    fs.realpath(AMDX_DOCUMENTS_DIR),
    fs.realpath(absolutePath),
  ]);

  if (!isContainedPath(documentsDirectory, documentFile)) {
    throw new Error("Document path resolves outside the documents directory.");
  }

  return {
    path: absolutePath,
    route: documentRoute(absolutePath),
  };
}
