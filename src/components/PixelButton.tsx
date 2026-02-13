import { type ButtonHTMLAttributes } from "react";

type ColorToken =
  | "blue-2"
  | "blue-4"
  | "blue-5"
  | "green-2"
  | "green-3"
  | "green-4"
  | "green-5"
  | "light-space"
  | "orange-1"
  | "smoke-5"
  | "smoke-6"
  | "smoke-7";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  bg: ColorToken;
  textColor: ColorToken;
  shadowColor: ColorToken;
  textShadowTop: ColorToken;
  textShadowBottom: ColorToken;
};

const BG_CLASS_MAP: Record<ColorToken, string> = {
  "blue-2": "bg-blue-2",
  "blue-4": "bg-blue-4",
  "blue-5": "bg-blue-5",
  "green-2": "bg-green-2",
  "green-3": "bg-green-3",
  "green-4": "bg-green-4",
  "green-5": "bg-green-5",
  "light-space": "bg-light-space",
  "orange-1": "bg-orange-1",
  "smoke-5": "bg-smoke-5",
  "smoke-6": "bg-smoke-6",
  "smoke-7": "bg-smoke-7",
};

const TEXT_CLASS_MAP: Record<ColorToken, string> = {
  "blue-2": "text-blue-2",
  "blue-4": "text-blue-4",
  "blue-5": "text-blue-5",
  "green-2": "text-green-2",
  "green-3": "text-green-3",
  "green-4": "text-green-4",
  "green-5": "text-green-5",
  "light-space": "text-light-space",
  "orange-1": "text-orange-1",
  "smoke-5": "text-smoke-5",
  "smoke-6": "text-smoke-6",
  "smoke-7": "text-smoke-7",
};

const SHADOW_CLASS_MAP: Record<ColorToken, string> = {
  "blue-2": "shadow-[0px_4px_0px_0px_var(--blue-2)]",
  "blue-4": "shadow-[0px_4px_0px_0px_var(--blue-4)]",
  "blue-5": "shadow-[0px_4px_0px_0px_var(--blue-5)]",
  "green-2": "shadow-[0px_4px_0px_0px_var(--green-2)]",
  "green-3": "shadow-[0px_4px_0px_0px_var(--green-3)]",
  "green-4": "shadow-[0px_4px_0px_0px_var(--green-4)]",
  "green-5": "shadow-[0px_4px_0px_0px_var(--green-5)]",
  "light-space": "shadow-[0px_4px_0px_0px_var(--light-space)]",
  "orange-1": "shadow-[0px_4px_0px_0px_var(--orange-1)]",
  "smoke-5": "shadow-[0px_4px_0px_0px_var(--smoke-5)]",
  "smoke-6": "shadow-[0px_4px_0px_0px_var(--smoke-6)]",
  "smoke-7": "shadow-[0px_4px_0px_0px_var(--smoke-7)]",
};

const TEXT_SHADOW_CLASS_MAP: Record<string, string> = {
  "smoke-5/smoke-7": "[text-shadow:0px_-1px_0px_var(--smoke-5),0px_1px_0px_var(--smoke-7)]",
  "green-3/green-5": "[text-shadow:0px_-1px_0px_var(--green-3),0px_1px_0px_var(--green-5)]",
  "blue-2/blue-5": "[text-shadow:0px_-1px_0px_var(--blue-2),0px_1px_0px_var(--blue-5)]",
};

export default function PixelButton({
  bg,
  textColor,
  shadowColor,
  textShadowTop,
  textShadowBottom,
  children,
  className = "",
  ...props
}: PixelButtonProps) {
  const textShadowKey = `${textShadowTop}/${textShadowBottom}`;
  return (
    <button
      className={`flex h-8 items-center justify-center px-2.5 text-sm font-bold leading-[0.9] active:translate-y-[2px] ${BG_CLASS_MAP[bg]} ${TEXT_CLASS_MAP[textColor]} ${SHADOW_CLASS_MAP[shadowColor]} ${TEXT_SHADOW_CLASS_MAP[textShadowKey] ?? ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
