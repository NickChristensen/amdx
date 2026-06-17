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
import { Skeleton } from "@/components/ui/skeleton";
import { enrichTweet, type EnrichedTweet } from "@/lib/tweet-enrich";
import { cn } from "@/lib/utils";

type TweetProps = {
  id: string;
};

const getTweetMediaProxyUrl = (url: string) =>
  `/api/tweet-media?url=${encodeURIComponent(url)}`;

type RenderableTweet =
  | EnrichedTweet
  | NonNullable<EnrichedTweet["quoted_tweet"]>;

const getTweetUserUrl = (tweet: RenderableTweet) =>
  "url" in tweet.user
    ? tweet.user.url
    : `https://x.com/${tweet.user.screen_name}`;

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};

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
  <div
    className={cn("flex size-full flex-col gap-1", className)}
    {...props}
  >
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

export const TweetHeader = ({
  tweet,
  showShareLink = true,
}: {
  tweet: RenderableTweet;
  showShareLink?: boolean;
}) => (
  <div className="flex flex-row items-start justify-between tracking-normal">
    <div className="flex items-center space-x-3">
      <a
        href={getTweetUserUrl(tweet)}
        target="_blank"
        rel="noreferrer"
        className="shrink-0"
      >
        <Avatar size="lg">
          <AvatarImage
            src={tweet.user.profile_image_url_https}
            alt={tweet.user.screen_name}
          />
        </Avatar>
      </a>
      <div className="flex flex-col">
        <a
          href={getTweetUserUrl(tweet)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center whitespace-nowrap font-medium text-foreground transition-opacity hover:opacity-80"
        >
          {truncate(tweet.user.name, 20)}
        </a>
        <div className="flex items-center space-x-1">
          <a
            href={getTweetUserUrl(tweet)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            @{truncate(tweet.user.screen_name, 16)}
          </a>
        </div>
      </div>
    </div>
    {showShareLink && (
      <a href={tweet.url} target="_blank" rel="noreferrer">
        <span className="sr-only">Link to tweet</span>
        <ExternalLink className="text-muted-foreground hover:text-foreground size-4 items-start transition-all ease-in-out hover:scale-105" />
      </a>
    )}
  </div>
);

export const TweetCardHeader = ({ tweet }: { tweet: RenderableTweet }) => (
  <CardHeader>
    <div className="flex items-center gap-3 tracking-normal">
      <a
        href={getTweetUserUrl(tweet)}
        target="_blank"
        rel="noreferrer"
        className="shrink-0"
      >
        <Avatar size="lg">
          <AvatarImage
            src={tweet.user.profile_image_url_https}
            alt={tweet.user.screen_name}
          />
        </Avatar>
      </a>
      <div className="flex min-w-0 flex-col">
        <a
          href={getTweetUserUrl(tweet)}
          target="_blank"
          rel="noreferrer"
          className="truncate font-medium text-foreground transition-opacity hover:opacity-80"
        >
          {truncate(tweet.user.name, 20)}
        </a>
        <a
          href={getTweetUserUrl(tweet)}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          @{truncate(tweet.user.screen_name, 16)}
        </a>
      </div>
    </div>
    <CardAction>
      <a
        href={tweet.url}
        target="_blank"
        rel="noreferrer"
      >
        <span className="sr-only">Link to tweet</span>
        <ExternalLink
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-all ease-in-out hover:scale-105 hover:text-foreground"
        />
      </a>
    </CardAction>
  </CardHeader>
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
              className="text-primary underline-offset-4 hover:underline"
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
      className={cn("relative flex w-full flex-col gap-4", className)}
      {...props}
    >
      <TweetBody tweet={enrichedTweet} />
      <TweetMedia tweet={enrichedTweet} />
      {enrichedTweet.quoted_tweet && (
        <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-xl border p-4">
          <TweetHeader
            tweet={enrichedTweet.quoted_tweet}
            showShareLink={false}
          />
          <TweetBody tweet={enrichedTweet.quoted_tweet} />
          <TweetMedia tweet={enrichedTweet.quoted_tweet} />
        </div>
      )}
    </CardContent>
  );
};

export function Tweet(props: TweetProps) {
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

  return (
    <Card>
      <TweetCardHeader tweet={enrichTweet(result.tweet)} />
      <TweetCardContent tweet={result.tweet} />
    </Card>
  );
}
