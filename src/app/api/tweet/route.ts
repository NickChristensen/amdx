import { getTweet } from "react-tweet/api";
import { NextRequest } from "next/server";

function getTweetId(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id || !/^\d+$/.test(id)) {
    return null;
  }

  return id;
}

export async function GET(request: NextRequest) {
  const id = getTweetId(request);

  if (!id) {
    return Response.json({ error: "Invalid tweet id" }, { status: 400 });
  }

  try {
    const tweet = await getTweet(id);

    if (!tweet) {
      return Response.json({ error: "Tweet not found" }, { status: 404 });
    }

    return Response.json(tweet, {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch tweet", { id, error });
    return Response.json({ error: "Failed to fetch tweet" }, { status: 502 });
  }
}
