"use client";

import { useEffect, useRef } from "react";

import { DotsIcon, PaperclipIcon, SendIcon } from "@/components/icon";

import { useChat, type ChatMessage } from "./use-chat";

type ChatPanelProps = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
  /**
   * Mobile (mweb) full-bleed treatment: a flush white section instead of a
   * rounded bordered card on the page background.
   */
  bare?: boolean;
};

export function ChatPanel({ orderId, buyerId, sellerId, buyerName, bare }: ChatPanelProps) {
  const {
    messages,
    draft,
    setDraft,
    sending,
    handleSend,
    chatConnected,
    historyLoading,
    authError,
    sendError,
  } = useChat({ orderId, buyerId, sellerId, buyerName });

  // Auto-scroll the messages container to the latest bubble whenever messages
  // change (history load, live receive, or local send all push into the same
  // `messages` array).
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <section
      className={`flex w-full flex-col bg-white ${
        bare ? "" : "rounded-2xl border border-(--color-border-low)"
      }`}
    >
      <header className="border-b border-(--color-border-low) px-6 py-5">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Chat
        </h2>
        <p className="mt-1 text-sm leading-5 text-(--color-text-body)">
          Buat janji dan atur pengiriman produk yang dibeli lewat chat.
        </p>
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

export function ChatSkeleton() {
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

export function ChatBubble({ message }: { message: ChatMessage }) {
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

export function ChatComposer({
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
