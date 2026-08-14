import { Badge } from "./badge";
import { Metric } from "./metric";

export const agentMdxComponents = {
  Metric,
  Badge,
};

const elementOverrides = {
  table: () => null,
};

export const mdxComponents = {
  ...agentMdxComponents,
  ...elementOverrides,
};
