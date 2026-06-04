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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type GitHubAlertType = "note" | "tip" | "important" | "warning" | "caution";

const alertConfig: Record<
  GitHubAlertType,
  {
    icon: React.ComponentType<React.ComponentProps<"svg">>;
    title: string;
    className: string;
  }
> = {
  note: {
    icon: Info,
    title: "Note",
    className: "text-blue-600 border-blue-200 bg-blue-50",
  },
  tip: {
    icon: Lightbulb,
    title: "Tip",
    className: "text-green-600 border-green-200 bg-green-50",
  },
  important: {
    icon: MessageSquareWarning,
    title: "Important",
    className: "text-violet-600 border-violet-200 bg-violet-50",
  },
  warning: {
    icon: TriangleAlert,
    title: "Warning",
    className: "text-yellow-600 border-yellow-200 bg-yellow-50",
  },
  caution: {
    icon: OctagonAlert,
    title: "Caution",
    className: "text-red-600 border-red-200 bg-red-50",
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
  const { icon: Icon, title, className: AlertClassName } = alertConfig[type];
  const content = React.Children.toArray(children).filter((child) => {
    if (!React.isValidElement<{ className?: string }>(child)) {
      return true;
    }

    return !child.props.className?.includes("markdown-alert-title");
  });

  return (
    <Alert className={AlertClassName} {...props}>
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
  Card,
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
