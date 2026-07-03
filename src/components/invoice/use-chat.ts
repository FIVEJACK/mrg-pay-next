"use client";

import { useCallback, useEffect, useState } from "react";

import { partnerBrowserApi, PartnerApiError } from "@/lib/partner-api/browser-client";
import { linkify } from "@/lib/linkify";

import { usePubNubChat, type ChatAttachment, type ChatMessage } from "./pubnub-chat";

export type { ChatAttachment, ChatMessage };

/** Reject attachments larger than this before attempting the upload. */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const SYSTEM_GREETING_TEXT =
  "Terima kasih telah berbelanja di Lapakgaming, selanjutnya kamu bisa bertanya melalui chat ini untuk mendapatkan link private server dan buat janji bertemu di dalam game untuk melakukan trading.";

function buildSystemGreeting(paidAt?: string | null): ChatMessage {
  return {
    id: "system-welcome",
    author: "system",
    text: SYSTEM_GREETING_TEXT,
    timestamp: `Pesan otomatis ${formatPaidTime(paidAt)}`,
    authoredByBuyer: false,
  };
}

export type UseChatArgs = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
  /** Transaction paid timestamp; stamps the auto-greeting bubble. */
  paidAt?: string | null;
};

/**
 * Live chat state + actions, shared by the desktop {@link ChatPanel} and the
 * mobile chat preview/sheet ({@link ChatSection}). Mounts the PubNub channel,
 * mints the chat token, and exposes the message list, draft, and send handler.
 */
export function useChat({ orderId, buyerId, sellerId, buyerName, paidAt }: UseChatArgs) {
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sellerLastActivity, setSellerLastActivity] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildSystemGreeting(paidAt)]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [attaching, setAttaching] = useState(false);

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

  const refreshChatToken = useCallback(async () => {
    const res = await partnerBrowserApi.authenticateChat();
    return res.token;
  }, []);

  // Seller presence for the chat header pill. Non-fatal: on failure the pill
  // just falls back to ">7 Hari Lalu".
  useEffect(() => {
    const controller = new AbortController();
    partnerBrowserApi
      .getSellerInfo(sellerId, { signal: controller.signal })
      .then((info) => setSellerLastActivity(info.last_activity_time ?? null))
      .catch(() => { });
    return () => controller.abort();
  }, [sellerId]);

  const handleIncoming = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      // De-dup by id: when we publish optimistically we tag the local bubble
      // with the same id the PubNub echo will carry, so the second arrival is
      // a no-op.
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const conversationId = `non_order_partnership_${orderId}_${buyerId}_${sellerId}`;
  const { ready, historyLoading, publish, sendFile, updateMetadata } = usePubNubChat({
    token,
    channel: conversationId,
    buyerId,
    onMessage: handleIncoming,
    refreshToken: refreshChatToken,
  });

  // Best-effort server postprocess hook. Fired after a successful publish so
  // the gateway can run notifications / moderation / indexing on the message.
  // A missing timetoken (SDK didn't surface one) skips the call — the endpoint
  // keys off it, so there's nothing useful to send.
  const postprocess = useCallback(
    (args: { text: string; files: string[]; timetoken: string }) => {
      if (!args.timetoken) return;
      partnerBrowserApi
        .postprocessMessage({
          text: args.text,
          files: args.files,
          chat_conversation_id: conversationId,
          user_id: buyerId,
          timetoken: args.timetoken,
        })
        .catch((err) => {
          console.warn("[chat] postprocess message failed:", err);
        });
    },
    [conversationId, buyerId],
  );

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSendError(null);
    setSending(true);
    setDraft("");
    // Convert URLs in the typed text to anchors; the body is rendered as
    // (sanitized) HTML on both ends.
    const html = linkify(text);
    // Optimistic echo so the buyer sees their message instantly — `publish`
    // assigns a matching id that we dedupe against when PubNub echoes back.
    const id = `msg-${Date.now()}`;
    handleIncoming({
      id,
      author: buyerName ?? "Saya",
      text: html,
      timestamp: formatNowTime(),
      authoredByBuyer: true,
    });
    try {
      const timetoken = await publish(html, id);
      // Best-effort stamp of the channel's last-message preview so the
      // seller-side inbox reflects this send. Not awaited: a failure here
      // must not roll back the already-published message.
      updateMetadata(text, false).catch((err) => {
        console.warn("[chat] channel metadata update failed:", err);
      });
      postprocess({ text, files: [], timetoken });
    } catch (err) {
      // Roll back the optimistic bubble on failure; restore the failed text
      // unless the user has already typed something new.
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDraft((cur) => cur || text);
      setSendError(err instanceof Error ? err.message : "Tidak dapat mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  async function handleSendFile(file: File) {
    if (!file || attaching) return;
    setSendError(null);
    if (!file.type.startsWith("image/")) {
      setSendError("Hanya gambar yang dapat dikirim.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setSendError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setAttaching(true);
    const id = `file-${Date.now()}`;
    // Show the picked image immediately via a local object URL; the live echo
    // carries the same `localId` in meta, so `handleIncoming` dedupes it
    // (keeping this preview). On reload, history supplies the hosted URL.
    const previewUrl = URL.createObjectURL(file);
    handleIncoming({
      id,
      author: buyerName ?? "Saya",
      text: "",
      timestamp: formatNowTime(),
      authoredByBuyer: true,
      attachment: { url: previewUrl, name: file.name, mimeType: file.type, isImage: true },
    });
    try {
      const timetoken = await sendFile(file, id);
      updateMetadata("", true).catch((err) => {
        console.warn("[chat] channel metadata update failed:", err);
      });
      postprocess({ text: "", files: [file.name], timetoken });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      URL.revokeObjectURL(previewUrl);
      setSendError(err instanceof Error ? err.message : "Tidak dapat mengirim gambar.");
    } finally {
      setAttaching(false);
    }
  }

  const chatConnected = !!token && ready;

  return {
    messages,
    draft,
    setDraft,
    sending,
    handleSend,
    attaching,
    handleSendFile,
    chatConnected,
    historyLoading,
    authError,
    sendError,
    sellerLastActivity,
  };
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatNowTime(): string {
  return formatClockTime(new Date());
}

function formatPaidTime(raw?: string | null): string {
  if (!raw) return "12:00";
  // The gateway returns "YYYY-MM-DD HH:mm:ss"; Safari needs the ISO "T" form.
  const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "12:00" : formatClockTime(d);
}
