import { NextRequest } from "next/server";

import {
  AlpacaConfigurationError,
  AlpacaRequestError,
  getAlpacaStockQuotes,
} from "@/lib/market-data/alpaca";
import {
  STOCK_QUOTE_RANGES,
  type StockQuoteRange,
} from "@/lib/stock-quotes";

const SYMBOL_PATTERN = /^[A-Z0-9._:-]{1,24}$/;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function parseRange(request: NextRequest): StockQuoteRange | null {
  const ranges = request.nextUrl.searchParams.getAll("range");

  if (ranges.length > 1) {
    return null;
  }

  const range = ranges[0] ?? "1d";

  return (STOCK_QUOTE_RANGES as readonly string[]).includes(range)
    ? (range as StockQuoteRange)
    : null;
}

export async function GET(request: NextRequest) {
  const symbols = parseSymbols(request);
  const range = parseRange(request);

  if (!symbols) {
    return Response.json({ error: "Invalid stock symbols" }, { status: 400 });
  }

  if (!range) {
    return Response.json({ error: "Invalid stock quote range" }, { status: 400 });
  }

  try {
    const quotes = await getAlpacaStockQuotes({ symbols, range });

    return Response.json(
      { quotes },
      {
        headers: {
          "cache-control": "private, max-age=30",
        },
      },
    );
  } catch (error) {
    if (error instanceof AlpacaConfigurationError) {
      console.error("Stock quote market data configuration error", { error });

      return Response.json(
        { error: "Market data is unavailable" },
        { status: 500 },
      );
    }

    if (error instanceof AlpacaRequestError) {
      console.error("Stock quote market data request failed", {
        symbols,
        range,
        status: error.status,
        requestId: error.requestId,
        error,
      });
    } else {
      console.error("Stock quote market data request failed", {
        symbols,
        range,
        error,
      });
    }

    return Response.json(
      { error: "Market data is unavailable" },
      { status: 502 },
    );
  }
}
