# Collapsible

Groups content behind a toggle that can start open or closed.

**Layout:** Block

## Props

```ts
export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>
```

## Defaults

```ts
export const collapsibleDefaults = {
  defaultOpen: false,
} satisfies AgentMdxDefaults<CollapsibleProps>;
```

## Guidance

- Use one CollapsibleTrigger and one CollapsibleContent inside each Collapsible.
- Set defaultOpen when the report should show the content on first render.

## Examples

### Basic collapsible section

```mdx
<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is hidden until the trigger is selected.
  </CollapsibleContent>
</Collapsible>
```

### Open by default

```mdx
<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is visible when the document loads.
  </CollapsibleContent>
</Collapsible>
```
