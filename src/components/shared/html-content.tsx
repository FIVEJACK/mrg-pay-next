"use client";

import type { CSSProperties } from "react";
import DOMPurify from "isomorphic-dompurify";

const allowedAttr: Record<string, string[]> = {
  iframe: ["allow", "allowfullscreen", "frameborder", "scrolling", "referrerpolicy"],
  a: ["target"],
};

// Auto-inject referrerpolicy on iframes (fixes YouTube embed Error 153).
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "IFRAME" && !node.getAttribute("referrerpolicy")) {
    node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  }
});

export type HtmlContentProps = {
  data: string;
  className?: string;
  draggable?: boolean;
  id?: string;
  style?: CSSProperties;
  allowedTags?: string[];
};

export function HtmlContent({
  data = "",
  className,
  draggable = true,
  id,
  style,
  allowedTags,
}: HtmlContentProps) {
  const addAttr = (allowedTags ?? []).flatMap((tag) => allowedAttr[tag] ?? []);
  const clean = DOMPurify.sanitize(data, { ADD_TAGS: allowedTags, ADD_ATTR: addAttr });
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
      draggable={draggable}
      id={id}
      style={style}
    />
  );
}
