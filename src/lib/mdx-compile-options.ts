import type { CompileOptions } from "@mdx-js/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkGfm from "remark-gfm";

export const mdxCompileOptions = {
  outputFormat: "function-body",
  providerImportSource: undefined,
  remarkPlugins: [remarkGfm, remarkFlexibleMarkers],
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
      },
    ],
  ],
} satisfies CompileOptions;
