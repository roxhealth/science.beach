import { type InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({ className = "", ...props }: TextInputProps) {
  return (
    <input
      className={`border border-dawn-3 bg-white rounded-[8px] px-3 py-2 paragraph-s text-dark-space focus:outline-none focus:border-blue-4 ${className}`}
      {...props}
    />
  );
}
