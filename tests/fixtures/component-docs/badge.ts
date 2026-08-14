import type * as React from "react";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment for the badge. */
  variant?: "default" | "secondary" | "outline";

  /** Render the badge through its child element. */
  asChild?: boolean;
};

export function Badge(_props: BadgeProps) {
  void _props;
  return null;
}

export const badgeMdxDocs = {
  description: "Displays a short inline status, category, or label.",
  flow: "inline",
  defaults: {
    variant: "default",
    asChild: false,
  },
  examples: [
    {
      title: "Status badge",
      mdx: '<Badge variant="secondary">Draft</Badge>',
    },
  ],
} as const satisfies AgentMdxComponentDocs<BadgeProps>;
