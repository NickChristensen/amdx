# Term

Use to provide a definition of jargon, acronyms, technical concepts, or domain-specific terms that readers may not know. Renders in a tooltip. Define only the first occurrence in plain language.

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
- Keep essential information in the surrounding prose because the definition is supplementary.

## Examples

### Define a term on first use

```mdx
A <Term definition="A structured description of a service interface.">contract</Term> helps readers understand the API. Later references to the contract stay plain text.
```
