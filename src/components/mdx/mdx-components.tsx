import type { MDXComponents } from "mdx/types";
import NextLink from "next/link";
import { isInternalHref, textLinkClasses } from "@/components/ui/link-utils";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stack } from "@/components/ui/stack";
import {
  BarChartCard,
  ChartAnnotation,
  ChartItem,
  ChartSeries,
  LineChartCard,
  PieChartCard,
} from "@/components/custom/charts";
import { CalendarCard } from "@/components/custom/calendar";
import { ChatCard } from "@/components/custom/chat";
import { Metric } from "@/components/custom/metric";
import { StockQuoteCard } from "@/components/custom/stock-quote-card";
import { TodoListCard } from "@/components/custom/todo-list";
import { TweetCard } from "@/components/custom/tweet";

type AgentMdxComponentMap = MDXComponents;

type AgentMdxCapability = {
  readonly root: string;
  readonly components: AgentMdxComponentMap;
  readonly required?: readonly string[];
};

type AgentMdxComponentSection = {
  readonly title: string;
  readonly capabilities: readonly AgentMdxCapability[];
};

export const agentMdxComponentManifest = [
  {
    title: "UI elements",
    capabilities: [
      { root: "Badge", components: { Badge } },
      { root: "Button", components: { Button } },
      { root: "Icon", components: { Icon } },
      { root: "Metric", components: { Metric } },
      { root: "Progress", components: { Progress } },
    ],
  },
  {
    title: "Composition",
    capabilities: [
      {
        root: "Alert",
        components: { Alert, AlertTitle, AlertDescription, AlertAction },
        required: ["AlertDescription"],
      },
      {
        root: "Card",
        components: {
          Card,
          CardHeader,
          CardIcon,
          CardTitle,
          CardDescription,
          CardAction,
          CardContent,
          CardFooter,
        },
        required: ["CardContent"],
      },
      {
        root: "Collapsible",
        components: { Collapsible, CollapsibleTrigger, CollapsibleContent },
        required: ["CollapsibleTrigger", "CollapsibleContent"],
      },
      { root: "Stack", components: { Stack } },
    ],
  },
  {
    title: "Charts",
    capabilities: [
      {
        root: "BarChartCard",
        components: { BarChartCard, ChartItem, ChartSeries, ChartAnnotation },
        required: ["ChartItem"],
      },
      {
        root: "LineChartCard",
        components: { LineChartCard, ChartItem, ChartSeries, ChartAnnotation },
        required: ["ChartItem"],
      },
      {
        root: "PieChartCard",
        components: { PieChartCard, ChartItem },
        required: ["ChartItem"],
      },
    ],
  },
  {
    title: "Domain components",
    capabilities: [
      { root: "CalendarCard", components: { CalendarCard } },
      { root: "ChatCard", components: { ChatCard } },
      { root: "StockQuoteCard", components: { StockQuoteCard } },
      { root: "TodoListCard", components: { TodoListCard } },
      { root: "TweetCard", components: { TweetCard } },
    ],
  },
] as const satisfies readonly AgentMdxComponentSection[];

type ManifestCapabilitiesHaveKnownNames<Manifest extends readonly AgentMdxComponentSection[]> =
  Manifest[number]["capabilities"][number] extends infer Capability
    ? Capability extends {
        readonly root: infer Root;
        readonly components: infer Components;
      }
      ? Root extends keyof Components
        ? Capability extends { readonly required: readonly (infer RequiredName)[] }
          ? Exclude<RequiredName, keyof Components> extends never
            ? true
            : false
          : true
        : false
      : false
    : false;

type UnionToIntersection<Value> = (Value extends unknown ? (value: Value) => void : never) extends ((value: infer Intersection) => void)
  ? Intersection
  : never;

type CapabilityComponents<Capability> = Capability extends { readonly components: infer Components }
  ? Components
  : never;

type ManifestComponents<Manifest extends readonly AgentMdxComponentSection[]> = UnionToIntersection<
  CapabilityComponents<Manifest[number]["capabilities"][number]>
>;

function createAgentMdxComponents<const Manifest extends readonly AgentMdxComponentSection[]>(
  manifest: Manifest & (
    ManifestCapabilitiesHaveKnownNames<Manifest> extends true ? unknown : never
  ),
): ManifestComponents<Manifest> {
  const components: MDXComponents = {};

  for (const section of manifest) {
    for (const capability of section.capabilities) {
      Object.assign(components, capability.components);
    }
  }

  return components as ManifestComponents<Manifest>;
}

export const agentMdxComponents = createAgentMdxComponents(agentMdxComponentManifest) satisfies MDXComponents;

const elementOverrides = {
  a: ({ href = "", className, ...props }) => {
    const Component = isInternalHref(href) ? NextLink : "a";

    return (
      <Component
        href={href}
        className={cn(textLinkClasses, className)}
        {...props}
      />
    );
  },
  img: ({ className = "", alt = "", ...props }) => (
    // Markdown images do not carry dimensions, so Next Image is not a good fit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn("max-w-full rounded-md border", className)}
      loading="lazy"
      {...props}
    />
  ),
  hr: Separator,
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
} satisfies MDXComponents;

export const mdxComponents = {
  ...agentMdxComponents,
  ...elementOverrides,
} satisfies MDXComponents;

export type MDXProvidedComponents = typeof agentMdxComponents;
