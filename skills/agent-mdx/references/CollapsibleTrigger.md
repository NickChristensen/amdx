# CollapsibleTrigger

Renders the interactive control that opens or closes a Collapsible.

**Layout:** Block

## Props

```ts
export type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>
```

## Defaults

```ts
export const collapsibleTriggerDefaults = {} satisfies AgentMdxDefaults<CollapsibleTriggerProps>;
```

## Guidance

- Place the trigger directly inside its Collapsible root and pair it with that root's CollapsibleContent.
- Use clear action text that describes whether the control reveals or hides detail.

## Examples

### Collapsible trigger

```mdx
<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>Additional context.</CollapsibleContent>
</Collapsible>
```
