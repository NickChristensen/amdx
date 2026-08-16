import { VFile } from "vfile";
import { matter } from "vfile-matter";

type MdxFrontMatter = Record<string, unknown>;

/**
 * Parses MDX YAML front matter and removes it from the renderable source.
 */
export function parseMdxSource(source: string, filePath?: string) {
  const file = filePath
    ? new VFile({ path: filePath, value: source })
    : new VFile({ value: source });

  matter(file, { strip: true });

  const values = file.data.matter;
  return {
    source: String(file),
    frontMatter:
      values && typeof values === "object" && !Array.isArray(values)
        ? (values as MdxFrontMatter)
        : {},
  };
}

export function metadataForMdxSource(source: string, filePath?: string) {
  const title = parseMdxSource(source, filePath).frontMatter.title;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error('Required front matter field "title" is missing or empty.');
  }

  return { title: title.trim() };
}
