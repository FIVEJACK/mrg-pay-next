"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

function normalizeSrc(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

export type MrgImageProps = ImageProps;

export function MrgImage({ src, className, fill, ...props }: MrgImageProps) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const resolved = normalizeSrc(src);
  if (typeof resolved === "string" && resolved === "") return null;

  const key = typeof resolved === "string" ? resolved : "static";
  const isLoaded = loadedKey === key;
  const done = () => setLoadedKey(key);

  const skeleton = isLoaded ? null : (
    <span aria-hidden="true" className="absolute inset-0 z-10 animate-pulse bg-(--color-bg-subtle)" />
  );

  if (fill) {
    return (
      <span className="absolute inset-0">
        <NextImage
          src={resolved}
          fill
          className={className}
          {...props}
          onLoad={done}
          onError={done}
        />
        {skeleton}
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <NextImage
        src={resolved}
        className={className}
        {...props}
        onLoad={done}
        onError={done}
      />
      {skeleton}
    </span>
  );
}
