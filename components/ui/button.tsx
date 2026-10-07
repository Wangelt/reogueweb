"use client";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/85 active:bg-foreground/70",
  secondary:
    "border border-line bg-background hover:bg-stone/30 active:bg-stone/50",
  ghost: "hover:bg-stone/30 active:bg-stone/50",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

export function Button({
  variant = "primary",
  loading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
