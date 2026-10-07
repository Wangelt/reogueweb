"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full border bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone-deep focus:border-foreground ${
          error ? "border-red-500" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
