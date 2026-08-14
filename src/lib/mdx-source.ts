import { VFile } from "vfile";
import { matter } from "vfile-matter";

/**
 * Removes MDX YAML front matter before the renderer compiles a document.
 *
 * Validation reads the original source so its diagnostics keep their original
 * source locations.
 */
export function renderableMdxSource(source: string) {
  const file = new VFile({ value: source });
  matter(file, { strip: true });
  return String(file);
}
