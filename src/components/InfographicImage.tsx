"use client";

import { useState, useCallback, useEffect } from "react";

type InfographicImageProps = {
  src: string;
  alt: string;
  caption?: string | null;
};

export default function InfographicImage({ src, alt, caption }: InfographicImageProps) {
  const [expanded, setExpanded] = useState(false);

  const close = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, close]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="relative w-full border-2 border-sand-4 overflow-hidden cursor-zoom-in"
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto"
            style={{ imageRendering: "pixelated" }}
            loading="lazy"
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
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[85vh] object-contain"
              style={{ imageRendering: "pixelated" }}
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
