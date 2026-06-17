import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { NextRequest } from "next/server";

const execFileAsync = promisify(execFile);

const STOCK_QUOTE_SCRIPT = path.join(
  process.env.HOME ?? "",
  ".openclaw",
  "workspace-finances",
  "skills",
  "stock-quotes",
  "scripts",
  "get-quote.js",
);
const OPENCLAW_ENV_PATH = path.join(
  process.env.HOME ?? "",
  ".openclaw",
  ".env",
);
const SYMBOL_PATTERN = /^[A-Z0-9._:-]{1,24}$/;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RawComparison = {
  available?: unknown;
  price?: unknown;
  change?: unknown;
  changePercent?: unknown;
  reason?: unknown;
};

type RawQuote = {
  price?: unknown;
  change?: unknown;
  changePercent?: unknown;
  currency?: unknown;
  intraday?: unknown;
  comparisons?: unknown;
};

type NormalizedQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  intraday: Array<{
    time: string;
    price: number;
    changePercent: number;
  }>;
  comparisons?: Record<
    string,
    {
      available: boolean;
      price?: number | null;
      change?: number | null;
      changePercent?: number | null;
      reason?: string;
    }
  >;
};

function parseSymbols(request: NextRequest) {
  const rawSymbols = [
    ...request.nextUrl.searchParams.getAll("symbol"),
    ...request.nextUrl.searchParams
      .getAll("symbols")
      .flatMap((value) => value.split(",")),
  ];
  const symbols = rawSymbols
    .map((symbol) => symbol.trim().replace(/^\$/, "").toUpperCase())
    .filter(Boolean);
  const uniqueSymbols = [...new Set(symbols)];

  if (
    uniqueSymbols.length === 0 ||
    uniqueSymbols.some((symbol) => !SYMBOL_PATTERN.test(symbol))
  ) {
    return null;
  }

  return uniqueSymbols;
}

function parseEnvLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);

  if (!match) {
    return null;
  }

  const [, key, rawValue] = match;
  const value = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");

  return [key, value] as const;
}

async function loadOpenClawEnv() {
  try {
    const raw = await fs.readFile(OPENCLAW_ENV_PATH, "utf8");

    return Object.fromEntries(
      raw
        .split("\n")
        .map(parseEnvLine)
        .filter((entry) => entry !== null),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function asNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeComparison(comparison: RawComparison) {
  const available = comparison.available === true;
  const price = asNumber(comparison.price);
  const change = asNumber(comparison.change);
  const changePercent = asNumber(comparison.changePercent);

  return {
    available,
    ...(price !== null ? { price } : {}),
    ...(change !== null ? { change } : {}),
    ...(changePercent !== null ? { changePercent } : {}),
    ...(typeof comparison.reason === "string"
      ? { reason: comparison.reason }
      : {}),
  };
}

function normalizeIntradayPoint(
  point: unknown,
  previousClose: number,
): NormalizedQuote["intraday"][number] | null {
  if (!Array.isArray(point) || point.length < 2) {
    return null;
  }

  const time = typeof point[0] === "string" ? point[0] : null;
  const price = asNumber(point[1]);

  if (!time || price === null) {
    return null;
  }

  return {
    time,
    price,
    changePercent:
      previousClose === 0 ? 0 : ((price - previousClose) / previousClose) * 100,
  };
}

function normalizeQuote(symbol: string, rawQuote: RawQuote) {
  const price = asNumber(rawQuote.price);
  const change = asNumber(rawQuote.change);
  const changePercent = asNumber(rawQuote.changePercent);

  if (price === null || change === null || changePercent === null) {
    return null;
  }

  const previousClose = price - change;
  const rawComparisons =
    rawQuote.comparisons &&
    typeof rawQuote.comparisons === "object" &&
    !Array.isArray(rawQuote.comparisons)
      ? (rawQuote.comparisons as Record<string, RawComparison>)
      : {};
  const comparisons = Object.fromEntries(
    Object.entries(rawComparisons).map(([key, comparison]) => [
      key,
      normalizeComparison(comparison),
    ]),
  );

  return {
    symbol,
    price,
    change,
    changePercent,
    currency: typeof rawQuote.currency === "string" ? rawQuote.currency : "USD",
    intraday: Array.isArray(rawQuote.intraday)
      ? rawQuote.intraday
          .map((point) => normalizeIntradayPoint(point, previousClose))
          .filter((point) => point !== null)
      : [],
    ...(Object.keys(comparisons).length ? { comparisons } : {}),
  } satisfies NormalizedQuote;
}

function normalizeOutput(payload: unknown, symbols: string[]) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const output = payload as Record<string, RawQuote>;

  return symbols
    .map((symbol) => normalizeQuote(symbol, output[symbol] ?? {}))
    .filter((quote) => quote !== null);
}

export async function GET(request: NextRequest) {
  const symbols = parseSymbols(request);

  if (!symbols) {
    return Response.json({ error: "Invalid stock symbols" }, { status: 400 });
  }

  try {
    const openClawEnv = await loadOpenClawEnv();
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        STOCK_QUOTE_SCRIPT,
        "--intraday",
        "--compare",
        "7",
        "--compare",
        "30",
        "--compare",
        "ytd",
        ...symbols,
      ],
      {
        env: {
          ...openClawEnv,
          ...process.env,
        },
        maxBuffer: 1024 * 1024,
        timeout: 20_000,
      },
    );
    const quotes = normalizeOutput(JSON.parse(stdout), symbols);

    if (quotes.length === 0) {
      return Response.json({ error: "No quotes found" }, { status: 404 });
    }

    return Response.json(
      { quotes },
      {
        headers: {
          "cache-control": "private, max-age=30",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch stock quotes", { symbols, error });

    return Response.json(
      { error: "Failed to fetch stock quotes" },
      { status: 502 },
    );
  }
}
