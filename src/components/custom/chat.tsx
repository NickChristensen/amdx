import {
  Card,
  CardContent,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  /** Message body shown inside the bubble. */
  text: string;

  /** ISO 8601 message timestamp; messages are sorted by it and the final cluster time is shown. */
  created_at: string;

  /** Source sender or conversation address used to group adjacent messages with the same direction; with imsg it is not always the author. */
  sender?: string;

  /** Contact display name for an incoming message, shown above the cluster when it differs from the thread name. */
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
    "Displays an iMessage-style conversation thread with chronologically sorted, direction-aware message bubbles and sender/time context.",
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

function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <p
      className={cn(
        "max-w-8/10 px-3 py-2 text-sm leading-snug rounded-2xl",
        message.is_from_me
          ? "bg-primary text-primary-foreground rounded-br-xs"
          : "bg-muted text-foreground rounded-bl-xs",
      )}
    >
      {message.text}
    </p>
  );
}

function MessageCluster({
  messages,
  threadName,
}: {
  messages: ChatMessage[];
  threadName: string;
}) {
  const lastMessage = messages.at(-1);
  const metaClasses = "text-xs text-muted-foreground";

  if (!lastMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        lastMessage.is_from_me ? "items-end" : "items-start",
      )}
    >
      {!lastMessage.is_from_me && lastMessage.sender_name !== threadName && (
        <p className={metaClasses}>{lastMessage.sender_name}</p>
      )}
      {messages.map((message, index) => (
        <MessageBubble
          key={`${message.created_at}-${index}`}
          message={message}
        />
      ))}
      <p className={metaClasses}>
        {new Date(lastMessage.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

export function ChatCard(props: ChatCardProps) {
  const messages = [...props.thread.messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const messagesGroupedByAdjacentSenderAndDirection = messages.reduce(
    (acc: ChatMessage[][], message) => {
      if (acc.length === 0) {
        return [[message]];
      }

      const lastGroup = acc[acc.length - 1];
      const lastMessage = lastGroup[lastGroup.length - 1];

      if (
        lastMessage.sender === message.sender &&
        lastMessage.is_from_me === message.is_from_me
      ) {
        lastGroup.push(message);
        return acc;
      }

      return [...acc, [message]];
    },
    [],
  );

  const displayThreadName =
    props.thread.name ||
    Array.from(
      new Set(
        props.thread.messages
          .map((message) => message.sender_name)
          .filter(Boolean),
      ),
    ).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayThreadName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {messagesGroupedByAdjacentSenderAndDirection.map((group) => (
          <MessageCluster
            key={group[0].created_at}
            messages={group}
            threadName={props.thread.name}
          />
        ))}
      </CardContent>
    </Card>
  );
}
