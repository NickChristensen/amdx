export const STOCK_QUOTE_RANGES = ["1d", "7d", "30d", "ytd"] as const;

export type StockQuoteRange = (typeof STOCK_QUOTE_RANGES)[number];

export type StockQuoteComparison = {
  change: number;
  changePercent: number;
};

export type StockQuoteData = {
  symbol: string;
  currency: string;
  price: number;
  asOf: string;
  series: {
    range: StockQuoteRange;
    points: Array<{
      timestamp: string;
      price: number;
    }>;
  };
  comparisons: Record<StockQuoteRange, StockQuoteComparison | null>;
};

export type StockQuoteResults = Record<string, StockQuoteData | null>;
