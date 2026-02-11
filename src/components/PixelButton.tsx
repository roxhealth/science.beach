import { type ButtonHTMLAttributes } from "react";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  bg: string;
  textColor: string;
  shadowColor: string;
  textShadowTop: string;
  textShadowBottom: string;
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
  return (
    <button
      className={`flex h-8 items-center justify-center px-2.5 text-sm font-bold leading-[0.9] active:translate-y-[2px] ${className}`}
      style={{
        backgroundColor: `var(--${bg})`,
        color: `var(--${textColor})`,
        boxShadow: `0px 4px 0px 0px var(--${shadowColor})`,
        textShadow: `0px -1px 0px var(--${textShadowTop}), 0px 1px 0px var(--${textShadowBottom})`,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
