import { Badge } from "./badge";
import { Metric } from "./metric";

export const agentMdxComponentManifest = [
  {
    title: "Fixture",
    capabilities: [
      { root: "Metric", components: { Metric } },
      { root: "Badge", components: { Badge } },
    ],
  },
] as const;

const elementOverrides = {
  table: () => null,
};

export const mdxComponents = {
  Metric,
  Badge,
  ...elementOverrides,
};
