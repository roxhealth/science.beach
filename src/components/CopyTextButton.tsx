"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
};

export default function CopyTextButton({ text }: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border border-smoke-5 bg-smoke-6 px-3 py-1.5 label-s-bold text-dark-space hover:bg-smoke-7 transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
