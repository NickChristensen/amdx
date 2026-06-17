import type {
  HashtagEntity,
  Indices,
  MediaAnimatedGif,
  MediaDetails,
  MediaEntity,
  MediaVideo,
  QuotedTweet,
  SymbolEntity,
  Tweet,
  UrlEntity,
  UserMentionEntity,
} from "react-tweet/api";

type TextEntity = {
  indices: Indices;
  type: "text";
};

export type TweetEntity =
  | (TextEntity & { text: string })
  | (HashtagEntity & { type: "hashtag"; href: string; text: string })
  | (UserMentionEntity & { type: "mention"; href: string; text: string })
  | (UrlEntity & { type: "url"; href: string; text: string })
  | (MediaEntity & { type: "media"; href: string; text: string })
  | (SymbolEntity & { type: "symbol"; href: string; text: string });

export type EnrichedQuotedTweet = Omit<QuotedTweet, "entities"> & {
  url: string;
  entities: TweetEntity[];
};

export type EnrichedTweet = Omit<Tweet, "entities" | "quoted_tweet"> & {
  url: string;
  user: Tweet["user"] & {
    url: string;
    follow_url: string;
  };
  like_url: string;
  reply_url: string;
  in_reply_to_url?: string;
  entities: TweetEntity[];
  quoted_tweet?: EnrichedQuotedTweet;
};

const getTweetUrl = (tweet: { id_str: string; user: { screen_name: string } }) =>
  `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`;

const getUserUrl = (
  usernameOrTweet: string | { user: { screen_name: string } },
) =>
  `https://x.com/${
    typeof usernameOrTweet === "string"
      ? usernameOrTweet
      : usernameOrTweet.user.screen_name
  }`;

const getLikeUrl = (tweet: { id_str: string }) =>
  `https://x.com/intent/like?tweet_id=${tweet.id_str}`;

const getReplyUrl = (tweet: { id_str: string }) =>
  `https://x.com/intent/tweet?in_reply_to=${tweet.id_str}`;

const getFollowUrl = (tweet: { user: { screen_name: string } }) =>
  `https://x.com/intent/follow?screen_name=${tweet.user.screen_name}`;

const getHashtagUrl = (hashtag: { text: string }) =>
  `https://x.com/hashtag/${hashtag.text}`;

const getSymbolUrl = (symbol: { text: string }) =>
  `https://x.com/search?q=%24${symbol.text}`;

const getInReplyToUrl = (tweet: {
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
}) =>
  `https://x.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`;

function addEntities(
  result: TextEntity[],
  type: TweetEntity["type"],
  entities:
    | HashtagEntity[]
    | UserMentionEntity[]
    | UrlEntity[]
    | SymbolEntity[]
    | MediaEntity[],
) {
  for (const entity of entities) {
    for (const [index, item] of result.entries()) {
      if (
        item.indices[0] > entity.indices[0] ||
        item.indices[1] < entity.indices[1]
      ) {
        continue;
      }

      const items: TextEntity[] = [
        {
          indices: entity.indices,
          type: type === "media" ? "text" : "text",
        },
      ];

      if (item.indices[0] < entity.indices[0]) {
        items.unshift({
          indices: [item.indices[0], entity.indices[0]],
          type: "text",
        });
      }

      if (item.indices[1] > entity.indices[1]) {
        items.push({
          indices: [entity.indices[1], item.indices[1]],
          type: "text",
        });
      }

      result.splice(index, 1, ...items);
      break;
    }
  }
}

function fixRange(tweet: Tweet | QuotedTweet, entities: TextEntity[]) {
  const lastEntity = entities.at(-1);
  const tweetEntities = tweet.entities;

  if (tweetEntities?.media && lastEntity) {
    lastEntity.indices[1] = Math.min(
      lastEntity.indices[1],
      tweetEntities.media[0].indices[0],
    );
  }
}

