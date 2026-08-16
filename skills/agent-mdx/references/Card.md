# Card

**Components:** Card (root), CardHeader (Optional), CardIcon (Optional), CardTitle (Optional), CardDescription (Optional), CardAction (Optional), CardContent (Required), CardFooter (Optional)

## Composition

- Use Card as the outer surface for one complete report block.
- Use CardContent for the card's primary body content, with CardHeader and CardFooter when the block has distinct sections.
- Use CardIcon with CardTitle when the block needs a clear visual marker, and use CardAction for a compact status or link in the header.
- Use size="sm" when the block needs tighter outer spacing.

## Component contracts

### Card

Provides a block surface for grouping related content.

**Layout:** Block

#### Props

```ts
export type CardProps = React.ComponentProps<"div"> & {
  /** Controls the card's outer spacing. */
  size?: "default" | "sm";
};
```

#### Defaults

```ts
export const cardDefaults = {
  size: "default",
} satisfies AgentMdxDefaults<CardProps>;
```

#### Examples

##### Structured card

```mdx
<Card>
  <CardHeader>
    <CardIcon><Icon name="chart-no-axes-combined" aria-hidden="true" /></CardIcon>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Monthly performance snapshot</CardDescription>
    <CardAction><Badge variant="outline">Review</Badge></CardAction>
  </CardHeader>
  <CardContent>
    **$42,000** this month, up 12.4% from the previous period.
  </CardContent>
  <CardFooter>Source: finance report, synced today</CardFooter>
</Card>
```

##### Compact card

```mdx
<Card size="sm">
  <CardHeader>
    <CardTitle>Compact summary</CardTitle>
  </CardHeader>
  <CardContent>
    A compact block with reduced outer spacing.
  </CardContent>
</Card>
```

### CardHeader

Groups the title, description, icon, and action area at the top of a Card.

**Layout:** Block

#### Props

```ts
export type CardHeaderProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardHeaderDefaults = {} satisfies AgentMdxDefaults<CardHeaderProps>;
```

#### Guidance

- Place CardHeader directly inside Card when the block needs a distinct heading area.
- Combine CardTitle with CardDescription for a clear heading and supporting context.

#### Examples

##### Card header

```mdx
<Card>
  <CardHeader>
    <CardTitle>Release readiness</CardTitle>
    <CardDescription>Current deployment status</CardDescription>
  </CardHeader>
  <CardContent>
    The latest deployment passed its readiness checks.
  </CardContent>
</Card>
```

### CardIcon

Adds a compact visual marker to a CardHeader.

**Layout:** Block

#### Props

```ts
export type CardIconProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardIconDefaults = {} satisfies AgentMdxDefaults<CardIconProps>;
```

#### Guidance

- Place CardIcon inside CardHeader before CardTitle when the card benefits from a visual marker.
- Use an Icon as the child so the marker has a meaningful accessible name or aria-hidden state.

#### Examples

##### Card icon

```mdx
<Card>
  <CardHeader>
    <CardIcon><Icon name="sparkles" aria-hidden="true" /></CardIcon>
    <CardTitle>Highlights</CardTitle>
    <CardDescription>New findings from this report</CardDescription>
  </CardHeader>
  <CardContent>
    Three new findings are ready for review.
  </CardContent>
</Card>
```

### CardTitle

Renders the main heading for a Card.

**Layout:** Block

#### Props

```ts
export type CardTitleProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardTitleDefaults = {} satisfies AgentMdxDefaults<CardTitleProps>;
```

#### Guidance

- Place CardTitle inside CardHeader to identify the card's main subject.
- Keep the title short so readers can scan the card quickly.

#### Examples

##### Card title

```mdx
<Card>
  <CardHeader>
    <CardTitle>Open issues</CardTitle>
  </CardHeader>
  <CardContent>
    Review the open issues before the next release.
  </CardContent>
</Card>
```

### CardDescription

Renders supporting context below a CardTitle.

**Layout:** Block

#### Props

```ts
export type CardDescriptionProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardDescriptionDefaults = {} satisfies AgentMdxDefaults<CardDescriptionProps>;
```

#### Guidance

- Place CardDescription inside CardHeader after CardTitle when the heading needs context.
- Use one short sentence or phrase that explains the card's scope.

#### Examples

##### Card description

```mdx
<Card>
  <CardHeader>
    <CardTitle>System status</CardTitle>
    <CardDescription>Last checked five minutes ago</CardDescription>
  </CardHeader>
  <CardContent>
    All monitored services are operating normally.
  </CardContent>
</Card>
```

### CardAction

Places compact action or status content at the end of a CardHeader.

**Layout:** Block

#### Props

```ts
export type CardActionProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardActionDefaults = {} satisfies AgentMdxDefaults<CardActionProps>;
```

#### Guidance

- Place CardAction inside CardHeader when the card has a compact link, badge, or status control.
- Keep the content short so it remains aligned with the heading.

#### Examples

##### Card action

```mdx
<Card>
  <CardHeader>
    <CardTitle>Review queue</CardTitle>
    <CardAction><Badge variant="outline">17 open</Badge></CardAction>
  </CardHeader>
  <CardContent>
    Seventeen items are waiting for review.
  </CardContent>
</Card>
```

### CardContent

Provides the main content area inside a Card.

**Layout:** Block

#### Props

```ts
export type CardContentProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardContentDefaults = {} satisfies AgentMdxDefaults<CardContentProps>;
```

#### Guidance

- Place CardContent after CardHeader when the card has a main body section.
- Use ordinary Markdown and agent-facing components inside CardContent.

#### Examples

##### Card content

```mdx
<Card>
  <CardContent>
    The deployment completed successfully and all checks passed.
  </CardContent>
</Card>
```

### CardFooter

Provides a supporting footer area at the bottom of a Card.

**Layout:** Block

#### Props

```ts
export type CardFooterProps = React.ComponentProps<"div">;
```

#### Defaults

```ts
export const cardFooterDefaults = {} satisfies AgentMdxDefaults<CardFooterProps>;
```

#### Guidance

- Place CardFooter after CardContent when the card needs source text, a timestamp, or a related link.
- Keep footer content secondary to the main card content.

#### Examples

##### Card footer

```mdx
<Card>
  <CardContent>Deployment completed successfully.</CardContent>
  <CardFooter>Updated 5 minutes ago</CardFooter>
</Card>
```
