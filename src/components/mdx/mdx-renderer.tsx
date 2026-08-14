import * as runtime from "react/jsx-runtime";
import { compile } from "@mdx-js/mdx";
import type React from "react";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { mdxCompileOptions } from "@/lib/mdx-compile-options";
import { renderableMdxSource } from "@/lib/mdx-source";

type MdxModule = {
  default: React.ComponentType<{ components?: typeof mdxComponents }>;
};

export async function MdxRenderer({ source }: { source: string }) {
  const code = String(
    await compile(renderableMdxSource(source), mdxCompileOptions),
  );
  const run = new Function(String.raw`${code}; return { default: MDXContent };`);
  const { default: Content } = run({
    ...runtime,
    baseUrl: import.meta.url,
  }) as MdxModule;

  return <Content components={mdxComponents} />;
}
