# Alert

Displays a semantic message with optional title, description, and action content.

**Layout:** Block

## Props

```ts
export type AlertProps = React.ComponentProps<"div"> & {
  /** Visual treatment applied to the alert. */
  variant?: AlertVariant;
};

export type AlertVariant =
  | "default"
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution"
  | "danger";
```

## Defaults

```ts
export const alertDefaults = {
  variant: "default",
} satisfies AgentMdxDefaults<AlertProps>;
```

## Guidance

- Use Alert as the root and place AlertTitle, AlertDescription, or AlertAction inside it as needed.
- Choose note, tip, important, warning, caution, or danger to match the message context.

## Examples

### Warning with action

```mdx
<Alert variant="warning">
  <AlertTitle>Review needed</AlertTitle>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
  <AlertAction>Open report</AlertAction>
</Alert>
```

### Simple note

```mdx
<Alert variant="note">
  <AlertDescription>
    The report uses the latest synced data.
  </AlertDescription>
</Alert>
```
