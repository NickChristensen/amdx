import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

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

export type ChatCardProps = {
  /** Conversation object, typically a thread from sitrep's new_messages output, to display as grouped bubbles. */
  thread: ChatThread;
};

export const chatCardMdxDocs = {
  description:
    "Renders one message thread as sorted, direction-aware chat bubbles with sender and time context. Use when the exact conversation or exchange supports the report.",
  flow: "block",
  defaults: {},
  guidance: [
    "Pass sitrep or imsg message records through with created_at as ISO 8601; the card sorts them chronologically.",
    "Use is_from_me as the direction flag: true places a message on the right, while false places it on the left; adjacent messages cluster only when sender and is_from_me both match.",
    "For imsg data, preserve sender and sender_name for contact/address context but do not infer authorship from sender; outgoing records can still contain the other party's address.",
  ],
  examples: [
    {
      title: "Basic conversation",
      mdx: `<ChatCard
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
/>`,
    },
    {
      title: "Conversation with grouped messages",
      mdx: `<ChatCard
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
/>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<ChatCardProps>;

type MessageGroup = [ChatMessage, ...ChatMessage[]];

function MessageCluster({
  messages,
  threadName,
}: {
  messages: MessageGroup;
  threadName: string;
}) {
  const lastMessage = messages[messages.length - 1];
  const senderLabel =
    !lastMessage.is_from_me &&
    lastMessage.sender_name &&
    lastMessage.sender_name !== threadName
      ? `${lastMessage.sender_name} · `
      : "";

  return (
    <BubbleGroup className="gap-1">
      {messages.map((message, index) => (
        <Bubble
          key={`${message.created_at}-${index}`}
          align={message.is_from_me ? "end" : "start"}
          variant={message.is_from_me ? "default" : "secondary"}
        >
          <BubbleContent>{message.text}</BubbleContent>
        </Bubble>
      ))}
      <p
        className={cn(
          "text-xs text-muted-foreground px-1",
          lastMessage.is_from_me && "text-right",
        )}
      >
        {senderLabel}
        {new Date(lastMessage.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </BubbleGroup>
  );
}

export function ChatCard({ thread }: ChatCardProps) {
  const { messages: threadMessages, name: threadName } = thread;
  const messages = threadMessages.toSorted(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const messageGroups = messages.reduce<MessageGroup[]>((groups, message) => {
    const previousGroup = groups.at(-1);
    const previousMessage = previousGroup?.at(-1);

    if (
      previousGroup &&
      previousMessage &&
      previousMessage.sender === message.sender &&
      previousMessage.is_from_me === message.is_from_me
    ) {
      previousGroup.push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

  const displayThreadName =
    threadName ||
    Array.from(
      new Set(
        threadMessages.map((message) => message.sender_name).filter(Boolean),
      ),
    ).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayThreadName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {messageGroups.map((group, index) => (
          <MessageCluster
            key={`${group[0].created_at}-${index}`}
            messages={group}
            threadName={threadName}
          />
        ))}
      </CardContent>
    </Card>
  );
}
