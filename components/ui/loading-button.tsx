"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type LoadingButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "primary" | "secondary" | "danger";
  }
>;

const variantClassMap = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export default function LoadingButton({
  children,
  loading = false,
  disabled,
  variant = "primary",
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassMap[variant]} ${className}`}
    >
      {loading ? "処理中..." : children}
    </button>
  );
}