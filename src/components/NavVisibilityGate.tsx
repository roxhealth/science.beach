"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PATH_PREFIXES = ["/docs"];

export default function NavVisibilityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const hideNavbar = HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hideNavbar) {
    return null;
  }

  return <>{children}</>;
}
