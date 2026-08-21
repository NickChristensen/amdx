# Alert

**Components:** Alert (root), AlertTitle (Optional), AlertDescription (Required), AlertAction (Optional)

## Composition

- Use Alert as the root and include one AlertDescription in every alert.
- Add AlertTitle when the message needs a clear heading, and add AlertAction only when the alert has a compact action or status control.
- A generic Icon is optional. Add it before AlertTitle when possible to give the alert stronger visual hierarchy.
- Choose default for neutral context, secondary for quieter supporting context, success for completed states, warning for caution, or destructive for harmful outcomes.

## Component contracts

### Alert

Renders an emphasized semantic message with optional title and action content. Use for important context, status, caution, or next steps that readers should not miss.

**Layout:** Block

#### Props

```ts
export type AlertProps = React.ComponentProps<"div"> & {
  /** Visual treatment applied to the alert. */
  variant?: AlertVariant;
};

export type AlertVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary";
```

#### Defaults

```ts
export const alertDefaults = {
  variant: "default",
} satisfies AgentMdxDefaults<AlertProps>;
```

#### Examples

##### Warning with action

```mdx
<Alert variant="warning">
  <Icon name="triangle-alert" aria-hidden="true" />
  <AlertTitle>Review needed</AlertTitle>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
  <AlertAction>
    <Button href="/examples/kitchen-sink" size="sm">Open report</Button>
  </AlertAction>
</Alert>
```

##### Secondary context

```mdx
<Alert variant="secondary">
  <AlertDescription>
    The report uses the latest synced data.
  </AlertDescription>
</Alert>
```

### AlertTitle

Renders the concise heading for an Alert. Use when the alert needs a label that readers can scan quickly.

**Layout:** Block

#### Props

```ts
export type AlertTitleProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const alertTitleDefaults = {} satisfies AgentMdxDefaults<AlertTitleProps>;
```

#### Guidance

- Place AlertTitle directly inside an Alert when the message needs a clear heading.
- Keep the title short so the alert remains easy to scan.

#### Examples

##### Alert title

```mdx
<Alert>
  <AlertTitle>Review needed</AlertTitle>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
</Alert>
```

### AlertDescription

Renders the main explanatory content in an Alert. Use once in every Alert to state its context, consequence, or next step.

**Layout:** Block

#### Props

```ts
export type AlertDescriptionProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const alertDescriptionDefaults = {} satisfies AgentMdxDefaults<AlertDescriptionProps>;
```

#### Guidance

- Place AlertDescription directly inside an Alert after its AlertTitle when both are present.
- Use the description for the context or next step that supports the alert heading.

#### Examples

##### Alert description

```mdx
<Alert>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
</Alert>
```

### AlertAction

Renders compact action or status content in the upper-right area of an Alert. Use when the message has a short related action or state.

**Layout:** Block

#### Props

```ts
export type AlertActionProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const alertActionDefaults = {} satisfies AgentMdxDefaults<AlertActionProps>;
```

#### Guidance

- Place AlertAction inside an Alert when the message has a compact action or status control.
- Keep action content short so it fits beside the alert message.
- Use Button with href for a navigational alert action.

#### Examples

##### Alert action

```mdx
<Alert>
  <AlertDescription>New report data is available.</AlertDescription>
  <AlertAction>
    <Button href="/examples/kitchen-sink" size="sm">View report</Button>
  </AlertAction>
</Alert>
```
