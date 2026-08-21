# Progress

Renders a horizontal progress bar. Use to show completion toward a known percentage or that a process has started.

**Layout:** Block

## Props

```ts
export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>
```

## Defaults

```ts
export const progressDefaults = {
  value: 0,
} satisfies AgentMdxDefaults<ProgressProps>;
```

## Guidance

- Pass value as a percentage from 0 to 100. Omit it for an empty progress bar.
- Add an accessible name with aria-label when the surrounding content does not already label the progress bar.

## Examples

### Completion progress

```mdx
<Progress value={72} aria-label="Import progress" />
```

### Progress without a value

```mdx
<Progress aria-label="Preparing import" />
```
