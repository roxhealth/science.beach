import type { ReactNode } from "react";

export default function SectionHeading({
  children,
  className = "",
  variant = "sand",
  size = "sm",
}: {
  children: ReactNode;
  className?: string;
  variant?: "sand" | "white";
  size?: "sm" | "lg";
}) {
  const bgStyles =
    variant === "white"
      ? "border-2 border-sand-3 bg-sand-1 rounded-[2px]"
      : "border-2 border-sand-4 bg-sand-2 rounded-[2px]";

  const textStyles =
    size === "lg"
      ? "font-kode-mono font-bold text-[24px] leading-[1.4] text-sand-6"
      : "font-ibm-bios text-[12px] leading-[1.4] tracking-[-0.48px] text-sand-6 text-shadow-section-heading";

  const Tag = size === "lg" ? "div" : "p";

  return (
    <div className={`${bgStyles} px-4 py-3 ${className}`}>
      <Tag className={textStyles}>
        {children}
      </Tag>
    </div>
  );
}