function getEntities(tweet: Tweet | QuotedTweet): TweetEntity[] {
  const textMap = Array.from(tweet.text);
  const tweetEntities = tweet.entities;
  const result: TextEntity[] = [
    {
      indices: [0, textMap.length],
      type: "text",
    },
  ];

  const hashtags: HashtagEntity[] = tweetEntities?.hashtags ?? [];
  const userMentions: UserMentionEntity[] =
    tweetEntities?.user_mentions ?? [];
  const urls: UrlEntity[] = tweetEntities?.urls ?? [];
  const symbols: SymbolEntity[] = tweetEntities?.symbols ?? [];

  addEntities(result, "hashtag", hashtags);
  addEntities(result, "mention", userMentions);
  addEntities(result, "url", urls);
  addEntities(result, "symbol", symbols);

  if (tweetEntities?.media) {
    addEntities(result, "media", tweetEntities.media);
  }

  fixRange(tweet, result);

  return result.map((entity) => {
    const text = textMap.slice(entity.indices[0], entity.indices[1]).join("");

    const urlEntity = urls.find(
      (item) =>
        item.indices[0] === entity.indices[0] &&
        item.indices[1] === entity.indices[1],
    );

    if (urlEntity) {
      return {
        ...urlEntity,
        type: "url" as const,
        href: urlEntity.expanded_url,
        text: urlEntity.display_url,
      };
    }

    const mediaEntity = tweetEntities?.media?.find(
      (item) =>
        item.indices[0] === entity.indices[0] &&
        item.indices[1] === entity.indices[1],
    );

    if (mediaEntity) {
      return {
        ...mediaEntity,
        type: "media" as const,
        href: mediaEntity.expanded_url,
        text: mediaEntity.display_url,
      };
    }

    const hashtagEntity = hashtags.find(
      (item) =>
        item.indices[0] === entity.indices[0] &&
        item.indices[1] === entity.indices[1],
    );

    if (hashtagEntity) {
      return {
        ...hashtagEntity,
        type: "hashtag" as const,
        href: getHashtagUrl(hashtagEntity),
        text,
      };
    }

    const mentionEntity = userMentions.find(
      (item) =>
        item.indices[0] === entity.indices[0] &&
        item.indices[1] === entity.indices[1],
    );

    if (mentionEntity) {
      return {
        ...mentionEntity,
        type: "mention" as const,
        href: getUserUrl(mentionEntity.screen_name),
        text,
      };
    }

    const symbolEntity = symbols.find(
      (item) =>
        item.indices[0] === entity.indices[0] &&
        item.indices[1] === entity.indices[1],
    );

    if (symbolEntity) {
      return {
        ...symbolEntity,
        type: "symbol" as const,
        href: getSymbolUrl(symbolEntity),
        text,
      };
    }

    return {
      ...entity,
      text,
    };
  });
}

export const getMp4Videos = (media: MediaAnimatedGif | MediaVideo) => {
  return media.video_info.variants
    .filter((variant) => variant.content_type === "video/mp4")
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
};

export const getMp4Video = (media: MediaAnimatedGif | MediaVideo) => {
  const mp4Videos = getMp4Videos(media);
  return mp4Videos.length > 1 ? mp4Videos[1] : mp4Videos[0];
};

export const getMediaUrl = (
  media: MediaDetails,
  size: "small" | "medium" | "large",
) => {
  const url = new URL(media.media_url_https);
  const extension = url.pathname.split(".").pop();

  if (!extension) {
    return media.media_url_https;
  }

  url.pathname = url.pathname.replace(`.${extension}`, "");
  url.searchParams.set("format", extension);
  url.searchParams.set("name", size);

  return url.toString();
};

export const enrichTweet = (tweet: Tweet): EnrichedTweet => ({
  ...tweet,
  url: getTweetUrl(tweet),
  user: {
    ...tweet.user,
    url: getUserUrl(tweet),
    follow_url: getFollowUrl(tweet),
  },
  like_url: getLikeUrl(tweet),
  reply_url: getReplyUrl(tweet),
  in_reply_to_url: tweet.in_reply_to_screen_name
    ? getInReplyToUrl(tweet)
    : undefined,
  entities: getEntities(tweet),
  quoted_tweet: tweet.quoted_tweet
    ? {
        ...tweet.quoted_tweet,
        url: getTweetUrl(tweet.quoted_tweet),
        entities: getEntities(tweet.quoted_tweet),
      }
    : undefined,
});
