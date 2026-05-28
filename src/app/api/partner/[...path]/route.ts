import type { NextRequest } from "next/server";

import { config } from "@/config/config";

// Proxy: forwards GET/POST to the partner API gateway, so the browser can talk
// to it without CORS. Forwards `x-api-key`, `Authorization`, and `Cookie`
// (needed for the httpOnly `itemku:partner-jwt-access-token` JWT).
async function forward(
  req: NextRequest,
  path: string[],
  init: { method: "GET" | "POST"; body?: string },
) {
  const upstream = new URL(`/partner/${path.join("/")}`, config.partnerApiBaseUrl);
  for (const [k, v] of req.nextUrl.searchParams) upstream.searchParams.append(k, v);

  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) headers["x-api-key"] = apiKey;
  const authz = req.headers.get("authorization");
  if (authz) headers["Authorization"] = authz;
  const cookie = req.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(upstream, {
      method: init.method,
      headers,
      body: init.body,
      cache: "no-store",
    });
    const body = await res.text();
    const responseHeaders = new Headers({
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    });
    // Forward each Set-Cookie individually so multiple cookies survive.
    // `Headers.get("set-cookie")` joins them with a comma, which corrupts
    // cookie attributes — `getSetCookie` (Node 19+) preserves the array.
    for (const c of res.headers.getSetCookie?.() ?? []) {
      responseHeaders.append("set-cookie", c);
    }
    return new Response(body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        statusCode: "upstreamUnreachable",
        message: String((err as Error)?.message ?? err),
        data: {},
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return forward(req, path, { method: "GET" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const body = await req.text();
  return forward(req, path, { method: "POST", body });
}
