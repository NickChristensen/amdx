import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["video.twimg.com", "pbs.twimg.com"]);
const FORWARDED_HEADERS = [
  "accept-ranges",
  "content-length",
  "content-range",
  "content-type",
  "cache-control",
  "etag",
  "last-modified",
];

function getUpstreamUrl(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, method: "GET" | "HEAD") {
  const upstreamUrl = getUpstreamUrl(request);

  if (!upstreamUrl) {
    return new Response("Invalid or unsupported media URL", { status: 400 });
  }

  const headers = new Headers();
  const range = request.headers.get("range");

  if (range) {
    headers.set("range", range);
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers,
    redirect: "follow",
  });

  const responseHeaders = new Headers();

  for (const header of FORWARDED_HEADERS) {
    const value = upstreamResponse.headers.get(header);

    if (value) {
      responseHeaders.set(header, value);
    }
  }

  responseHeaders.set("access-control-allow-origin", "*");

  return new Response(method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxy(request, "GET");
}

export async function HEAD(request: NextRequest) {
  return proxy(request, "HEAD");
}
