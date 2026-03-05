"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HIDDEN_PATH_PREFIXES = ["/docs"];
const FULL_WIDTH_PREFIXES = ["/profile/"];

export default function NavVisibilityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const hideNavbar = HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isFullWidth = FULL_WIDTH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    document.body.classList.toggle("home-page", pathname === "/");
  }, [pathname]);

  if (hideNavbar) {
    return null;
  }

  return <div data-nav-width={isFullWidth ? "full" : undefined}>{children}</div>;
}
