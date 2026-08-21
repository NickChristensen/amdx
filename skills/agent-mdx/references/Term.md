# Term

Adds a short definition to the first occurrence of jargon or another unfamiliar term. Use when a reader may need help understanding the term without interrupting the report.

**Layout:** Inline

## Props

```ts
export type TermProps = {
  /** The term displayed in the document and used as the focusable trigger. */
  children: string;

  /** A short definition shown in the tooltip. */
  definition: string;
};
```

## Defaults

```ts
export const termDefaults = {} satisfies AgentMdxDefaults<TermProps>;
```

## Guidance

- Use Term for a specialized or unfamiliar term at its first occurrence in a report.
- Keep the definition short and useful. Write later occurrences as plain text.
- Write the surrounding sentence so it remains clear without opening the definition. Do not repeat the tooltip definition verbatim in that sentence.

## Examples

### Define a term on first use

```mdx
A <Term definition="A structured description of a service interface.">contract</Term> helps readers understand the API. Later references to the contract stay plain text.
```
