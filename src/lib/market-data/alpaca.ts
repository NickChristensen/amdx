import "server-only";

import {
  STOCK_QUOTE_RANGES,
  type StockQuoteComparison,
  type StockQuoteRange,
  type StockQuoteResults,
} from "@/lib/stock-quotes";

const ALPACA_TIMEOUT_MS = 15_000;
const MARKET_TIME_ZONE = "America/New_York";
const marketDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: MARKET_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type AlpacaConfig = {
  apiKeyId: string;
  apiSecretKey: string;
  baseUrl: URL;
};

type MarketDate = {
  year: number;
  month: number;
  day: number;
};

type AlpacaBar = {
  o?: unknown;
  c?: unknown;
  t?: unknown;
};

type AlpacaSnapshot = {
  currency?: unknown;
  latestTrade?: {
    p?: unknown;
    t?: unknown;
  };
  minuteBar?: AlpacaBar;
  dailyBar?: AlpacaBar;
};

type AlpacaBarsResponse = {
  bars: Record<string, AlpacaBar[]>;
  currency?: string;
};

type QuotePrice = {
  price: number;
  asOf: string;
};

type QuotePoint = {
  timestamp: string;
  price: number;
};

export class AlpacaConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlpacaConfigurationError";
  }
}

export class AlpacaRequestError extends Error {
  status?: number;
  requestId?: string;

