# StockQuoteCard

Fetches and displays quote data for ticker symbols, including current price, period changes, and an expandable one-day price chart.

**Layout:** Block

## Props

```ts
export type StockQuoteCardProps = {
  /** Ticker symbols for the quote endpoint; whitespace, one leading `$`, case, and duplicates are normalized before fetching. */
  symbols: string[];
};
```

## Defaults

```ts
export const stockQuoteCardDefaults = {} satisfies AgentMdxDefaults<StockQuoteCardProps>;
```

## Guidance

- Pass provider-recognized ticker symbols such as AAPL or MSFT; the component trims whitespace, removes one leading `$`, uppercases, and deduplicates them.
- Quotes and the one-day series are fetched at render time, so do not pass quote objects or preformatted prices.
- Use an empty array only when showing the unavailable-quote state is useful in the report.

## Examples

### Basic stock quotes

```mdx
<StockQuoteCard symbols={["AAPL", "MSFT", "NVDA"]} />
```

### Unavailable quote state

```mdx
<StockQuoteCard symbols={[]} />
```
