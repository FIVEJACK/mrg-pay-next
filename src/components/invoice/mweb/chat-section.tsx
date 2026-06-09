"use client";

import { useEffect, useRef, useState } from "react";

import {
  ChatBubble,
  ChatComposer,
  ChatSkeleton,
} from "@/components/invoice/chat-panel";
import { useChat } from "@/components/invoice/use-chat";

type ChatSectionProps = {
  orderId: number;
  buyerId: string;
  sellerId: number;
  buyerName?: string;
  /** Display name of the counterparty shown in the chat sheet header. */
  sellerName?: string;
};

/**
 * Mobile (mweb) chat. Shows a collapsed preview (last message + a "Balas chat"
 * button) inline on the invoice page; tapping "Balas chat" opens the full chat
 * as a slide-up sheet with the composer. One {@link useChat} connection backs
 * both views, so messages and the unread count stay in sync.
 */
export function ChatSection({
  orderId,
  buyerId,
  sellerId,
  buyerName,
  sellerName = "Penjual",
}: ChatSectionProps) {
  const chat = useChat({ orderId, buyerId, sellerId, buyerName });
  const { messages } = chat;

  const [open, setOpen] = useState(false);
  // Unread = inbound messages (system + seller) not yet viewed in the sheet.
  const [seen, setSeen] = useState(0);
  const inbound = messages.filter((m) => !m.authoredByBuyer).length;
  const unread = open ? 0 : Math.max(0, inbound - seen);

  function openSheet() {
    setOpen(true);
  }
  function closeSheet() {
    setSeen(inbound);
    setOpen(false);
  }

  // Keep the preview body a fixed height (matching the Figma chat section) and
  // anchor it to the latest message, so it doesn't grow with the conversation.
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = previewRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <section className="flex w-full flex-col bg-white">
      <header className="border-b border-(--color-border-low) px-4 py-4">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Chat
        </h2>
      </header>

      <div
        ref={previewRef}
        className="flex h-[232px] flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        <p className="text-center text-xs leading-4 text-(--color-text-subdued)">
          Mohon untuk tidak berikan data pribadi seperti nomor HP atau alamat.
        </p>
        <p className="text-center text-xs font-semibold text-(--color-text-subdued)">
          Hari ini
        </p>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>

      <div className="border-t border-(--color-border-low) px-4 py-4">
        <button
          type="button"
          onClick={openSheet}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-(--color-brand) px-5 py-3 font-[family-name:var(--font-heading)] text-sm font-bold leading-5 text-white transition hover:bg-(--color-brand-hover)"
        >
          <ChatIcon className="size-5" />
          Balas chat
          {unread > 0 && (
            <span className="flex size-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-(--color-brand) px-1 text-xs leading-none">
              {unread}
            </span>
          )}
        </button>
      </div>

      {open && (
        <ChatSheet sellerName={sellerName} chat={chat} onClose={closeSheet} />
      )}
    </section>
  );
}

function ChatSheet({
  sellerName,
  chat,
  onClose,
}: {
  sellerName: string;
  chat: ReturnType<typeof useChat>;
  onClose: () => void;
}) {
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
  } = chat;

  // Auto-scroll to the latest bubble on open and whenever messages change.
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="animate-slide-up fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true">
      <header className="flex items-center gap-3 border-b border-(--color-border-low) px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Kembali"
          className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-full text-(--color-text-title) hover:bg-(--color-bg-subtle)"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              d="M15 19l-7-7 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="font-[family-name:var(--font-heading)] truncate text-base font-bold leading-5 text-(--color-text-title)">
          {sellerName}
        </p>
      </header>

      <div ref={messagesRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-xs leading-4 text-(--color-text-subdued)">
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
    </div>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
