"use client";

import { useEffect, useState } from "react";
import type { Tweet as ReactTweet } from "react-tweet/api";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { textLinkClasses } from "@/components/ui/link-utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { enrichTweet, type EnrichedTweet } from "@/lib/tweet-enrich";
import { cn } from "@/lib/utils";

export type TweetCardProps = {
  /** Numeric X/Twitter post ID as a string; use the value from the post URL's `/status/<id>` segment. */
  id: string;
};

export const tweetCardMdxDocs = {
  description:
    "Fetches and displays an X/Twitter post with its author, text, links, and available media in a card.",
  flow: "block",
  defaults: {},
  guidance: [
    "Pass only the numeric post ID as a string, not the full URL or an @handle; the card fetches the post at runtime.",
    "The card handles loading, unavailable, quoted-post, link, photo, and video states from the fetched post data.",
  ],
  examples: [
    {
      title: "Basic tweet card",
      mdx: '<TweetCard id="1920343354073846004" />',
    },
  ],
} as const satisfies AgentMdxComponentDocs<TweetCardProps>;

const getTweetMediaProxyUrl = (url: string) =>
  `/api/tweet-media?url=${encodeURIComponent(url)}`;

type RenderableTweet =
  | EnrichedTweet
  | NonNullable<EnrichedTweet["quoted_tweet"]>;

const getTweetUserUrl = (tweet: RenderableTweet) =>
  "url" in tweet.user
    ? tweet.user.url
    : `https://x.com/${tweet.user.screen_name}`;

export const TweetSkeleton = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    className={cn(
      "relative flex w-full flex-col gap-4 overflow-hidden",
      className,
    )}
    {...props}
  >
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-48 w-full" />
  </div>
);

export const TweetSkeletonHeader = () => (
  <CardHeader>
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <CardAction>
      <Skeleton className="size-4" />
    </CardAction>
  </CardHeader>
);

export const TweetNotFound = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div className={cn("flex size-full flex-col gap-1", className)} {...props}>
    <p className="text-sm font-medium">Tweet not found</p>
    <p className="text-sm text-muted-foreground">
      The tweet could not be loaded.
    </p>
  </div>
);

export const TweetErrorHeader = () => (
  <CardHeader>
    <div className="flex items-center gap-3">
      <Avatar size="lg" />
      <div className="flex min-w-0 flex-col">
        <p className="font-medium text-foreground">Tweet unavailable</p>
        <p className="text-sm text-muted-foreground">Unable to load tweet</p>
      </div>
    </div>
  </CardHeader>
);

export const TweetHeader = ({ tweet }: { tweet: RenderableTweet }) => (
  <div className="flex items-center gap-3 tracking-normal">
    <a
      href={getTweetUserUrl(tweet)}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-3 text-sm transition-opacity hover:opacity-75 focus-visible:opacity-75"
    >
      <Avatar size="lg">
        <AvatarImage
          src={tweet.user.profile_image_url_https}
          alt={tweet.user.screen_name}
        />
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-foreground">
          {tweet.user.name}
        </span>
        <span className="truncate text-muted-foreground">
          @{tweet.user.screen_name}
        </span>
      </div>
    </a>
  </div>
);

export const TweetBody = ({ tweet }: { tweet: RenderableTweet }) => (
  <div className="wrap-break-word text-sm">
    {tweet.entities.map((entity, idx) => {
      switch (entity.type) {
        case "url":
        case "symbol":
        case "hashtag":
        case "mention":
          return (
            <a
              key={idx}
              href={entity.href}
              target="_blank"
              rel="noopener noreferrer"
              className={textLinkClasses}
            >
              {entity.text}
            </a>
          );
        case "text":
          return (
            <span
              key={idx}
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: entity.text }}
            />
          );
        default:
          return null;
      }
    })}
  </div>
);

export const TweetMedia = ({ tweet }: { tweet: RenderableTweet }) => {
  const video = "video" in tweet ? tweet.video : undefined;
  const photos = "photos" in tweet ? tweet.photos : undefined;

  if (!video && !photos) return null;

  return (
    <div className="flex flex-1 items-stretch justify-center gap-2">
      {video && (
        <video
          poster={video.poster}
          controls
          className="max-w-full h-full rounded-xl border object-cover object-top"
        >
          {video.variants.reverse().map((variant, idx) => (
            <source
              key={idx}
              src={getTweetMediaProxyUrl(variant.src)}
              type={variant.type}
            />
          ))}
          Your browser does not support the video tag.
        </video>
      )}
      {photos &&
        photos.map((photo) => (
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            key={photo.url}
            className="block"
          >
            <Image
              src={photo.url}
              width={photo.width}
              height={photo.height}
              alt=""
              unoptimized
              className="max-w-full max-h-96 h-full object-cover object-top rounded-xl border"
            />
          </a>
        ))}
    </div>
  );
};

export const TweetCardContent = ({
  tweet,
  className,
  ...props
}: {
  tweet: ReactTweet;
  className?: string;
}) => {
  const enrichedTweet = enrichTweet(tweet);
  return (
    <CardContent
      className={cn("flex w-full flex-col gap-4", className)}
      {...props}
    >
      <TweetBody tweet={enrichedTweet} />
      <TweetMedia tweet={enrichedTweet} />
      {enrichedTweet.quoted_tweet && (
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <TweetHeader tweet={enrichedTweet.quoted_tweet} />
          </CardHeader>
          <CardContent>
            <TweetBody tweet={enrichedTweet.quoted_tweet} />
            <TweetMedia tweet={enrichedTweet.quoted_tweet} />
          </CardContent>
        </Card>
      )}
    </CardContent>
  );
};

export function TweetCard(props: TweetCardProps) {
  const [result, setResult] = useState<{
    id: string | null;
    tweet: ReactTweet | null;
  }>({
    id: null,
    tweet: null,
  });

  useEffect(() => {
    let isActive = true;

    const fetchTweet = async () => {
      const response = await fetch(
        `/api/tweet?id=${encodeURIComponent(props.id)}`,
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch tweet: ${response.status}`);
      }

      return (await response.json()) as ReactTweet;
    };

    fetchTweet()
      .then((result) => {
        if (!isActive) return;
        setResult({ id: props.id, tweet: result ?? null });
      })
      .catch((err) => {
        if (!isActive) return;
        console.error(err);
        setResult({ id: props.id, tweet: null });
      });

    return () => {
      isActive = false;
    };
  }, [props.id]);

  if (result.id !== props.id) {
    return (
      <Card>
        <TweetSkeletonHeader />
        <CardContent>
          <TweetSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!result.tweet) {
    return (
      <Card>
        <TweetErrorHeader />
        <CardContent>
          <TweetNotFound />
        </CardContent>
      </Card>
    );
  }

  const enrichedTweet = enrichTweet(result.tweet);

  return (
    <Card>
      <CardHeader>
        <TweetHeader tweet={enrichedTweet} />
        <CardAction>
          <a href={enrichedTweet.url} target="_blank" rel="noreferrer">
            <span className="sr-only">Link to tweet</span>
            <ExternalLink
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform transition-color hover:scale-105 hover:text-foreground"
            />
          </a>
        </CardAction>
      </CardHeader>
      <TweetCardContent tweet={result.tweet} />
    </Card>
  );
}
