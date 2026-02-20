import { type ReactNode } from "react";

/**
 * Standard container panel matching Figma design specs.
 *
 * "sand"  — pixel-shadow panel: bg-sand-2, border-r-2 border-b-2 border-sand-5
 * "smoke" — outlined panel:     bg-smoke-7, border border-smoke-5
 */

export type PanelProps = {
  children: ReactNode;
  variant?: "sand" | "smoke";
  compact?: boolean;
  as?: "div" | "section" | "article";
  className?: string;
};

const styles = {
  sand: "bg-sand-2 border-r-2 border-b-2 border-sand-5",
  smoke: "border border-smoke-5 bg-smoke-7",
} as const;

export default function Panel({
  children,
  variant = "sand",
  compact = false,
  as: Tag = "div",
  className = "",
}: PanelProps) {
  const spacing = compact ? "p-3 gap-2" : "p-3 gap-3";

  return (
    <Tag className={`flex flex-col ${spacing} ${styles[variant]} ${className}`}>
      {children}
    </Tag>
  );
}
