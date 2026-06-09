"use client";

import { useEffect, useRef } from "react";

import { DotsIcon, PaperclipIcon, SendIcon } from "@/components/icon";
import { HtmlContent } from "@/components/shared/html-content";

import { useChat, type ChatAttachment, type ChatMessage } from "./use-chat";

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
    attaching,
    handleSendFile,
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
        onAttach={handleSendFile}
        canAttach={chatConnected}
        attaching={attaching}
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

// Sanitized message bodies are HTML, so style the rendered elements here:
// Tailwind's preflight strips heading/link defaults, and the source markup is
// indented (no `whitespace-pre-wrap`, which would surface that as gaps).
const CHAT_HTML_CLASS =
  "wrap-break-word [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:leading-6 [&_h2]:text-(--color-text-title) [&_p]:my-0.5 [&_a]:font-semibold [&_a]:text-(--color-cyan-50) [&_a]:underline";

function ChatBubbleBody({ message }: { message: ChatMessage }) {
  return (
    <>
      {message.attachment && <ChatAttachmentView attachment={message.attachment} />}
      {message.text && (
        <HtmlContent
          data={message.text}
          draggable={false}
          allowedTags={["a", "iframe"]}
          className={CHAT_HTML_CLASS}
        />
      )}
      <p className="mt-1 text-right text-xs text-(--color-text-subdued)">
        {message.timestamp}
      </p>
    </>
  );
}

function ChatAttachmentView({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mb-1 block">
        {/* PubNub file URLs aren't a configured next/image host, so use a plain img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-60 w-auto max-w-full rounded-lg object-cover"
        />
      </a>
    );
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-1 flex items-center gap-2 font-semibold text-(--color-cyan-50) underline"
    >
      <PaperclipIcon className="size-4 shrink-0" />
      <span className="wrap-break-word">{attachment.name}</span>
    </a>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.author === "system") {
    return (
      <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-(--color-surface-focus) px-4 py-3 text-sm leading-5 text-(--color-text-body)">
        <ChatBubbleBody message={message} />
      </div>
    );
  }

  const isBuyer = message.authoredByBuyer;
  return (
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-5 text-(--color-text-body) ${
        isBuyer
          ? "self-end bg-(--color-surface-focus)"
          : "self-start border border-(--color-border-low) bg-white"
      }`}
    >
      <ChatBubbleBody message={message} />
    </div>
  );
}

export function ChatComposer({
  draft,
  onDraftChange,
  canSend,
  sending,
  onSend,
  onAttach,
  canAttach,
  attaching,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
  canSend: boolean;
  sending: boolean;
  onSend: () => void;
  onAttach: (file: File) => void;
  canAttach: boolean;
  attaching: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSend();
      }}
      className="flex items-center gap-3 border-t border-(--color-border-low) px-6 py-4"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAttach(file);
          // Reset so picking the same file again still fires onChange.
          e.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label="Lampirkan gambar"
        disabled={!canAttach || attaching}
        onClick={() => fileInputRef.current?.click()}
        className="text-(--color-text-subdued) transition hover:text-(--color-text-body) disabled:cursor-not-allowed disabled:opacity-40"
      >
        {attaching ? <DotsIcon className="size-5" /> : <PaperclipIcon className="size-5" />}
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
