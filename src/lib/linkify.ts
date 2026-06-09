// URL match: absolute http(s) links and bare `www.` hosts, stopping before
// trailing punctuation so "see www.x.com." doesn't swallow the period.
const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]}'"])/gi;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeText(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

/**
 * Turn a plain-text message into safe HTML: escape everything, preserve line
 * breaks, and wrap any URLs in `<a target="_blank" rel="noopener noreferrer">`.
 * The result is still passed through DOMPurify at render time.
 */
export function linkify(text: string): string {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = match[0];
    const start = match.index ?? 0;
    html += escapeText(text.slice(last, start));
    const href = url.toLowerCase().startsWith("www.") ? `https://${url}` : url;
    html += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
    last = start + url.length;
  }
  html += escapeText(text.slice(last));
  return html;
}
