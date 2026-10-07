type Variant = "default" | "success" | "warning" | "error" | "info";

const variantClass: Record<Variant, string> = {
  default: "bg-stone text-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({
  variant = "default",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
