# AlertAction

Positions action content in the upper-right area of an Alert.

**Layout:** Block

## Props

```ts
export type AlertActionProps = React.ComponentProps<"div">;
```

## Defaults

```ts
export const alertActionDefaults = {} satisfies AgentMdxDefaults<AlertActionProps>;
```

## Guidance

- Place AlertAction inside an Alert when the message has a compact action or status control.
- Keep action content short so it fits beside the alert message.

## Examples

### Alert action

```mdx
<Alert>
  <AlertDescription>New report data is available.</AlertDescription>
  <AlertAction>View</AlertAction>
</Alert>
```
