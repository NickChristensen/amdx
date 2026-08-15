# AlertDescription

Renders supporting content for an Alert.

**Layout:** Block

## Props

```ts
export type AlertDescriptionProps = React.ComponentProps<"div">;
```

## Defaults

```ts
export const alertDescriptionDefaults = {} satisfies AgentMdxDefaults<AlertDescriptionProps>;
```

## Guidance

- Place AlertDescription directly inside an Alert after its AlertTitle when both are present.
- Use the description for the context or next step that supports the alert heading.

## Examples

### Alert description

```mdx
<Alert>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
</Alert>
```
