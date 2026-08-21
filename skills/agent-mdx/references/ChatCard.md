# ChatCard

Renders one message thread as sorted, direction-aware chat bubbles with sender and time context. Use when the exact conversation or exchange supports the report.

**Layout:** Block

## Props

```ts
export type ChatCardProps = {
  /** Conversation object, typically a thread from sitrep's new_messages output, to display as grouped bubbles. */
  thread: ChatThread;
};

export type ChatThread = {
  /** Optional numeric source chat ID, such as the iMessage chat database ID. */
  chat_id?: number;

  /** Conversation title shown in the card header, usually the contact or group name. */
  name: string;

  /** Optional source address or conversation identifier, such as a phone number, email, or group key. */
  identifier?: string;

  /** Message records to sort and render; preserve is_from_me when adapting sitrep or imsg data. */
  messages: ChatMessage[];
};

export type ChatMessage = {
  /** Message body shown inside the bubble. */
  text: string;

  /** ISO 8601 message timestamp; messages are sorted by it and the final cluster time is shown. */
  created_at: string;

  /** Source sender or conversation address used to group adjacent messages with the same direction; with imsg it is not always the author. */
  sender?: string;

  /** Contact display name for an incoming message, shown with the final timestamp beneath the cluster when it differs from the thread name. */
  sender_name?: string;

  /** Authoritative direction flag: true means the current user sent it, false means it came from someone else. */
  is_from_me: boolean;
};
```

## Defaults

```ts
export const chatCardDefaults = {} satisfies AgentMdxDefaults<ChatCardProps>;
```

## Guidance

- Pass sitrep or imsg message records through with created_at as ISO 8601; the card sorts them chronologically.
- Use is_from_me as the direction flag: true places a message on the right, while false places it on the left; adjacent messages cluster only when sender and is_from_me both match.
- For imsg data, preserve sender and sender_name for contact/address context but do not infer authorship from sender; outgoing records can still contain the other party's address.

## Examples

### Basic conversation

```mdx
<ChatCard
  thread={{
    name: "Project updates",
    messages: [
      {
        text: "The draft is ready for review.",
        created_at: "2026-08-14T09:12:00-05:00",
        sender: "maya",
        sender_name: "Maya",
        is_from_me: false,
      },
      {
        text: "I will review it this morning.",
        created_at: "2026-08-14T09:18:00-05:00",
        sender: "me",
        is_from_me: true,
      },
    ],
  }}
/>
```

### Conversation with grouped messages

```mdx
<ChatCard
  thread={{
    chat_id: 42,
    name: "Support",
    identifier: "support@example.com",
    messages: [
      {
        text: "I found the issue and am checking the fix now.",
        created_at: "2026-08-14T10:00:00-05:00",
        sender: "support",
        sender_name: "Support",
        is_from_me: false,
      },
      {
        text: "The fix is ready to test.",
        created_at: "2026-08-14T10:04:00-05:00",
        sender: "support",
        sender_name: "Support",
        is_from_me: false,
      },
      {
        text: "Thanks. I will test it now.",
        created_at: "2026-08-14T10:09:00-05:00",
        sender: "me",
        is_from_me: true,
      },
    ],
  }}
/>
```
