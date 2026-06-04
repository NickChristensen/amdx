import * as runtime from "react/jsx-runtime";
import { compile } from "@mdx-js/mdx";
import type React from "react";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";

type MdxModule = {
  default: React.ComponentType<{ components?: typeof mdxComponents }>;
};

export async function MdxRenderer({ source }: { source: string }) {
  const code = String(
    await compile(source, {
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
    }),
  );
  const run = new Function(String.raw`${code}; return { default: MDXContent };`);
  const { default: Content } = run({
    ...runtime,
    baseUrl: import.meta.url,
  }) as MdxModule;

  return <Content components={mdxComponents} />;
}
