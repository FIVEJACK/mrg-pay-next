"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DotsIcon, PaperclipIcon, SendIcon, XIcon } from "@/components/icon";
import { HtmlContent } from "@/components/shared/html-content";
import { getSellerActivity } from "@/lib/format-activity";

import { useChat, type ChatAttachment, type ChatMessage } from "./use-chat";

type ChatPanelProps = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
  paidAt?: string | null;
  /**
   * Mobile (mweb) full-bleed treatment: a flush white section instead of a
   * rounded bordered card on the page background.
   */
  bare?: boolean;
};

export function ChatPanel({ orderId, buyerId, sellerId, buyerName, paidAt, bare }: ChatPanelProps) {
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
    sellerLastActivity,
  } = useChat({ orderId, buyerId, sellerId, buyerName, paidAt });

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
      <header className="flex items-start justify-between gap-3 border-b border-(--color-border-low) px-6 py-5">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
            Chat
          </h2>
          <p className="mt-1 text-sm leading-5 text-(--color-text-body)">
            Buat janji dan atur pengiriman produk yang dibeli lewat chat.
          </p>
        </div>
        <SellerStatusPill lastActivity={sellerLastActivity} />
      </header>

      <div ref={messagesRef} className="flex h-[320px] flex-col gap-3 overflow-y-auto px-6 py-4">
        <p className="text-center text-xs text-(--color-text-subdued)">
          Mohon untuk tidak berikan data pribadi seperti nomor HP atau alamat.
        </p>
        <p className="text-center text-xs font-semibold text-(--color-text-subdued)">
          Hari ini
        </p>
        {historyLoading && <ChatSkeleton />}
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            showSenderName={shouldShowSenderName(messages, i)}
          />
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

/**
 * Seller presence pill for the chat header: green "Online" when active within
 * 10 minutes, otherwise a muted "X Menit/Jam/Hari Lalu" relative-time chip.
 */
export function SellerStatusPill({ lastActivity }: { lastActivity?: string | null }) {
  const { online, label } = getSellerActivity(lastActivity);
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full py-px pl-1 pr-2 text-sm leading-5 ${
        online ? "bg-[#35c092] text-white" : "bg-(--color-bg-subtle) text-(--color-text-subdued)"
      }`}
    >
      <span
        className={`size-2.5 shrink-0 rounded-full ${online ? "bg-white" : "bg-(--color-text-subdued)"}`}
      />
      {label}
    </span>
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

/** Branded display name for the partner/seller side of the conversation. */
export const PARTNER_NAME = "Partner Lapakgaming";

/**
 * Whether the seller bubble at `index` should show the sender name + verified
 * badge. Shown on the first bubble of each consecutive run of seller messages
 * (the system greeting counts as a seller message, so it shows the name too),
 * never on the buyer's own bubbles.
 */
export function shouldShowSenderName(messages: ChatMessage[], index: number): boolean {
  const msg = messages[index];
  if (!msg || msg.authoredByBuyer) return false;
  const prev = messages[index - 1];
  const prevIsSeller = prev != null && !prev.authoredByBuyer;
  return !prevIsSeller;
}

// Sanitized message bodies are HTML, so style the rendered elements here:
// Tailwind's preflight strips heading/link defaults, and the source markup is
// indented (no `whitespace-pre-wrap`, which would surface that as gaps).
const CHAT_HTML_CLASS =
  "wrap-break-word [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:leading-6 [&_h2]:text-(--color-text-title) [&_p]:my-0.5 [&_a]:font-semibold [&_a]:text-(--color-cyan-50) [&_a]:underline";

function ChatMessageBody({ message }: { message: ChatMessage }) {
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
    </>
  );
}

function ChatAttachmentView({ attachment }: { attachment: ChatAttachment }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  if (attachment.isImage) {
    return (
      <>
        <button
          type="button"
          aria-label={`Lihat gambar ${attachment.name}`}
          onClick={() => setPreviewOpen(true)}
          className="mb-1 block cursor-zoom-in"
        >
          {/* PubNub file URLs aren't a configured next/image host, so use a plain img. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-h-60 w-auto max-w-full rounded-lg object-cover"
          />
        </button>
        {previewOpen && (
          <ImageLightbox attachment={attachment} onClose={() => setPreviewOpen(false)} />
        )}
      </>
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

/**
 * Fullscreen preview for a clicked chat image. `z-60` so it layers above the
 * mweb chat sheet, which is itself a fullscreen `z-50` dialog.
 */
function ImageLightbox({
  attachment,
  onClose,
}: {
  attachment: ChatAttachment;
  onClose: () => void;
}) {
  // ESC closes; body scroll is locked while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={attachment.name}
      onClick={(e) => {
        // Click on the backdrop (this wrapper) closes; clicks on the image or
        // the close button are ignored here.
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute right-4 top-4 text-white/80 transition hover:text-white"
      >
        <XIcon className="size-7" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attachment.url}
        alt={attachment.name}
        className="animate-fade-in-scale max-h-full max-w-full rounded-lg object-contain"
      />
    </div>,
    document.body,
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="#1111A8" />
      <path
        d="M6.4 10.3l2.3 2.3 4.6-4.9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 8.5l3 3 6-7" />
      <path d="M7.5 11.5l.6.6 6-7" />
    </svg>
  );
}

export function ChatBubble({
  message,
  showSenderName,
}: {
  message: ChatMessage;
  showSenderName?: boolean;
}) {
  if (message.authoredByBuyer) {
    return (
      <div className="flex max-w-[85%] flex-col self-end rounded-2xl rounded-br-sm bg-[#d9e2fc] px-3 py-2 text-sm leading-5 text-(--color-text-secondary)">
        <ChatMessageBody message={message} />
        <div className="mt-1 flex items-center justify-end gap-1 text-(--color-text-subdued)">
          <span className="text-[11px] leading-[14px]">{message.timestamp}</span>
          <DoubleCheckIcon className="size-4" />
        </div>
      </div>
    );
  }

  // System greeting and partner replies share the grey left bubble; partner
  // replies show the sender name on the first bubble of a run.
  return (
    <div className="flex max-w-[85%] flex-col gap-1 self-start rounded-2xl rounded-bl-sm bg-(--color-bg-subtle) px-3 py-2 text-sm leading-5 text-(--color-text-secondary)">
      {showSenderName && (
        <div className="flex items-center gap-1">
          <span className="font-[family-name:var(--font-heading)] text-sm font-bold leading-5 text-(--color-text-title)">
            {PARTNER_NAME}
          </span>
          <VerifiedBadge className="size-4 shrink-0" />
        </div>
      )}
      <ChatMessageBody message={message} />
      <p className="text-right text-[11px] leading-[14px] text-(--color-text-subdued)">
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
