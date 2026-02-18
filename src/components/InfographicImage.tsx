"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type InfographicImageProps = {
  src: string;
  alt: string;
  caption?: string | null;
  variant?: "feed" | "full";
};

function toThumbUrl(src: string): string {
  return src.replace(/\.png(\?.*)?$/, "_thumb.webp$1");
}

export default function InfographicImage({
  src,
  alt,
  caption,
  variant = "full",
}: InfographicImageProps) {
  const [expanded, setExpanded] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [fullReady, setFullReady] = useState(variant === "full");
  const preloaded = useRef(false);

  const close = useCallback(() => setExpanded(false), []);

  // Preload full-res in the background once the thumbnail is visible
  useEffect(() => {
    if (variant !== "feed" || preloaded.current) return;
    preloaded.current = true;
    const img = new Image();
    img.src = src;
    img.onload = () => setFullReady(true);
  }, [variant, src]);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, close]);

  // Feed variant tries thumbnail first; falls back to full-res on 404
  const inlineSrc = variant === "feed" && !thumbFailed ? toThumbUrl(src) : src;

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="relative w-full border-2 border-sand-4 overflow-hidden cursor-zoom-in"
        >
          <img
            src={inlineSrc}
            alt={alt}
            className="w-full h-auto"
            style={{ imageRendering: "pixelated" }}
            loading="lazy"
            decoding="async"
            onError={
              variant === "feed" && !thumbFailed
                ? () => setThumbFailed(true)
                : undefined
            }
          />
        </button>
        {caption && (
          <p className="label-s-regular text-smoke-5">{caption}</p>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-space/80 cursor-zoom-out"
          onClick={close}
        >
          <div className="relative w-[95vw] max-w-[1400px] max-h-[90vh] flex flex-col gap-2">
            {!fullReady && (
              <div className="w-full aspect-video flex items-center justify-center">
                <span className="label-s-regular text-sand-3 animate-pulse">
                  Loading full resolution...
                </span>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              className={`w-full h-auto max-h-[85vh] object-contain transition-opacity duration-200 ${
                fullReady ? "opacity-100" : "opacity-0 absolute"
              }`}
              style={{ imageRendering: "pixelated" }}
              onLoad={() => setFullReady(true)}
            />
            {caption && (
              <p className="label-s-regular text-sand-3 text-center">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
