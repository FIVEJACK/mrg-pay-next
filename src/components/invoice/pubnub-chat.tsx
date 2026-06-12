"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chat, type Channel, type Message } from "@pubnub/chat";

import { config } from "@/config/config";

export type ChatAttachment = {
  /** Download URL (PubNub-hosted, signed with the PAM auth token + uuid). */
  url: string;
  name: string;
  mimeType?: string;
  isImage: boolean;
};

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  authoredByBuyer: boolean;
  attachment?: ChatAttachment;
};

type UsePubNubChatOptions = {
  /** Chat token from POST /partner/v1/chat/authenticate. Null disables the client. */
  token: string | null;
  /** Channel id, e.g. `non_order_partnership_{order_id}_{buyer_id}_{seller_id}`. */
  channel: string;
  /** Buyer id; the PubNub user id is `buyer_{buyerId}`. */
  buyerId: string;
  onMessage: (msg: ChatMessage) => void;
  refreshToken?: () => Promise<string>;
};

type UsePubNubChatResult = {
  ready: boolean;
  /** True while `getHistory` is still pulling the channel's past messages. */
  historyLoading: boolean;
  /**
   * Publish a text message. `localId` is echoed back via the message `meta` so
   * an optimistic local bubble dedupes against the live broadcast loop-back.
   */
  publish: (text: string, localId?: string) => Promise<void>;
  /**
   * Upload + send an image as a PubNub file message via `Channel.sendText`.
   * `localId` rides in `meta` for the same optimistic dedupe as {@link publish}.
   */
  sendFile: (file: File, localId?: string) => Promise<void>;
};

/**
 * Live chat over the high-level `@pubnub/chat` SDK. Mounts a {@link Chat}
 * instance scoped to the buyer, resolves the {@link Channel}, streams live
 * messages, and replays history — exposing the same message list / send API the
 * UI consumed under the previous core-SDK implementation.
 */
