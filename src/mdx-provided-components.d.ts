import type { MDXProvidedComponents as AgentComponents } from "@/components/mdx/mdx-components";

declare global {
  type MDXProvidedComponents = AgentComponents;
}

export {};
