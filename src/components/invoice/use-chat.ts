"use client";

import { useCallback, useEffect, useState } from "react";

import { partnerBrowserApi, PartnerApiError } from "@/lib/partner-api/browser-client";

import { usePubNubChat, type ChatMessage } from "./pubnub-chat";

export type { ChatMessage };

export const SYSTEM_GREETING: ChatMessage = {
  id: "system-welcome",
  author: "system",
  text:
    "Terima kasih telah berbelanja di Lapakgaming, selanjutnya kamu bisa bertanya melalui chat ini untuk mendapatkan link private server dan buat janji bertemu di dalam game untuk melakukan trading.",
  timestamp: "Pesan otomatis 12:00",
  authoredByBuyer: false,
};

export type UseChatArgs = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
};

/**
 * Live chat state + actions, shared by the desktop {@link ChatPanel} and the
 * mobile chat preview/sheet ({@link ChatSection}). Mounts the PubNub channel,
 * mints the chat token, and exposes the message list, draft, and send handler.
 */
export function useChat({ orderId, buyerId, sellerId, buyerName }: UseChatArgs) {
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    partnerBrowserApi
      .authenticateChat({ signal: controller.signal })
      .then((res) => setToken(res.token))
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        const msg =
          err instanceof PartnerApiError ? err.message : "Tidak dapat memulai chat.";
        setAuthError(msg);
      });
    return () => controller.abort();
  }, []);

  const handleIncoming = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      // De-dup by id: when we publish optimistically we tag the local bubble
      // with the same id the PubNub echo will carry, so the second arrival is
      // a no-op.
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { ready, historyLoading, publish } = usePubNubChat({
    token,
    channel: `non_order_partnership_${orderId}_${buyerId}_${sellerId}`,
    buyerId,
    buyerName,
    onMessage: handleIncoming,
  });

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setSendError(null);
    setSending(true);
    setDraft("");
    // Optimistic echo so the buyer sees their message instantly — `publish`
    // assigns a matching id that we dedupe against when PubNub echoes back.
    const id = `msg-${Date.now()}`;
    handleIncoming({
      id,
      author: buyerName ?? "Saya",
      text,
      timestamp: formatNowTime(),
      authoredByBuyer: true,
    });
    try {
      await publish(text, id);
    } catch (err) {
      // Roll back the optimistic bubble on failure.
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDraft(text);
      setSendError(err instanceof Error ? err.message : "Tidak dapat mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  const chatConnected = !!token && ready;

  return {
    messages,
    draft,
    setDraft,
    sending,
    handleSend,
    chatConnected,
    historyLoading,
    authError,
    sendError,
  };
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