export function usePubNubChat({
  token,
  channel,
  buyerId,
  onMessage,
  refreshToken,
}: UsePubNubChatOptions): UsePubNubChatResult {
  const chatRef = useRef<Chat | null>(null);
  const channelRef = useRef<Channel | null>(null);
  // Current PAM token; diverges from the `token` prop after an expiry refresh
  // (the prop deliberately stays put, see {@link refreshToken}). Signs file URLs.
  const tokenRef = useRef(token);
  const [ready, setReady] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userId = `buyer_${buyerId}`;

  // Keep refs to the latest callbacks so the connect listener / send retry (set
  // up once per channel) always call the current ones.
  const onMessageRef = useRef(onMessage);
  const refreshTokenRef = useRef(refreshToken);
  useLayoutEffect(() => {
    onMessageRef.current = onMessage;
    refreshTokenRef.current = refreshToken;
  });

  useEffect(() => {
    if (!token) return;
    if (!config.pubnub.subscribeKey) {
      console.warn(
        "[pubnub-chat] NEXT_PUBLIC_PUBNUB_SUB_KEY is not set — chat is disabled.",
      );
      return;
    }

    let cancelled = false;
    let disconnect: (() => void) | undefined;
    tokenRef.current = token;

    (async () => {
      setHistoryLoading(true);
      try {
        const chat = await Chat.init({
          publishKey: config.pubnub.publishKey,
          subscribeKey: config.pubnub.subscribeKey,
          userId,
          authKey: token,
        });
        // Authorize the PAM v3 (CBOR) token for live subscribe/publish — the
        // `authKey` init option alone doesn't always apply it to those ops.
        chat.sdk.setToken(token);
        if (cancelled) {
          chat.sdk.stop();
          return;
        }
        chatRef.current = chat;

        // Join the channel provisioned by the backend; never create it here.
        const ch = await chat.getChannel(channel);
        if (cancelled) return;
        if (!ch) {
          console.warn(`[pubnub-chat] channel ${channel} does not exist yet.`);
          return;
        }
        channelRef.current = ch;

        // Subscribe to live messages before replaying history so nothing
        // arriving mid-fetch is missed (dedupe in the store handles overlap).
        disconnect = ch.connect((message) => {
          const normalized = normalizeMessage(message, buyerId, tokenRef.current, userId);
          if (normalized) onMessageRef.current(normalized);
        });
        setReady(true);

        const history = await ch.getHistory({ count: 50 });
        if (cancelled) return;
        for (const message of history.messages) {
          const normalized = normalizeMessage(message, buyerId, tokenRef.current, userId);
          if (normalized) onMessageRef.current(normalized);
        }
      } catch (err) {
        if (!cancelled) console.warn("[pubnub-chat] init/connect failed:", err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      setReady(false);
      disconnect?.();
      chatRef.current?.sdk.stop();
      chatRef.current = null;
      channelRef.current = null;
    };
  }, [token, channel, buyerId, userId]);

  const sendWithReauth = useCallback(async (send: () => Promise<unknown>) => {
    try {
      await send();
    } catch (err) {
      const refresh = refreshTokenRef.current;
      if (!refresh || !chatRef.current || !isPubNubAccessDenied(err)) throw err;
      const fresh = await refresh();
      tokenRef.current = fresh;
      chatRef.current.sdk.setToken(fresh);
      await send();
    }
  }, []);

  const publish = useCallback(
    async (text: string, localId?: string) => {
      const ch = channelRef.current;
      if (!ch) throw new Error("Chat is not connected yet.");
      await sendWithReauth(() =>
        ch.sendText(text, localId ? { meta: { localId } } : undefined),
      );
    },
    [sendWithReauth],
  );

  const sendFile = useCallback(
    async (file: File, localId?: string) => {
      const ch = channelRef.current;
      if (!ch) throw new Error("Chat is not connected yet.");
      await sendWithReauth(() =>
        ch.sendText("", {
          files: [file],
          ...(localId ? { meta: { localId } } : {}),
        }),
      );
    },
    [sendWithReauth],
  );

  return { ready, historyLoading, publish, sendFile };
}

function isPubNubAccessDenied(err: unknown): boolean {
  const e = err as {
    status?: { category?: string };
    cause?: { status?: { category?: string } };
  };
  return (e?.status?.category ?? e?.cause?.status?.category) === "PNAccessDeniedCategory";
}

function normalizeMessage(
  message: Message,
  buyerId: string,
  token: string | null,
  userId: string,
): ChatMessage | null {
  if (message.deleted) return null;

  const file = message.files?.[0];
  const attachment = file
    ? {
        url: signFileUrl(file.url, token, userId),
        name: file.name,
        mimeType: file.type,
        isImage: isImageFile(file.name, file.type),
      }
    : undefined;

  const text = message.text ?? "";
  if (!text && !attachment) return null;

  // Live echoes carry our optimistic `localId` in meta so they dedupe against
  // the local bubble; history messages have no meta, so fall back to timetoken.
  const localId = (message.meta as { localId?: string } | undefined)?.localId;

  return {
    id: localId ?? message.timetoken,
    author: message.userId || "Penjual",
    text,
    timestamp: tokenToTime(message.timetoken),
    authoredByBuyer: message.userId === userId || message.userId === buyerId,
    attachment,
  };
}

// PubNub file URLs are gated by Access Manager; the same auth token + UUID must
// be appended as query params before the browser can load the file.
function signFileUrl(url: string, token: string | null, userId: string): string {
  if (!token) return url;
  try {
    const signed = new URL(url);
    signed.searchParams.set("auth", token);
    signed.searchParams.set("uuid", userId);
    return signed.toString();
  } catch {
    return url;
  }
}

function isImageFile(name: string, mimeType?: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(name);
}

function tokenToTime(timetoken: string | number): string {
  // PubNub timetokens are nanoseconds since epoch.
  const ms = Number(timetoken) / 1e4;
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
