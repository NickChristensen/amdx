import { readFile } from "node:fs/promises";
import { compile } from "@mdx-js/mdx";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import {
  resolveDocumentLocation,
  userFacingUrl,
} from "./amdx-document-paths.ts";
import { MdxAnalyzer } from "./mdx-analyzer.ts";
import { mdxCompileOptions } from "./mdx-compile-options.ts";

export type AmdxDiagnostic = {
  line: number;
  column: number;
  message: string;
  source: "frontmatter" | "compiler" | "analyzer" | "path" | "filesystem";
};

export type AmdxMetadata = {
  title: string;
  agent: string;
  created: string;
};

export type AmdxValidationFailure = {
  ok: false;
  path: string;
  diagnostics: AmdxDiagnostic[];
};

export type AmdxValidationSuccess = {
  ok: true;
  path: string;
  route: string;
  url: string;
  metadata: AmdxMetadata;
};

export type AmdxValidationResult = AmdxValidationFailure | AmdxValidationSuccess;

type ValidationOptions = {
  analyzer?: MdxAnalyzer;
};

function diagnostic(
  source: AmdxDiagnostic["source"],
  message: string,
  line = 1,
  column = 1,
): AmdxDiagnostic {
  return { line, column, message, source };
}

function parseRequiredFrontMatter(source: string, filePath: string) {
  const file = new VFile({ path: filePath, value: source });
  try {
    matter(file);
  } catch (error) {
    const yamlError = error as {
      message?: string;
      linePos?: Array<{ line?: number; col?: number }>;
    };
    const start = yamlError.linePos?.[0];

    return {
      diagnostics: [
        diagnostic(
          "frontmatter",
          yamlError.message ?? "YAML front matter could not be parsed.",
          start?.line ? start.line + 1 : 1,
          start?.col ?? 1,
        ),
      ],
    };
  }

  const values = file.data.matter;
  const metadata: Record<string, unknown> =
    values && typeof values === "object"
      ? (values as Record<string, unknown>)
      : {};

  const requiredKeys = ["title", "agent", "created"] as const;
  const diagnostics = requiredKeys.flatMap((key) => {
    const value = key in metadata ? metadata[key] : undefined;
    if (typeof value === "string" && value.trim()) {
      return [];
    }

    return [
      diagnostic(
        "frontmatter",
        `Required front matter field \"${key}\" is missing or empty.`,
      ),
    ];
  });

  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  return {
    metadata: {
      title: metadata.title as string,
      agent: metadata.agent as string,
      created: metadata.created as string,
    } satisfies AmdxMetadata,
    diagnostics: [],
  };
}

function compilerDiagnostic(error: unknown) {
  const cause = error as {
    message?: string;
    line?: number;
    column?: number;
    position?: { start?: { line?: number; column?: number } };
  };
  const start = cause.position?.start;

  return diagnostic(
    "compiler",
    cause.message ?? "MDX compilation failed.",
    cause.line ?? start?.line ?? 1,
    cause.column ?? start?.column ?? 1,
  );
}

export async function validateAmdx(
  inputPath: string,
  options: ValidationOptions = {},
): Promise<AmdxValidationResult> {
  let location;
  try {
    location = await resolveDocumentLocation(inputPath);
  } catch (error) {
    return {
      ok: false,
      path: inputPath,
      diagnostics: [
        diagnostic(
          "path",
          error instanceof Error ? error.message : "Document path validation failed.",
        ),
      ],
    };
  }

  let source: string;
  try {
    source = await readFile(location.path, "utf8");
  } catch (error) {
    return {
      ok: false,
      path: location.path,
      diagnostics: [
        diagnostic(
          "filesystem",
          error instanceof Error ? error.message : "Could not read document.",
        ),
      ],
    };
  }

  const frontMatter = parseRequiredFrontMatter(source, location.path);
  if (frontMatter.diagnostics.length > 0) {
    return {
      ok: false,
      path: location.path,
      diagnostics: frontMatter.diagnostics,
    };
  }

  try {
    await compile(source, mdxCompileOptions);
  } catch (error) {
    return {
      ok: false,
      path: location.path,
      diagnostics: [compilerDiagnostic(error)],
    };
  }

  const ownsAnalyzer = !options.analyzer;
  const analyzer = options.analyzer ?? new MdxAnalyzer();
  try {
    const diagnostics = await analyzer.diagnose(location.path, source);
    if (diagnostics.length > 0) {
      return {
        ok: false,
        path: location.path,
        diagnostics: diagnostics.map((entry) =>
          diagnostic(
            "analyzer",
            entry.message,
            entry.range.start.line + 1,
            entry.range.start.character + 1,
          ),
        ),
      };
    }
  } catch (error) {
    return {
      ok: false,
      path: location.path,
      diagnostics: [
        diagnostic(
          "analyzer",
          error instanceof Error ? error.message : "MDX Analyzer failed.",
        ),
      ],
    };
  } finally {
    if (ownsAnalyzer) {
      await analyzer.close();
    }
  }

  return {
    ok: true,
    path: location.path,
    route: location.route,
    url: userFacingUrl(location.route),
    metadata: frontMatter.metadata!,
  };
}

export function formatAmdxDiagnostic(path: string, entry: AmdxDiagnostic) {
  return `${path}:${entry.line}:${entry.column}: ${entry.message}`;
}
