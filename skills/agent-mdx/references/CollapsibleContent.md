# CollapsibleContent

Renders the content region controlled by a CollapsibleTrigger.

**Layout:** Block

## Props

```ts
export type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>
```

## Defaults

```ts
export const collapsibleContentDefaults = {} satisfies AgentMdxDefaults<CollapsibleContentProps>;
```

## Guidance

- Place the content directly inside the same Collapsible root as its trigger.
- Put secondary detail inside this region so the document remains easy to scan when it is closed.

## Examples

### Collapsible content

```mdx
<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    Include supporting text, a list, or other MDX content here.
  </CollapsibleContent>
</Collapsible>
```
