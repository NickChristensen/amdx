import type { MDXComponents } from "mdx/types";
import Link from "next/link";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stack } from "@/components/ui/stack";
import { BarGraphCard, LineGraphCard } from "@/components/custom/charts";
import { CalendarCard } from "@/components/custom/calendar";
import { ChatCard } from "@/components/custom/chat";
import { Metric } from "@/components/custom/metric";
import { StockQuoteCard } from "@/components/custom/stock-quote-card";
import { TodoListCard } from "@/components/custom/todo-list";
import { TweetCard } from "@/components/custom/tweet";

export const agentMdxComponents = {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Badge,
  BarGraphCard,
  CalendarCard,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
  ChatCard,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
  LineGraphCard,
  Metric,
  Progress,
  Stack,
  StockQuoteCard,
  TodoListCard,
  TweetCard,
} satisfies MDXComponents;

const elementOverrides = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/");

    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  },
  img: ({ className = "", alt = "", ...props }) => (
    // Markdown images do not carry dimensions, so Next Image is not a good fit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={`max-w-full rounded-md border ${className}`.trim()}
      loading="lazy"
      {...props}
    />
  ),
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
