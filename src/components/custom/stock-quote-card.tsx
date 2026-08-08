"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { MARKET_CLOSE_MINUTE, MARKET_OPEN_MINUTE } from "@/lib/datetime";
import type { StockQuoteData, StockQuoteResults } from "@/lib/stock-quotes";
import { cn } from "@/lib/utils";

type StockQuoteCardProps = {
  symbols: string[];
};

type StockQuoteListProps = {
  loading?: boolean;
  quotes: StockQuoteResults;
  symbols?: string[];
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const marketTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
});

const localTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function normalizeSymbols(symbols: string[]) {
  return [
    ...new Set(
      symbols
        .map((symbol) => symbol.trim().replace(/^\$/, "").toUpperCase())
        .filter(Boolean),
    ),
  ];
}

function formatPrice(value: number, currency: string) {
  if (currency === "USD") {
    return priceFormatter.format(value);
  }

  return `${currency} ${numberFormatter.format(value)}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${percentFormatter.format(value)}%`;
}

function formatUnsignedPercent(value: number) {
  return `${percentFormatter.format(Math.abs(value))}%`;
}

function changeTone(isPositive: boolean) {
  return isPositive
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-red-700 dark:text-red-400";
}

function chartColorVar(isPositive: boolean, shade: 500 | 600) {
  return `var(--color-${isPositive ? "emerald" : "red"}-${shade})`;
}

function chartFillColor(isPositive: boolean, shade: 500 | 600) {
  return `color-mix(in oklab, ${chartColorVar(
    isPositive,
    shade,
  )} 33%, transparent)`;
}

function chartConfig(isPositive: boolean): ChartConfig {
  return {
    price: {
      label: "Price",
      theme: {
        light: chartColorVar(isPositive, 600),
        dark: chartColorVar(isPositive, 500),
      },
    },
    fill: {
      label: "Fill",
      theme: {
        light: chartFillColor(isPositive, 600),
        dark: chartFillColor(isPositive, 500),
      },
    },
    open: {
      label: "Previous close",
      theme: {
        light: "var(--color-ring)",
        dark: "var(--color-ring)",
      },
    },
  };
}