  constructor(
    message: string,
    options: {
      cause?: unknown;
      status?: number;
      requestId?: string;
    } = {},
  ) {
    const details = [
      options.status === undefined ? null : `status=${options.status}`,
      options.requestId ? `requestId=${options.requestId}` : null,
    ].filter(Boolean);
    super(details.length > 0 ? `${message} (${details.join(", ")})` : message, {
      cause: options.cause,
    });
    this.name = "AlpacaRequestError";
    this.status = options.status;
    this.requestId = options.requestId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asPrice(value: unknown) {
  const price = Number(value);

  return Number.isFinite(price) && price > 0 ? price : null;
}

function asTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatMarketDate({ year, month, day }: MarketDate) {
  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function getMarketDate(value: Date): MarketDate {
  const parts = Object.fromEntries(
    marketDateFormatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function getMarketDateKey(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : formatMarketDate(getMarketDate(date));
}

function shiftMarketDate(date: MarketDate, days: number): MarketDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function getAlpacaConfig(): AlpacaConfig {
  const apiKeyId = process.env.ALPACA_API_KEY_ID?.trim();
  const apiSecretKey = process.env.ALPACA_API_SECRET_KEY?.trim();
  const rawBaseUrl = process.env.ALPACA_MARKET_DATA_API_URL?.trim();

  if (!apiKeyId || !apiSecretKey || !rawBaseUrl) {
    throw new AlpacaConfigurationError("Alpaca market data is not configured");
  }

  let baseUrl: URL;

  try {
    baseUrl = new URL(rawBaseUrl);
  } catch {
    throw new AlpacaConfigurationError(
      "Alpaca market data URL must be an absolute HTTP or HTTPS URL",
    );
  }

  if (baseUrl.protocol !== "https:" && baseUrl.protocol !== "http:") {
    throw new AlpacaConfigurationError(
      "Alpaca market data URL must be an absolute HTTP or HTTPS URL",
    );
  }

  return { apiKeyId, apiSecretKey, baseUrl };
}

function buildApiUrl(
  baseUrl: URL,
  path: string,
  query: Record<string, string | undefined>,
) {
  const url = new URL(baseUrl);
  const basePath = url.pathname.replace(/\/$/, "");

  url.pathname = `${basePath}${path}`;
  url.search = "";

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

async function requestAlpacaJson(
  config: AlpacaConfig,
  path: string,
  query: Record<string, string | undefined>,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ALPACA_TIMEOUT_MS);

  try {
    const response = await fetch(buildApiUrl(config.baseUrl, path, query), {
      headers: {
        Accept: "application/json",
        "APCA-API-KEY-ID": config.apiKeyId,
        "APCA-API-SECRET-KEY": config.apiSecretKey,
      },
      signal: controller.signal,
    });
    const requestId = response.headers.get("x-request-id") ?? undefined;

    if (!response.ok) {
      throw new AlpacaRequestError("Alpaca request failed", {
        status: response.status,
        requestId,
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw new AlpacaRequestError("Alpaca returned invalid JSON", {
        cause: error,
        status: response.status,
        requestId,
      });
    }
  } catch (error) {
    if (error instanceof AlpacaRequestError) {
      throw error;
    }

    throw new AlpacaRequestError("Alpaca request failed", { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

async function getSnapshots(config: AlpacaConfig, symbols: string[]) {
  const payload = await requestAlpacaJson(config, "/v2/stocks/snapshots", {
    symbols: symbols.join(","),
    feed: "iex",
  });

  if (!isRecord(payload)) {
    throw new AlpacaRequestError("Alpaca returned an invalid snapshots response");
  }

  return Object.fromEntries(
    Object.entries(payload).filter((entry): entry is [string, AlpacaSnapshot] =>
      isRecord(entry[1]),
    ),
  );
}

function parseBarsResponse(payload: unknown): {
  bars: Record<string, AlpacaBar[]>;
  currency?: string;
  nextPageToken?: string;
} {
  if (!isRecord(payload) || !isRecord(payload.bars)) {
    throw new AlpacaRequestError("Alpaca returned an invalid bars response");
  }

  return {
    bars: Object.fromEntries(
      Object.entries(payload.bars).flatMap(([symbol, bars]) =>
        Array.isArray(bars)
          ? [[symbol, bars.filter(isRecord) as AlpacaBar[]] as const]
          : [],
      ),
    ),
    currency: typeof payload.currency === "string" ? payload.currency : undefined,
    nextPageToken:
      typeof payload.next_page_token === "string" && payload.next_page_token
        ? payload.next_page_token
        : undefined,
  };
}

async function getBars(
  config: AlpacaConfig,
  {
    symbols,
    timeframe,
    start,
    end,
  }: {
    symbols: string[];
    timeframe: "5Min" | "30Min" | "1Hour" | "1Day";
    start: string;
    end: string;
  },
): Promise<AlpacaBarsResponse> {
  const bars: Record<string, AlpacaBar[]> = {};
  const seenPageTokens = new Set<string>();
  let currency: string | undefined;
  let pageToken: string | undefined;

  do {
    if (pageToken) {
      if (seenPageTokens.has(pageToken)) {
        throw new AlpacaRequestError("Alpaca returned a repeated bars page token");
      }

      seenPageTokens.add(pageToken);
    }

    const payload = await requestAlpacaJson(config, "/v2/stocks/bars", {
      symbols: symbols.join(","),
      timeframe,
      start,
      end,
      limit: "10000",
      adjustment: "split",
      feed: "iex",
      sort: "asc",
      page_token: pageToken,
    });
    const page = parseBarsResponse(payload);

    currency ??= page.currency;
    for (const [symbol, symbolBars] of Object.entries(page.bars)) {
      bars[symbol] ??= [];
      bars[symbol].push(...symbolBars);
    }

    pageToken = page.nextPageToken;
  } while (pageToken);

  return { bars, currency };
}

function getSnapshotPrice(snapshot: AlpacaSnapshot): QuotePrice | null {
  const candidates = [
    { price: snapshot.latestTrade?.p, timestamp: snapshot.latestTrade?.t },
    { price: snapshot.minuteBar?.c, timestamp: snapshot.minuteBar?.t },
    { price: snapshot.dailyBar?.c, timestamp: snapshot.dailyBar?.t },
  ];

  for (const candidate of candidates) {
    const price = asPrice(candidate.price);
    const asOf = asTimestamp(candidate.timestamp);

    if (price !== null && asOf !== null) {
      return { price, asOf };
    }
  }

  return null;
}

function normalizePoints(bars: AlpacaBar[]) {
  const points = new Map<string, QuotePoint>();

  for (const bar of bars) {
    const price = asPrice(bar.c);
    const timestamp = asTimestamp(bar.t);

    if (price !== null && timestamp !== null) {
      points.set(timestamp, { timestamp, price });
    }
  }

  return [...points.values()].sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp),
  );
}

function getSeriesStartDate(asOf: string, range: StockQuoteRange) {
  const asOfDate = getMarketDate(new Date(asOf));

  switch (range) {
    case "1d":
      return formatMarketDate(asOfDate);
    case "7d":
      return formatMarketDate(shiftMarketDate(asOfDate, -7));
    case "30d":
      return formatMarketDate(shiftMarketDate(asOfDate, -30));
    case "ytd":
      return formatMarketDate({ year: asOfDate.year, month: 1, day: 1 });
  }
}

function getSeriesPoints(
  bars: AlpacaBar[],
  asOf: string,
  range: StockQuoteRange,
) {
  const startDate = getSeriesStartDate(asOf, range);
  const asOfDate = getMarketDateKey(asOf);

  return normalizePoints(bars).filter((point) => {
    const pointDate = getMarketDateKey(point.timestamp);

    return (
      pointDate !== null &&
      asOfDate !== null &&
      pointDate >= startDate &&
      pointDate <= asOfDate
    );
  });
}

function getLastCloseOnOrBefore(bars: AlpacaBar[], date: string) {
  const points = normalizePoints(bars);

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    const pointDate = getMarketDateKey(point.timestamp);

    if (pointDate !== null && pointDate <= date) {
      return point.price;
    }
  }

  return null;
}

function getFirstOpenInRange(
  bars: AlpacaBar[],
  startDate: string,
  asOfDate: string,
) {
  const points = new Map<string, QuotePoint>();

  for (const bar of bars) {
    const price = asPrice(bar.o);
    const timestamp = asTimestamp(bar.t);

    if (price !== null && timestamp !== null) {
      points.set(timestamp, { timestamp, price });
    }
  }

  for (const point of [...points.values()].sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp),
  )) {
    const pointDate = getMarketDateKey(point.timestamp);

    if (
      pointDate !== null &&
      pointDate >= startDate &&
      pointDate <= asOfDate
    ) {
      return point.price;
    }
  }

  return null;
}

function calculateComparison(price: number, baseline: number | null) {
  if (baseline === null || baseline === 0) {
    return null;
  }

  const change = price - baseline;

  return {
    change,
    changePercent: (change / baseline) * 100,
  } satisfies StockQuoteComparison;
}

function getComparisons(price: number, asOf: string, bars: AlpacaBar[]) {
  const asOfDate = getMarketDate(new Date(asOf));
  const asOfDateKey = formatMarketDate(asOfDate);

  return Object.fromEntries(
    STOCK_QUOTE_RANGES.map((range) => {
      const startDate = getSeriesStartDate(asOf, range);
      const baselineDate = formatMarketDate(
        shiftMarketDate(
          {
            year: Number(startDate.slice(0, 4)),
            month: Number(startDate.slice(5, 7)),
            day: Number(startDate.slice(8, 10)),
          },
          -1,
        ),
      );
      const baseline =
        getLastCloseOnOrBefore(bars, baselineDate) ??
        getFirstOpenInRange(bars, startDate, asOfDateKey);

      return [range, calculateComparison(price, baseline)];
    }),
  ) as Record<StockQuoteRange, StockQuoteComparison | null>;
}

function getRequestStartDate(range: StockQuoteRange, today: MarketDate) {
  switch (range) {
    case "1d":
      return formatMarketDate(shiftMarketDate(today, -14));
    case "7d":
      return formatMarketDate(shiftMarketDate(today, -14));
    case "30d":
      return formatMarketDate(shiftMarketDate(today, -45));
    case "ytd":
      return formatMarketDate({ year: today.year, month: 1, day: 1 });
  }
}

function getTimeframe(range: StockQuoteRange) {
  switch (range) {
    case "1d":
      return "5Min" as const;
    case "7d":
      return "30Min" as const;
    case "30d":
      return "1Hour" as const;
    case "ytd":
      return "1Day" as const;
  }
}

export async function getAlpacaStockQuotes({
  symbols,
  range,
}: {
  symbols: string[];
  range: StockQuoteRange;
}): Promise<StockQuoteResults> {
  const config = getAlpacaConfig();
  const now = new Date();
  const today = getMarketDate(now);
  const end = now.toISOString();
  const selectedStart = getRequestStartDate(range, today);
  const dailyStart = formatMarketDate(shiftMarketDate(today, -375));
  const [snapshots, dailyBars, selectedBars] = await Promise.all([
    getSnapshots(config, symbols),
    getBars(config, {
      symbols,
      timeframe: "1Day",
      start: dailyStart,
      end,
    }),
    range === "ytd"
      ? Promise.resolve<AlpacaBarsResponse>({ bars: {}, currency: undefined })
      : getBars(config, {
          symbols,
          timeframe: getTimeframe(range),
          start: selectedStart,
          end,
        }),
  ]);

  const seriesBars = range === "ytd" ? dailyBars : selectedBars;

  return Object.fromEntries(symbols.map((symbol) => {
    const snapshot = snapshots[symbol];
    const current = snapshot ? getSnapshotPrice(snapshot) : null;

    if (!snapshot || !current) {
      return [symbol, null];
    }

    return [
      symbol,
      {
        symbol,
        currency:
          (typeof snapshot.currency === "string" && snapshot.currency) ||
          seriesBars.currency ||
          dailyBars.currency ||
          "USD",
        price: current.price,
        asOf: current.asOf,
        series: {
          range,
          points: getSeriesPoints(seriesBars.bars[symbol] ?? [], current.asOf, range),
        },
        comparisons: getComparisons(
          current.price,
          current.asOf,
          dailyBars.bars[symbol] ?? [],
        ),
      },
    ];
  })) as StockQuoteResults;
}
