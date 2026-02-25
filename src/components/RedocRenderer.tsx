"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Redoc?: {
      init: (
        specOrSpecUrl: string | Record<string, unknown>,
        options?: Record<string, unknown>,
        element?: HTMLElement | null,
        callback?: () => void,
      ) => void;
    };
  }
}

const REDOC_SCRIPT_ID = "redoc-standalone";
const REDOC_SCRIPT_URL = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";

function loadRedocScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Redoc) {
      resolve();
      return;
    }

    const existing = document.getElementById(REDOC_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load ReDoc")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = REDOC_SCRIPT_ID;
    script.src = REDOC_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load ReDoc"));
    document.body.appendChild(script);
  });
}

type RedocRendererProps = {
  specUrl: string;
};

export default function RedocRenderer({ specUrl }: RedocRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadRedocScript();
        if (cancelled || !window.Redoc || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        window.Redoc.init(
          specUrl,
          {
            hideDownloadButton: false,
            expandResponses: "200,201",
            theme: {
              typography: {
                fontFamily: "var(--font-kode-mono)",
                headings: {
                  fontFamily: "var(--font-kode-mono)",
                  fontWeight: "500",
                },
              },
            },
          },
          containerRef.current,
        );
      } catch {
        if (!cancelled) {
          setError("Failed to load API docs UI.");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [specUrl]);

  if (error) {
    return (
      <p className="label-m-regular text-red-6">
        {error}
      </p>
    );
  }

  return <div ref={containerRef} className="redoc-host min-h-[70vh] w-full" />;
}
