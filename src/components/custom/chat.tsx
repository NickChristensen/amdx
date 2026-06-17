import { cn } from "@/lib/utils";

type ChatMessage = {
  text: string;
  created_at: string;
  sender?: string;
  sender_name?: string;
  is_from_me: boolean;
};

type ChatProps = {
  thread: {
    chat_id?: number;
    name: string;
    identifier?: string;
    messages: ChatMessage[];
  };
};

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
      {messages.map((message) => (
        <MessageBubble key={message.created_at} message={message} />
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

export function Chat(props: ChatProps) {
  const messages = [...props.thread.messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const messagesGroupedByAdjacentSender = messages.reduce(
    (acc: ChatMessage[][], message) => {
      if (acc.length === 0) {
        return [[message]];
      }

      const lastGroup = acc[acc.length - 1];
      const lastMessage = lastGroup[lastGroup.length - 1];

      if (lastMessage.sender === message.sender) {
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
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-center">
        {displayThreadName}
      </h3>
      {messagesGroupedByAdjacentSender.map((group) => (
        <MessageCluster
          key={group[0].created_at}
          messages={group}
          threadName={props.thread.name}
        />
      ))}
    </div>
  );
}
