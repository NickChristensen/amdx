import * as runtime from "react/jsx-runtime";
import { compile } from "@mdx-js/mdx";
import type React from "react";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mdxCompileOptions } from "@/lib/mdx-compile-options";
import { parseMdxSource } from "@/lib/mdx-source";

type MdxModule = {
  default: React.ComponentType<{ components?: typeof mdxComponents }>;
};

export async function MdxRenderer({ source }: { source: string }) {
  const renderableSource = parseMdxSource(source).source;
  const code = String(
    await compile(renderableSource, mdxCompileOptions),
  );
  const run = new Function(String.raw`${code}; return { default: MDXContent };`);
  const { default: Content } = run({
    ...runtime,
    baseUrl: import.meta.url,
  }) as MdxModule;

  return (
    <TooltipProvider delayDuration={200}>
      <Content components={mdxComponents} />
    </TooltipProvider>
  );
}
