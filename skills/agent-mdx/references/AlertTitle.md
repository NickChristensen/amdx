# AlertTitle

Renders the concise heading for an Alert.

**Layout:** Block

## Props

```ts
export type AlertTitleProps = React.ComponentProps<"div">;
```

## Defaults

```ts
export const alertTitleDefaults = {} satisfies AgentMdxDefaults<AlertTitleProps>;
```

## Guidance

- Place AlertTitle directly inside an Alert when the message needs a clear heading.
- Keep the title short so the alert remains easy to scan.

## Examples

### Alert title

```mdx
<Alert>
  <AlertTitle>Review needed</AlertTitle>
</Alert>
```
