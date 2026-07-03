"use client";

import NextImage, { type ImageProps } from "next/image";
import { memo, useState } from "react";

import { IMAGE_HOSTS } from "@/lib/image-hosts";

function forceHttps(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  return trimmed;
}

function isOptimizableHost(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return true;
  if (src.startsWith("/")) return true;
  try {
    return IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

export type MrgImageProps = ImageProps;

function MrgImageBase({ src, className, fill, unoptimized, quality, ...props }: MrgImageProps) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const resolved = forceHttps(src);
  if (typeof resolved === "string" && resolved === "") return null;

  const key = typeof resolved === "string" ? resolved : "static";
  const isLoaded = loadedKey === key;
  const done = () => setLoadedKey(key);

  // Cross-fade the skeleton out and the image in instead of an abrupt swap —
  // an instant unmount of the pulsing skeleton reads as a glitch/pop, especially
  // right after a modal/sheet-open transition.
  const skeleton = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 bg-(--color-bg-subtle) transition-opacity duration-300 ${
        isLoaded ? "opacity-0" : "animate-pulse opacity-100"
      }`}
    />
  );

  const image = (
    <NextImage
      src={resolved}
      fill={fill}
      className={`${className ?? ""} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      quality={quality ?? 75}
      unoptimized={unoptimized ?? !isOptimizableHost(resolved)}
      {...props}
      onLoad={done}
      onError={done}
    />
  );

  if (fill) {
    return (
      <span className="absolute inset-0">
        {image}
        {skeleton}
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      {image}
      {skeleton}
    </span>
  );
}

export const MrgImage = memo(MrgImageBase);