function getMarketSessionMinute(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = Object.fromEntries(
    marketTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatQuotePointTime(timestamp: string) {
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime())
    ? timestamp
    : localTimeFormatter.format(date);
}

function getStockQuoteChartModel(quote: StockQuoteData) {
  const selectedComparison = quote.comparisons[quote.series.range];
  const baseline = selectedComparison
    ? quote.price - selectedComparison.change
    : null;
  const points = quote.series.points
    .map((point) => {
      const sessionMinute = getMarketSessionMinute(point.timestamp);

      return sessionMinute === null
        ? null
        : {
            ...point,
            sessionMinute,
            changePercent:
              baseline === null || baseline === 0
                ? null
                : ((point.price - baseline) / baseline) * 100,
          };
    })
    .filter((point) => point !== null);

  if (points.length === 0) {
    return null;
  }

  const domainValues = [
    ...points.map((point) => point.price),
    ...(baseline === null ? [] : [baseline]),
  ];

  return {
    isPositive: (selectedComparison?.change ?? 0) >= 0,
    baseline,
    points,
    domainMin: Math.min(...domainValues),
    domainMax: Math.max(...domainValues),
  };
}

function hasStockQuoteChart(quote?: StockQuoteData | null) {
  return quote ? getStockQuoteChartModel(quote) !== null : false;
}

function StockQuotePriceChart({
  quote,
  className,
  showTooltip = true,
}: {
  quote?: StockQuoteData | null;
  className?: string;
  showTooltip?: boolean;
}) {
  const gradientId = React.useId().replace(/:/g, "");
  const [isAreaAnimationActive, setIsAreaAnimationActive] = useState<
    "auto" | false
  >("auto");
  const containerClasses = cn("aspect-auto w-full", className);

  if (!quote) {
    return <div className={containerClasses} />;
  }

  const chartModel = getStockQuoteChartModel(quote);

  if (!chartModel) {
    return <div className={containerClasses} />;
  }

  return (
    <ChartContainer
      config={chartConfig(chartModel.isPositive)}
      className={containerClasses}
    >
      <AreaChart
        data={chartModel.points}
        margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-fill)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--color-fill)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="sessionMinute"
          domain={[MARKET_OPEN_MINUTE, MARKET_CLOSE_MINUTE]}
          hide
          type="number"
        />
        <YAxis hide domain={[chartModel.domainMin, chartModel.domainMax]} />
        {chartModel.baseline !== null && (
          <ReferenceLine
            stroke="var(--color-open)"
            strokeDasharray="4 4"
            y={chartModel.baseline}
          />
        )}
        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideIndicator
                labelClassName="tabular-nums"
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.timestamp
                    ? formatQuotePointTime(payload[0].payload.timestamp)
                    : ""
                }
                formatter={(value, _name, item, index) =>
                  index === 0 && (
                    <div className="grid w-full gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatPrice(Number(value), quote.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Change</span>
                        <span
                          className={cn(
                            "font-mono font-medium tabular-nums",
                            changeTone(
                              Number(item.payload?.changePercent ?? 0) >= 0,
                            ),
                          )}
                        >
                          {typeof item.payload?.changePercent === "number"
                            ? formatSignedPercent(item.payload.changePercent)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  )
                }
              />
            }
          />
        )}
        <Area
          isAnimationActive={isAreaAnimationActive}
          onAnimationEnd={() => setIsAreaAnimationActive(false)}
          dataKey="price"
          fill={`url(#${gradientId})`}
          stroke="var(--color-price)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          type="linear"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function StockQuoteFooter({
  loading = false,
  quote,
}: {
  loading?: boolean;
  quote?: StockQuoteData | null;
}) {
  const comparisonStats = (["7d", "30d", "ytd"] as const).map(
    (key) => [key, quote?.comparisons[key] ?? null] as const,
  );

  if (!loading && !quote) {
    return null;
  }

  return (
    <div>
      <div className="flex w-full border-t border-border/50 divide-x divide-border/50">
        {comparisonStats.map(([key, comparison]) => (
          <div
            key={key}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-3"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase">
              {key}
            </p>
            {loading ? (
              <Skeleton className="h-4 w-12 rounded-sm" />
            ) : !comparison ? (
              <span className="text-xs font-semibold text-muted-foreground">
                —
              </span>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  changeTone(comparison.change >= 0),
                )}
              >
                {comparison.change >= 0 ? (
                  <ArrowUpRight className="size-[1.25em]" />
                ) : (
                  <ArrowDownRight className="size-[1.25em]" />
                )}
                <span>{formatUnsignedPercent(comparison.changePercent)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StockQuoteSymbol({ symbol }: { symbol: string }) {
  return (
    <p className="font-heading leading-none font-semibold tracking-tight">
      {symbol}
    </p>
  );
}

function BlankIcon(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

function StockQuoteChangeBadge({
  changePercent,
  isPositive,
  loading = false,
  showIcon = true,
}: {
  changePercent?: number;
  isPositive?: boolean;
  loading?: boolean;
  showIcon?: boolean;
}) {
  const TrendIcon = loading
    ? BlankIcon
    : isPositive
      ? ArrowUpRight
      : ArrowDownRight;
  if (!loading && changePercent === undefined) {
    return (
      <Badge className="justify-center rounded-sm bg-muted px-1 text-xs font-semibold text-muted-foreground">
        —
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        "justify-center gap-1 rounded-sm px-1 text-xs font-semibold text-background",
        isPositive
          ? "bg-emerald-600 dark:bg-emerald-500"
          : "bg-red-600 dark:bg-red-500",
        loading &&
          "bg-foreground/50 dark:bg-foreground/50 animate-pulse text-transparent",
      )}
    >
      {showIcon && (
        <TrendIcon strokeWidth={3} className="size-[1.25em]! -mx-0.5" />
      )}
      {loading ? "0.00%" : formatUnsignedPercent(changePercent ?? 0)}
    </Badge>
  );
}

function StockQuoteAccordionRow({
  loading = false,
  quote,
  symbol,
  open,
  onOpenChange,
}: {
  loading?: boolean;
  quote?: StockQuoteData | null;
  symbol?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!loading && quote === null) {
    return (
      <div className="flex items-center justify-between gap-3 p-3">
        <StockQuoteSymbol symbol={symbol ?? "..."} />
        <p className="text-sm text-muted-foreground">Quote unavailable.</p>
      </div>
    );
  }

  const selectedComparison = quote
    ? quote.comparisons[quote.series.range]
    : null;
  const isPositive = (selectedComparison?.change ?? 0) >= 0;
  const hasChart = loading || hasStockQuoteChart(quote);
  const chartClasses = cn(
    "w-full transition-[height] duration-[var(--collapsible-duration)] ease-[var(--ease-out)] motion-reduce:transition-none",
    open ? "h-44" : "h-12",
  );

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-stretch gap-3 p-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <div className="flex flex-col items-start gap-2">
            <StockQuoteSymbol symbol={quote?.symbol ?? symbol ?? "..."} />
            <StockQuoteChangeBadge
              changePercent={selectedComparison?.changePercent}
              isPositive={isPositive}
              loading={loading}
              showIcon
            />
          </div>
          {loading ? (
            <Skeleton className={chartClasses} />
          ) : hasChart ? (
            <StockQuotePriceChart
              quote={quote}
              className={chartClasses}
              showTooltip={open}
            />
          ) : null}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <StockQuoteFooter loading={loading} quote={quote} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function StockQuoteList({
  loading = false,
  quotes,
  symbols = [],
}: StockQuoteListProps) {
  const [openSymbol, setOpenSymbol] = useState<string | null>(null);

  return (
    <Card className="py-0">
      <CardContent className="divide-y p-0">
        {symbols.map((symbol) => (
          <StockQuoteAccordionRow
            key={symbol}
            loading={loading}
            quote={quotes[symbol] ?? null}
            symbol={symbol}
            open={openSymbol === symbol}
            onOpenChange={(open) => setOpenSymbol(open ? symbol : null)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function useStockQuotes(rawSymbols: string[]) {
  const symbols = useMemo(() => normalizeSymbols(rawSymbols), [rawSymbols]);
  const symbolKey = symbols.join(",");
  const [result, setResult] = useState<{
    symbolKey: string | null;
    quotes: StockQuoteResults | null;
  }>({
    symbolKey: null,
    quotes: null,
  });

  useEffect(() => {
    let isActive = true;

    const fetchQuotes = async () => {
      const response = await fetch(
        `/api/stock-quotes?symbols=${encodeURIComponent(symbolKey)}&range=1d`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stock quotes: ${response.status}`);
      }

      const payload = (await response.json()) as { quotes?: StockQuoteResults };

      return payload.quotes &&
        typeof payload.quotes === "object" &&
        !Array.isArray(payload.quotes)
        ? payload.quotes
        : null;
    };

    if (!symbolKey) {
      return;
    }

    fetchQuotes()
      .then((quotes) => {
        if (!isActive) return;
        setResult({ symbolKey, quotes });
      })
      .catch((err) => {
        if (!isActive) return;
        console.error(err);
        setResult({ symbolKey, quotes: null });
      });

    return () => {
      isActive = false;
    };
  }, [symbolKey]);

  const isLoading = !!symbolKey && result.symbolKey !== symbolKey;
  const noResults = result.quotes === null;

  return { isLoading, noResults, quotes: result.quotes ?? {}, symbols };
}

export function StockQuoteCard({ symbols: rawSymbols }: StockQuoteCardProps) {
  const { isLoading, noResults, quotes, symbols } = useStockQuotes(rawSymbols);

  return !isLoading && noResults ? (
    <Card>
      <p className="text-sm text-center">Quotes unavailable</p>
    </Card>
  ) : (
    <StockQuoteList loading={isLoading} quotes={quotes} symbols={symbols} />
  );
}
