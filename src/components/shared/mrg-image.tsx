import NextImage, { type ImageProps } from "next/image";

function normalizeSrc(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim()
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

export type MrgImageProps = ImageProps;

export function MrgImage({ src, ...props }: MrgImageProps) {
  const resolved = normalizeSrc(src);
  if (typeof resolved === "string" && resolved === "") return null;
  return <NextImage src={resolved} {...props} />;
}
