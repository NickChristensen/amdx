# TweetCard

Fetches and renders an X post with its author, text, links, and available media. Use when the original post provides evidence or context that readers should inspect directly.

**Layout:** Block

## Props

```ts
export type TweetCardProps = {
  /** Numeric X/Twitter post ID as a string; use the value from the post URL's `/status/<id>` segment. */
  id: string;
};
```

## Defaults

```ts
export const tweetCardDefaults = {} satisfies AgentMdxDefaults<TweetCardProps>;
```

## Guidance

- Pass only the numeric post ID as a string, not the full URL or an @handle; the card fetches the post at runtime.
- The card handles loading, unavailable, quoted-post, link, photo, and video states from the fetched post data.

## Examples

### Basic tweet card

```mdx
<TweetCard id="1920343354073846004" />
```
