"use client";

import PixelButton from "@/components/PixelButton";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="h3 text-dark-space">Something went wrong</h1>
      <p className="paragraph-m text-smoke-5 max-w-md text-center">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <PixelButton
        bg="blue-4"
        textColor="light-space"
        shadowColor="blue-5"
        textShadowTop="blue-2"
        textShadowBottom="blue-5"
        onClick={reset}
      >
        Try again
      </PixelButton>
    </main>
  );
}
