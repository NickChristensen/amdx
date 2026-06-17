import type { MDXComponents } from "mdx/types";
import React from "react";
import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { StockQuoteCard } from "@/components/custom/stock-quote-card";
import { Tweet } from "@/components/custom/tweet";

type GitHubAlertType = "note" | "tip" | "important" | "warning" | "caution";

const alertConfig: Record<
  GitHubAlertType,
  {
    icon: React.ComponentType<React.ComponentProps<"svg">>;
    title: string;
  }
> = {
  note: {
    icon: Info,
    title: "Note",
  },
  tip: {
    icon: Lightbulb,
    title: "Tip",
  },
  important: {
    icon: MessageSquareWarning,
    title: "Important",
  },
  warning: {
    icon: TriangleAlert,
    title: "Warning",
  },
  caution: {
    icon: OctagonAlert,
    title: "Caution",
  },
};

function getAlertType(className = "") {
  return (Object.keys(alertConfig).find((type) =>
    className.includes(`markdown-alert-${type}`),
  ) ?? "note") as GitHubAlertType;
}

function MarkdownAlert({
  className = "",
  children,
  ...props
}: React.ComponentProps<"div">) {
  const type = getAlertType(className);
  const { icon: Icon, title } = alertConfig[type];
  const content = React.Children.toArray(children).filter((child) => {
    if (!React.isValidElement<{ className?: string }>(child)) {
      return true;
    }

    return !child.props.className?.includes("markdown-alert-title");
  });

  return (
    <Alert variant={type} {...props}>
      <Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  );
}

export const mdxComponents: MDXComponents = {
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
  Badge,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
  Progress,
  Stack,
  StockQuoteCard,
  Tweet,
  div: ({ className = "", children, ...props }) => {
    if (className.includes("markdown-alert")) {
      return (
        <MarkdownAlert className={className} {...props}>
          {children}
        </MarkdownAlert>
      );
    }

    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
};
