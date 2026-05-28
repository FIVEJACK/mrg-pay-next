"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DotsIcon, PaperclipIcon, SendIcon } from "@/components/icon";
import { formatLastActivity, isRecentActivity } from "@/lib/format-activity";
import { partnerBrowserApi, PartnerApiError } from "@/lib/partner-api/browser-client";

import { usePubNubChat, type ChatMessage } from "./pubnub-chat";

const SYSTEM_GREETING: ChatMessage = {
  id: "system-welcome",
  author: "system",
  text:
    "Terima kasih telah berbelanja di Lapakgaming, selanjutnya kamu bisa bertanya melalui chat ini untuk mendapatkan link private server dan buat janji bertemu di dalam game untuk melakukan trading.",
  timestamp: "Pesan otomatis 12:00",
  authoredByBuyer: false,
};

type ChatPanelProps = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
};

export function ChatPanel({ orderId, buyerId, sellerId, buyerName }: ChatPanelProps) {
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const [lastActivityTime, setLastActivityTime] = useState<string | null>(null);
  // Tick re-renders the relative-time pill so it stays current as time passes.
  const [now, setNow] = useState(() => new Date());

  // Auto-scroll the messages container to the latest bubble whenever messages
  // change (history load, live receive, or local send all push into the same
  // `messages` array).
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

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

  // Fetch the seller's profile so the status pill can show "Aktif X lalu".
  useEffect(() => {
    const controller = new AbortController();
    partnerBrowserApi
      .getSellerInfo(sellerId, { signal: controller.signal })
      .then((info) => setLastActivityTime(info?.last_activity_time ?? null))
      .catch(() => {
        // Non-fatal — the pill falls back to "Terakhir online udah lama banget".
      });
    return () => controller.abort();
  }, [sellerId]);

  // Keep the relative-time text fresh. 30s is granular enough for the
  // "detik/menit/jam" buckets without burning cycles.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activityText = formatLastActivity(lastActivityTime, now);
  const sellerOnline = isRecentActivity(lastActivityTime, now);

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
      setSendError(
        err instanceof Error ? err.message : "Tidak dapat mengirim pesan.",
      );
    } finally {
      setSending(false);
    }
  }

  const chatConnected = !!token && ready;

  return (
    <section className="flex w-full flex-col rounded-2xl border border-(--color-border-low) bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-(--color-border-low) px-6 py-5">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
            Chat
          </h2>
          <p className="mt-1 text-sm leading-5 text-(--color-text-body)">
            Buat janji dan atur pengiriman produk yang dibeli lewat chat.
          </p>
        </div>
        <StatusPill text={activityText} online={sellerOnline} />
      </header>

      <div ref={messagesRef} className="flex h-[320px] flex-col gap-3 overflow-y-auto px-6 py-4">
        <p className="text-center text-xs text-(--color-text-subdued)">
          Mohon untuk tidak berikan data pribadi seperti nomor HP atau alamat.
        </p>
        <p className="text-center text-xs font-semibold text-(--color-text-subdued)">
          Hari ini
        </p>
        {historyLoading && <ChatSkeleton />}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {(authError || sendError) && (
          <p
            role="alert"
            className="rounded-lg bg-(--color-bg-subtle) px-3 py-2 text-xs text-(--color-promotion)"
          >
            {authError ?? sendError}
          </p>
        )}
      </div>

      <ChatComposer
        draft={draft}
        onDraftChange={setDraft}
        canSend={chatConnected && draft.trim().length > 0 && !sending}
        sending={sending}
        onSend={handleSend}
      />
    </section>
  );
}

function StatusPill({ text, online }: { text: string; online: boolean }) {
  if (online) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
        <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
        {text}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-(--color-bg-subtle) px-2 py-1 text-xs font-semibold text-(--color-text-subdued)">
      <span aria-hidden="true" className="size-2 rounded-full bg-(--color-text-subdued)" />
      {text}
    </span>
  );
}

function ChatSkeleton() {
  // Alternating left/right shimmer bubbles while fetchMessages is in flight.
  return (
    <div aria-hidden="true" className="flex flex-col gap-3" data-testid="chat-skeleton">
      <div className="max-w-[60%] animate-pulse self-start rounded-2xl bg-(--color-bg-subtle) px-4 py-4">
        <div className="h-3 w-32 rounded bg-(--color-border)" />
      </div>
      <div className="max-w-[55%] animate-pulse self-end rounded-2xl bg-(--color-bg-subtle) px-4 py-4">
        <div className="h-3 w-24 rounded bg-(--color-border)" />
      </div>
      <div className="max-w-[70%] animate-pulse self-start rounded-2xl bg-(--color-bg-subtle) px-4 py-5">
        <div className="h-3 w-48 rounded bg-(--color-border)" />
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.author === "system") {
    return (
      <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm border-l-2 border-(--color-border) bg-(--color-bg-subtle) px-4 py-3 text-sm leading-5 text-(--color-text-body)">
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className="mt-1 text-right text-xs text-(--color-text-subdued)">
          {message.timestamp}
        </p>
      </div>
    );
  }

  const isBuyer = message.authoredByBuyer;
  return (
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-5 ${
        isBuyer
          ? "self-end bg-(--color-brand) text-white"
          : "self-start border border-(--color-border-low) bg-white text-(--color-text-body)"
      }`}
    >
      <p className="whitespace-pre-wrap">{message.text}</p>
      <p
        className={`mt-1 text-right text-xs ${
          isBuyer ? "text-white/70" : "text-(--color-text-subdued)"
        }`}
      >
        {message.timestamp}
      </p>
    </div>
  );
}

function ChatComposer({
  draft,
  onDraftChange,
  canSend,
  sending,
  onSend,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
  canSend: boolean;
  sending: boolean;
  onSend: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSend();
      }}
      className="flex items-center gap-3 border-t border-(--color-border-low) px-6 py-4"
    >
      <button
        type="button"
        aria-label="Lampirkan berkas"
        className="text-(--color-text-subdued) transition hover:text-(--color-text-body)"
      >
        <PaperclipIcon className="size-5" />
      </button>
      <input
        type="text"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder="Ketik pesan di sini"
        className="h-11 flex-1 rounded-2xl border border-(--color-border) bg-white px-3 text-sm text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none focus:border-(--color-brand)"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Kirim pesan"
        className="flex size-10 items-center justify-center rounded-full bg-(--color-brand) text-white transition hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-40"
      >
        {sending ? <DotsIcon className="size-5" /> : <SendIcon className="size-5" />}
      </button>
    </form>
  );
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
