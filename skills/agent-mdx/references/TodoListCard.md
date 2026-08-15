# TodoListCard

Displays Things todos as compact rows with their tags, project-or-area context, note presence, and optional agent highlighting.

**Layout:** Block

## Props

```ts
export type TodoListProps = {
  /** Things todo records, commonly from sitrep's Today or a Things search, to render in the card. */
  items: TodoListItemProps[];
};

export type TodoListItemProps = {
  /** Stable Things UUID used as the React key; do not substitute an array index or title. */
  uuid: string;

  /** Things todo title shown in the list. */
  title: string;

  /** Things tags attached to the todo, shown as outline badges; preserve semantic or emoji tags such as `🚙 Errands`. */
  tags?: string[];

  /** Things project title shown below the todo; it takes precedence over area in the display. */
  project?: string;

  /** Things area title shown below the todo only when project is absent. */
  area?: string;

  /** Whether the Things todo has non-empty notes; the card shows only a note icon, not the note text. */
  hasNotes?: boolean;

  /** Agent-facing presentation flag that gives the todo row a tinted background; it is not a Things status or priority. */
  highlighted?: boolean;
};
```

## Defaults

```ts
export const todoListCardDefaults = {} satisfies AgentMdxDefaults<TodoListProps>;
```

## Guidance

- Pass the real Things UUID in uuid for every item; it is used as the React key and should not be replaced with an index.
- Map Things tags, project, area, and note presence directly when adapting sitrep data; project is displayed instead of area when both exist.
- Set highlighted only for presentation emphasis; it does not change the Things todo.
- Use an empty items array when an empty todo state is useful in the report.

## Examples

### Basic todo list

```mdx
<TodoListCard
  items={[
    { uuid: "plan-report", title: "Plan the weekly report", tags: ["Work"], project: "AMDX" },
    { uuid: "send-update", title: "Send the update", hasNotes: true },
  ]}
/>
```

### Empty todo list

```mdx
<TodoListCard items={[]} />
```
