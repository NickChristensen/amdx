"use client";

import * as React from "react";
import WheelGesturesPlugin from "embla-carousel-wheel-gestures";
import {
  ArrowDownRight,
  ArrowUpRight,
  GalleryHorizontal,
  Rows3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MARKET_CLOSE_MINUTE,
  MARKET_OPEN_MINUTE,
} from "@/lib/datetime";
import type { StockQuoteData, StockQuoteResults } from "@/lib/stock-quotes";
import { cn } from "@/lib/utils";

type StockQuoteCardProps = {
  symbols: string[];
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
    <CardFooter className="p-0">
      <div className="flex w-full border-t border-border/75 divide-x divide-border/75">
        {comparisonStats.map(([key, comparison]) => (
          <div
            key={key}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-3"
          >
            <p className="text-2xs font-medium text-muted-foreground uppercase">
              {key}
            </p>
            {loading ? (
              <Skeleton className="h-4 w-16 rounded-sm" />
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
    </CardFooter>
  );
}

function StockQuoteSymbol({ symbol }: { symbol: string }) {
  return (
    <div className="-mx-2 -my-1 rounded-sm bg-card/75 px-2 py-1">
      <p className="font-heading text-xl leading-none font-semibold tracking-tight">
        {symbol}
      </p>
    </div>
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
      <Badge className="justify-center rounded-sm bg-muted px-1 text-sm font-semibold text-muted-foreground">
        —
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        "justify-center gap-0.5 rounded-sm px-1 text-sm font-semibold text-background",
        isPositive
          ? "bg-emerald-600 dark:bg-emerald-500"
          : "bg-red-600 dark:bg-red-500",
        loading &&
          "bg-foreground/50 dark:bg-foreground/50 animate-pulse text-transparent",
      )}
    >
      {showIcon && <TrendIcon className="size-[1.25em]!" />}
      {loading ? "0.00%" : formatUnsignedPercent(changePercent ?? 0)}
    </Badge>
  );
}

function StockQuoteListCard({
  loading = false,
  quote,
  className,
  symbol,
}: {
  loading?: boolean;
  quote?: StockQuoteData | null;
  className?: string;
  symbol?: string;
}) {
  if (!loading && quote === null) {
    return (
      <Card className={cn("gap-0 p-0", className)}>
        <CardContent className="flex items-start justify-between gap-3 px-4 py-4">
          <StockQuoteSymbol symbol={symbol ?? "..."} />
          <p className="text-sm text-muted-foreground">Quote unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedComparison = quote
    ? quote.comparisons[quote.series.range]
    : null;
  const isPositive = (selectedComparison?.change ?? 0) >= 0;
  const hasChart = loading || hasStockQuoteChart(quote);

  return (
    <Card className={cn("gap-0 p-0", className)}>
      {hasChart ? (
        <CardContent className="relative p-0">
          <StockQuotePriceChart quote={quote} className="h-44" />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4">
            <StockQuoteSymbol symbol={quote?.symbol ?? symbol ?? "..."} />
            <StockQuoteChangeBadge
              changePercent={selectedComparison?.changePercent}
              isPositive={isPositive}
              loading={loading}
            />
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex items-start justify-between px-4 py-4">
          <StockQuoteSymbol symbol={quote?.symbol ?? symbol ?? "..."} />
          <StockQuoteChangeBadge
            changePercent={selectedComparison?.changePercent}
            isPositive={isPositive}
            loading={loading}
          />
        </CardContent>
      )}
      <StockQuoteFooter loading={loading} quote={quote} />
    </Card>
  );
}

function StockQuoteCompactRow({
  loading = false,
  quote,
  symbol,
}: {
  loading?: boolean;
  quote?: StockQuoteData | null;
  symbol?: string;
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

  return (
    <div className="flex gap-3 p-3">
      <div
        className={cn(
          "flex gap-2 justify-between",
          hasChart ? "flex-col items-start" : "flex-row items-center grow",
        )}
      >
        <StockQuoteSymbol symbol={quote?.symbol ?? symbol ?? "..."} />
        <StockQuoteChangeBadge
          changePercent={selectedComparison?.changePercent}
          isPositive={isPositive}
          loading={loading}
          showIcon={false}
        />
      </div>

      {loading ? (
        <Skeleton className="grow" />
      ) : (
        hasChart && (
          <StockQuotePriceChart quote={quote} showTooltip={false} />
        )
      )}
    </div>
  );
}

function StockQuoteCompactList({
  loading = false,
  quotes,
  symbols = [],
}: {
  loading?: boolean;
  quotes: StockQuoteResults;
  symbols?: string[];
}) {
  const rows = symbols;

  return (
    <Card className="self-stretch overflow-hidden py-0">
      <CardContent className="divide-y p-0">
        {rows.map((symbol) => (
          <StockQuoteCompactRow
            key={symbol}
            loading={loading}
            quote={quotes[symbol] ?? null}
            symbol={symbol}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function StockQuoteList({
  loading = false,
  quotes,
  className,
  symbols = [],
}: {
  loading?: boolean;
  quotes: StockQuoteResults;
  className?: string;
  symbols?: string[];
}) {
  const widthConstraints = "min-w-55 max-w-80";
  const items = symbols;
  const wheelGestures = React.useMemo(
    () => [WheelGesturesPlugin({ forceWheelAxis: "x" })],
    [],
  );

  if (items.length === 1) {
    return (
      <StockQuoteListCard
        className={cn("self-stretch", widthConstraints, className)}
        loading={loading}
        quote={quotes[items[0]] ?? null}
        symbol={items[0]}
      />
    );
  }

  return (
    <Carousel
      opts={{
        align: "center",
        skipSnaps: true,
        loop: true,
        slidesToScroll: "auto",
      }}
      plugins={wheelGestures}
      className={cn("relative self-stretch -mx-4", className)}
    >
      <CarouselContent className="ml-0 py-2">
        {items.map((symbol) => (
          <CarouselItem
            key={symbol}
            className={cn("basis-65 px-2 grow", widthConstraints)}
          >
            <StockQuoteListCard
              loading={loading}
              quote={quotes[symbol] ?? null}
              symbol={symbol}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-linear-to-r from-page-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-linear-to-l from-page-background to-transparent" />
    </Carousel>
  );
}

function StockQuoteUnavailable({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <Card className={cn("self-stretch p-4", className)} {...props}>
      <p className="text-sm text-muted-foreground">Quotes unavailable.</p>
    </Card>
  );
}

function StockQuoteViewToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const itemClassName =
    "bg-background data-[state=on]:bg-background hover:bg-background text-muted-foreground data-[state=on]:text-foreground";
  return (
    <div className="flex justify-end">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => !!val && onChange(val)}
        variant="outline"
        size="sm"
        className="shadow-xs"
        aria-label="Stock quote view"
      >
        <ToggleGroupItem
          value="carousel"
          aria-label="Carousel view"
          className={itemClassName}
        >
          <GalleryHorizontal />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="compact"
          aria-label="List view"
          className={itemClassName}
        >
          <Rows3 />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function StockQuoteCard(props: StockQuoteCardProps) {
  const symbols = useMemo(
    () => normalizeSymbols(props.symbols),
    [props.symbols],
  );
  const symbolKey = symbols.join(",");
  const [view, setView] = useState("carousel");
  const [result, setResult] = useState<{
    symbolKey: string | null;
    quotes: StockQuoteResults | null;
  }>({
    symbolKey: null,
    quotes: null,
  });
  const Component = view === "compact" ? StockQuoteCompactList : StockQuoteList;

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

  return (
    <div className="flex self-stretch flex-col gap-2">
      <StockQuoteViewToggle value={view} onChange={setView} />
      {!isLoading && noResults ? (
        <StockQuoteUnavailable />
      ) : (
        <Component
          loading={isLoading}
          quotes={result.quotes ?? {}}
          symbols={symbols}
        />
      )}
    </div>
  );
}
