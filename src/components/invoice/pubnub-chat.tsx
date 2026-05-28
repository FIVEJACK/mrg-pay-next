"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PubNub from "pubnub";

import { config } from "@/config/config";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  authoredByBuyer: boolean;
};

type UsePubNubChatOptions = {
  /** Chat token from POST /partner/v1/chat/authenticate. Null disables the client. */
  token: string | null;
  /** Channel name, e.g. `non_order_partner_{order_id}`. */
  channel: string;
  /** Stable identifier used as PubNub `userId`. */
  buyerId: string;
  /** Friendly display name attached to outgoing payloads. */
  buyerName?: string;
  onMessage: (msg: ChatMessage) => void;
};

type UsePubNubChatResult = {
  ready: boolean;
  /** True while `fetchMessages` is still pulling the channel's history. */
  historyLoading: boolean;
  /**
   * Publish a message. Caller may pass a pre-computed `id` so an optimistic
   * local bubble dedupes against the PubNub broadcast loop-back.
   */
  publish: (text: string, id?: string) => Promise<void>;
};

export function usePubNubChat({
  token,
  channel,
  buyerId,
  buyerName,
  onMessage,
}: UsePubNubChatOptions): UsePubNubChatResult {
  const clientRef = useRef<PubNub | null>(null);
  const [ready, setReady] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Keep a ref to the latest onMessage so the subscribe listener (set up
  // once per channel) always calls the current callback. Updating inside
  // useLayoutEffect avoids the React 19 "Cannot update ref during render"
  // error while still running before any user-facing event.
  const onMessageRef = useRef(onMessage);
  useLayoutEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!token) return;
    if (!config.pubnub.subscribeKey) {
      console.warn(
        "[pubnub-chat] NEXT_PUBLIC_PUBNUB_SUB_KEY is not set — chat is disabled.",
      );
      return;
    }

    const client = new PubNub({
      publishKey: config.pubnub.publishKey,
      subscribeKey: config.pubnub.subscribeKey,
      userId: `buyer_${buyerId}`,
    });
    // Apply the PAM v3 token via setToken — the legacy `authKey` init option
    // doesn't authorize v3 (CBOR) tokens, so publishes silently get rejected
    // and the message never reaches the channel.
    client.setToken(token);
    clientRef.current = client;

    const listener: PubNub.Listener = {
      message: (event) => {
        const incoming = normalizeMessage(event, buyerId);
        if (incoming) onMessageRef.current(incoming);
      },
      status: (event) => {
        if (event.category === "PNConnectedCategory") {
          setReady(true);
          return;
        }
        if (
          event.category === "PNAccessDeniedCategory" ||
          event.category === "PNBadRequestCategory" ||
          event.category === "PNNetworkIssuesCategory"
        ) {
          // Surface auth/network failures instead of letting publish pretend it
          // worked. The hook keeps `ready=false` so the composer stays gated.
          console.warn(
            `[pubnub-chat] subscribe failed: ${event.category}`,
            (event as { errorData?: unknown }).errorData,
          );
          setReady(false);
        }
      },
    };
    client.addListener(listener);
    client.subscribe({ channels: [channel] });

    // Pull past messages from storage so the buyer sees their thread after a
    // reload. Subscribe only delivers live messages from the moment of
    // connection onward, so this is the only way to repopulate history.
    let historyCancelled = false;
    setHistoryLoading(true);
    client
      .fetchMessages({ channels: [channel], count: 50 })
      .then((res) => {
        if (historyCancelled) return;
        const items = res?.channels?.[channel] ?? [];
        for (const item of items) {
          const normalized = normalizeFetchedMessage(item, buyerId);
          if (normalized) onMessageRef.current(normalized);
        }
      })
      .catch((err: unknown) => {
        console.warn("[pubnub-chat] fetchMessages failed:", err);
      })
      .finally(() => {
        if (!historyCancelled) setHistoryLoading(false);
      });

    return () => {
      historyCancelled = true;
      setReady(false);
      client.removeListener(listener);
      client.unsubscribe({ channels: [channel] });
      client.stop();
      clientRef.current = null;
    };
  }, [token, channel, buyerId]);

  const publish = useCallback(
    async (text: string, id?: string) => {
      const client = clientRef.current;
      if (!client) throw new Error("Chat is not connected yet.");
      const res = await client.publish({
        channel,
        message: {
          id: id ?? `msg-${Date.now()}`,
          text,
          author: buyerName ?? "Buyer",
          user_id: buyerId,
          timestamp: new Date().toISOString(),
        },
        // Persist so the seller / a later connector can read the message via
        // history. Default depends on the keyset; force it on to be safe.
        storeInHistory: true,
      });
      // PubNub publish resolves even on error responses (the promise carries
      // `error: true`). Inspect explicitly so failures actually surface.
      if ((res as { error?: boolean }).error) {
        const err =
          (res as { errorData?: { message?: string } }).errorData?.message ??
          "Publish rejected by PubNub.";
        throw new Error(err);
      }
    },
    [channel, buyerId, buyerName],
  );

  return { ready, historyLoading, publish };
}

type FetchedItem = {
  message?: unknown;
  timetoken?: string | number;
  uuid?: string;
};

/**
 * Adapter from a `fetchMessages` history item to the same shape
 * `normalizeMessage` consumes — lets us reuse the parsing logic for live and
 * history messages.
 */
function normalizeFetchedMessage(item: FetchedItem, buyerId: string): ChatMessage | null {
  if (!item || item.message == null) return null;
  return normalizeMessage(
    {
      channel: "",
      subscription: null,
      timetoken: item.timetoken ?? "",
      publisher: item.uuid ?? "",
      message: item.message,
    } as unknown as PubNub.Subscription.Message,
    buyerId,
  );
}

function normalizeMessage(
  event: PubNub.Subscription.Message,
  buyerId: string,
): ChatMessage | null {
  const m = event.message as
    | { id?: string; text?: string; author?: string; user_id?: string; timestamp?: string }
    | string
    | undefined;
  if (!m) return null;

  if (typeof m === "string") {
    return {
      id: String(event.timetoken),
      author: event.publisher ?? "Penjual",
      text: m,
      timestamp: tokenToTime(event.timetoken),
      authoredByBuyer: event.publisher === buyerId,
    };
  }

  const text = m.text ?? "";
  if (!text) return null;
  return {
    id: m.id ?? String(event.timetoken),
    author: m.author ?? event.publisher ?? "Penjual",
    text,
    timestamp: m.timestamp ? formatIsoTime(m.timestamp) : tokenToTime(event.timetoken),
    authoredByBuyer: (m.user_id ?? event.publisher) === buyerId,
  };
}

function tokenToTime(timetoken: string | number): string {
  // PubNub timetokens are nanoseconds since epoch.
  const ms = Number(timetoken) / 1e4;
  return formatMs(ms);
}

function formatIsoTime(iso: string): string {
  return formatMs(new Date(iso).getTime());
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
