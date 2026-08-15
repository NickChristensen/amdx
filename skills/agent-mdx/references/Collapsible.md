# Collapsible

**Components:** Collapsible (root), CollapsibleTrigger (Required), CollapsibleContent (Required)

## Composition

- Use one CollapsibleTrigger and one CollapsibleContent inside each Collapsible.
- Set defaultOpen when the report should show the content on first render.

## Component contracts

### Collapsible

Groups content behind a toggle that can start open or closed.

**Layout:** Block

#### Props

```ts
export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>
```

#### Defaults

```ts
export const collapsibleDefaults = {
  defaultOpen: false,
} satisfies AgentMdxDefaults<CollapsibleProps>;
```

#### Examples

##### Basic collapsible section

```mdx
<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is hidden until the trigger is selected.
  </CollapsibleContent>
</Collapsible>
```

##### Open by default

```mdx
<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is visible when the document loads.
  </CollapsibleContent>
</Collapsible>
```

### CollapsibleTrigger

Renders the interactive control that opens or closes a Collapsible.

**Layout:** Block

#### Props

```ts
export type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>
```

#### Defaults

```ts
export const collapsibleTriggerDefaults = {} satisfies AgentMdxDefaults<CollapsibleTriggerProps>;
```

#### Guidance

- Place the trigger directly inside its Collapsible root and pair it with that root's CollapsibleContent.
- Use clear action text that describes whether the control reveals or hides detail.

#### Examples

##### Collapsible trigger

```mdx
<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>Additional context.</CollapsibleContent>
</Collapsible>
```

### CollapsibleContent

Renders the content region controlled by a CollapsibleTrigger.

**Layout:** Block

#### Props

```ts
export type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>
```

#### Defaults

```ts
export const collapsibleContentDefaults = {} satisfies AgentMdxDefaults<CollapsibleContentProps>;
```

#### Guidance

- Place the content directly inside the same Collapsible root as its trigger.
- Put secondary detail inside this region so the document remains easy to scan when it is closed.

#### Examples

##### Collapsible content

```mdx
<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    Include supporting text, a list, or other MDX content here.
  </CollapsibleContent>
</Collapsible>
```
